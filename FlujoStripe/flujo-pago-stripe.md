# Flujo de pago con Stripe — NORTE tienda

Del carrito a la orden pagada, incluyendo el webhook que confirma la compra.

## Diagrama

```
Carrito (useCart)
  │  POST /api/checkout/quote ──► resumen (subtotal + envío + IGV + total)
  ▼
[Llenar tarjeta] ── CardElement (payment-method-form.tsx)
  │  estado complete compartido por contexto (card-element-context.tsx)
  ▼
[Place Order] ── requiere tarjeta completa (una sola acción de usuario):
  │  visual: botón deshabilitado si !cardComplete
  │  guardia: handleClick retorna sin mutate si !cardComplete
  │  (sin tarjeta completa no se crea orden ni intent)
  │  POST /api/checkout/payment-intent
  │    → valida stock/precios en servidor (lib/checkout-quote.ts)
  │    → crea/reutiliza Orders PENDING_PAYMENT + Payments PENDING + OrderDetails
  │    → crea PaymentIntent en Stripe (metadata.orderId, idempotencyKey = order.id)
  │    ◄── { orderId, clientSecret, total }
  ▼
stripe.confirmCardPayment(clientSecret, { card })   ← AQUÍ SE COBRA (una vez)
  │  maneja 3D Secure automáticamente
  ▼
Stripe emite payment_intent.succeeded
  │  POST /api/webhooks/stripe (lo llama Stripe, no tu código)
  │    → verifica firma (STRIPE_WEBHOOK_SECRET, body crudo)
  │    → Orders PENDING_PAYMENT → PAID
  │    → Payments PENDING → APPROVED + paid_at
  │    → ProductVariants.stock -= quantity (con guarda stock >= qty)
  ▼
Frontend hace polling GET /api/orders/[id] hasta status PAID
  → recién ahí clearCart() + "¡Pago exitoso!"
```

## Fases en detalle

### 0. Carrito — `features/cart/hooks.ts::useCart`

El carrito vive en el cliente. Al pagar se envía vivo como
`[{ variantId, quantity }]`. Precios y stock se resuelven siempre en servidor.

### 1. Cotización (solo lectura) — `POST /api/checkout/quote`

`features/checkout/services/checkout.service.ts::getCheckoutQuote` pide el resumen.
No crea nada ni descuenta stock. Envío plano `9.90` + IGV 18% (`lib/checkout-quote.ts`).
Si una variante no existe, está inactiva o sin stock → `422` con `problems`.

### Paso previo: ingresar tarjeta (antes de pulsar Place Order)

Crear el intent y confirmar son dos llamadas técnicas (Stripe exige el
intent antes de confirmar), pero una sola acción de usuario: primero llena
la tarjeta, recién ahí pulsa Place Order.

- `Elements` en `checkout-content.tsx` (`locale: "es"`) provee el contexto
  de Stripe; `CardElement` se renderiza en `payment-method-form.tsx`.
- `CardElement` no expone `complete` de forma imperativa: la única fuente es
  su `onChange`. Ese flag se comparte por contexto
  (`features/checkout/components/card-element-context.tsx::useCardElementState`):
  el formulario **escribe** (`reportCardChange`) y el botón **lee**
  (`cardComplete` para el `disabled` y la guardia en `handleClick`, que
  retorna con "Completa los datos de tu tarjeta." sin disparar el `mutate`).

### 2. Crear intent + orden — `POST /api/checkout/payment-intent`

`app/api/checkout/payment-intent/route.ts`. Solo al pulsar "Place Order",
y solo si la tarjeta está completa (ver paso previo).

1. Usuario + dirección de prueba (temporal hasta auth).
2. `validateQuoteItems()` + `calculateQuoteTotals()` (misma lógica del quote).
3. Transacción: reutiliza una orden `PENDING_PAYMENT` con el mismo carrito
   o crea `Orders` + `OrderDetails` + `Payments`. Si es reintento, el pago vuelve a `PENDING`.
4. `stripe.paymentIntents.create(
     { amount, currency, metadata: { orderId } },
     { idempotencyKey: order.id }
   )` y guarda `gateway_transaction_id`.
5. Responde `{ orderId, clientSecret, total }`.
**No mueve dinero ni descuenta stock.**

### 3. Confirmar tarjeta (el cobro) — frontend

`features/checkout/components/place-order-button.tsx:96`:

```ts
await stripe.confirmCardPayment(clientSecret, { payment_method: { card } });
```

`CardElement` se renderiza en `payment-method-form.tsx:100` dentro de `Elements`
(`checkout-content.tsx:46`, `locale: "es"`).
Esta promesa **cobra una sola vez** y resuelve el 3D Secure.
Devuelve `{ error, paymentIntent }`: `error` = rechazo inmediato;
`paymentIntent.status === "succeeded"` = cobrado.
El éxito del cliente **no actualiza la DB** (sería falsificable).
Sin tarjeta completa el click ni siquiera llega aquí: ver paso previo
(botón deshabilitado + guardia sin `mutate`).

### 4. Webhook (fuente de verdad) — `POST /api/webhooks/stripe`

`app/api/webhooks/stripe/route.ts:26`. Lo invoca Stripe, no tu código.
Eventos suscritos: `payment_intent.succeeded`, `payment_intent.payment_failed`.

- Verifica firma con `req.text()` crudo + `STRIPE_WEBHOOK_SECRET` (`lib/env.ts`,
  `runtime = "nodejs"`).
- `succeeded` → transacción idempotente (si ya `PAID/APPROVED`, no-op):
  verifica `amount_received == total*100`, descuenta stock con guarda
  `stock >= quantity`, `Payments → APPROVED + paid_at`,
  `Orders → PAID`. Sin stock o monto inconsistente → `CANCELLED`/`REJECTED`.
- `payment_failed` → `Payments → REJECTED + rejection_reason`,
  la orden queda `PENDING_PAYMENT` para reintentar.
  Tablas que **no** se tocan: `OrderDetails` (snapshot), `Users`, `Address`,
  `Products`, `Categories`, `FiscalVouchers` (comprobantes = otro sprint).

### 5. Confirmación visible — polling

`place-order-button.tsx` espera con `waitForOrderPaid()` a
`GET /api/orders/[id] → PAID` (~30 s). Solo entonces `clearCart()` y éxito.
Tres desenlaces: `PAID` → éxito y carrito vaciado; `CANCELLED` →
"El pago no pudo completarse. Revisa tu carrito."; timeout →
"Pago recibido, la confirmación está tardando." (carrito conservado).

## Reconciliación / debugging

- `Payments PENDING` **no** significa "no se cobró": la DB solo la mueve el
  webhook. Fuente de verdad del dinero = Dashboard Stripe filtrando Payments
  por `metadata.orderId`.
- Si el intent está `succeeded` pero la orden sigue `PENDING`: el evento no
  entró (túnel `listen` caído, ruta o `whsec_...` incorrecto). Con el `listen`
  corriendo, reenvía `payment_intent.succeeded` (Resend o
  `stripe events resend evt_...`): el webhook es idempotente y marca
  `PAID`/`APPROVED` sin volver a cobrar.
- No re-clicar Place Order a ciegas tras un timeout: el segundo intento
  reutiliza la orden (`idempotencyKey = order.id`) y Stripe puede devolver el
  intent ya cobrado, que no se puede reconfirmar ("error de procesamiento").
  Cada intent nuevo es un posible cargo nuevo: verifica primero que haya un
  solo `pi_...` para ese `orderId`; si hay dos `succeeded`, toca reembolsar uno.

## Estados

| Tabla                   | Antes             | Éxito                  | Fallo                                |
| ----------------------- | ----------------- | ---------------------- | ------------------------------------ |
| `Orders.status`         | `PENDING_PAYMENT` | `PAID`                 | sigue `PENDING` (cron → `CANCELLED`) |
| `Payments.status`       | `PENDING`         | `APPROVED` + `paid_at` | `REJECTED` + `rejection_reason`      |
| `ProductVariants.stock` | intacto           | `stock - qty`          | intacto                              |

## Probar en local

### Instalar Stripe CLI (solo dev, no va en `package.json`)

Binario para reenviar eventos a `localhost`. En Debian/Ubuntu:

```bash
curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public \
  | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] \
  https://packages.stripe.dev/stripe-cli-debian-local stable main" \
  | sudo tee -a /etc/apt/sources.list.d/stripe.list
sudo apt update && sudo apt install stripe
stripe login
```

Alternativas: tarball de
[releases](https://github.com/stripe/stripe-cli/releases) (cualquier distro),
`npm i -g @stripe/cli@latest`, o sin instalar con
`pnpm dlx @stripe/cli@latest listen --forward-to ...`.

### Escuchar el webhook

```bash
pnpm dev
stripe listen --events payment_intent.succeeded,payment_intent.payment_failed --forward-to localhost:3000/api/webhooks/stripe
```

`whsec_...` del listen → `.env` (`STRIPE_WEBHOOK_SECRET`) + reiniciar dev.
Tarjetas: `4242 4242 4242 4242` (éxito), `4000 0000 0000 3220` (3DS),
`4000 0000 0000 9995` (fondos insuficientes), `4000 0000 0000 0002` (rechazo).
Reenviar evento: Dashboard → Developers → Eventos → `payment_intent.succeeded` → Resend,
o `stripe events resend evt_...` con el listen corriendo.

## Producción

Registrar `https://tu-dominio.com/api/webhooks/stripe` en Dashboard con los 2 eventos
y poner su `whsec_...` en las env vars del hosting. El CLI no se despliega
ni va en `package.json`.
