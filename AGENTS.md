# Agents.md

## 📋 Propósito
NORTE es una plataforma de e-commerce enfocado a un público de 20 a 40 años para venta de ropa y accesorios de diseño propio. Este sitio web de ventas esta desarrollado en Next 16.3.4. El objetivo es mantener un código limpio, mantenible, escalable y fácil de entender.
---

## 🎯 Principios Fundamentales

### 1. **KISS primero** (Keep It Simple, Stupid)
- Evita complejidad innecesaria
- Soluciona el problema directamente sin sobre-ingeniería
- Si algo puede hacerse en 5 líneas, no hagas 20
- Código simple > código inteligente

### 2. **SOLID después**
Una vez que el código es simple, aplica SOLID:
- **S**ingle Responsibility
- **O**pen/Closed
- **L**iskov Substitution
- **I**nterface Segregation
- **D**ependency Inversion

### 3. **Máxima Modularización**
- Componentes lo más pequeños y reutilizables posible
- Cada componente debe tener **una** razón de ser
- Composables para lógica compartida
- Fácil de testear, entender y mantener

---

## 🏗️ Arquitectura y Estructura

### Organización de Carpetas

```
proyecto-norte/
├─ app/                     # Rutas y páginas (App Router)
│  ├─ (storefront)/         # Sitio público (home, productos, carrito, checkout)
│  ├─ (auth)/               # Autenticación (login, registro, recuperación)
│  ├─ (account)/            # Cuenta de usuario (perfil, pedidos, direcciones)
│  ├─ (admin)/              # Panel administrativo (productos, pedidos, inventario)
│  ├─ api/                  # Endpoints API (webhooks, revalidación, etc.)
│  ├─ layout.tsx            # Root layout (providers, fuentes, metadata)
│  └─ globals.css           # Estilos globales
│
├─ components/
│  ├─ ui/                   # Componentes base de shadcn (Button, Input, Dialog, etc.)
│  ├─ atomic/               # (Opcional) Átomos adicionales o wrappers de shadcn
│  ├─ composed/             # Composiciones de UI (FormGroup, Card, ProductCard, etc.)
│  └─ layout/               # Layouts y estructura (Header, Footer, Sidebar, etc.)
│
├─ features/                # Lógica y UI por dominio/funcionalidad
│  ├─ auth/
│  │  ├─ components/
│  │  ├─ actions.ts         # Server actions de autenticación
│  │  └─ schemas.ts         # Validaciones (Zod)
│  ├─ cart/
│  │  ├─ components/
│  │  ├─ actions.ts         # addToCart, updateQuantity, removeFromCart
│  │  └─ hooks.ts           # useCart, etc.
│  ├─ products/
│  │  ├─ components/
│  │  ├─ queries.ts         # Funciones para obtener productos (DB/API)
│  │  └─ utils.ts
│  └─ checkout/
│     ├─ components/
│     ├─ actions.ts
│     └─ stripe.ts
│
├─ hooks/                   # Hooks globales reutilizables
│  ├─ use-cart.ts
│  ├─ use-wishlist.ts
│  └─ use-media-query.ts
│
├─ lib/                     # Utilidades, configuraciones y acceso a datos
│  ├─ db.ts                 # Cliente de DB (Prisma, Drizzle, etc.)
│  ├─ stripe.ts             # Configuración de Stripe
│  ├─ utils.ts              # Helpers genéricos (cn, formateo de precios, fechas)
│  ├─ validations/
│  │  ├─ product.ts
│  │  └─ checkout.ts
│  └─ constants.ts          # Constantes globales (tallas, colores, envíos)
│
├─ services/                # Capa de interacción con APIs externas (si se usa)
│  ├─ products.ts
│  ├─ orders.ts
│  └─ auth.ts
│
├─ types/                   # Tipos TypeScript globales
│  ├─ product.ts
│  ├─ cart.ts
│  ├─ order.ts
│  └─ user.ts
│
├─ public/                  # Assets estáticos (imágenes, iconos, etc.)
│  ├─ images/
│  └─ icons/
│
├─ styles/                  # Estilos adicionales (si no están en app/globals.css)
│  └─ globals.css
│
└─ config/                  # Configuración del sitio
   ├─ site.ts               # Nombre, descripción, URLs, SEO
   └─ navigation.ts         # Menús (header, footer)
```

### Reglas por capa

#### `app/`

- Solo contiene **rutas** y **páginas** del App Router.
- Cada carpeta representa un segmento de URL.
- Los grupos de rutas `(storefront)`, `(auth)`, `(account)`, `(admin)` se usan para compartir layouts sin afectar la URL.
- La lógica de negocio no vive aquí; las páginas llaman a funciones en `features/` o `lib/`.

#### `components/`

- `ui/`: Componentes base de **shadcn/ui**. No contienen lógica de negocio del ecommerce.
- `atomic/`: (Opcional) Átomos adicionales o wrappers de componentes de `ui`.
- `composed/`: Composiciones de componentes `ui` (ej. `FormGroup`, `Card`, `ProductCard`).
- `layout/`: Componentes de layout global (`Header`, `Footer`, `Sidebar`, `MobileNav`).

#### `features/`

- Organizado por **dominio/funcionalidad**: `auth`, `cart`, `products`, `checkout`, `orders`, etc.
- Cada feature puede tener:
  - `components/`: Componentes específicos de esa feature.
  - `actions.ts`: Server actions relacionadas.
  - `queries.ts`: Funciones para obtener datos (DB/API).
  - `hooks.ts`: Hooks específicos de esa feature.
  - `schemas.ts`: Validaciones con Zod.
- Es el lugar principal para la **lógica de negocio**.

#### `hooks/`

- Hooks globales reutilizables que no pertenecen a una feature concreta.
- Ejemplos: `use-cart`, `use-wishlist`, `use-media-query`.

#### `lib/`

- Utilidades, configuraciones y acceso a datos de bajo nivel.
- `db.ts`, `stripe.ts`, `utils.ts`, `constants.ts`, validaciones compartidas, etc.

#### `services/`

- (Opcional) Capa de interacción con APIs externas si se quiere separar de `lib/`.
- Ejemplo: `products.ts`, `orders.ts`, `auth.ts`.

#### `types/`

- Tipos TypeScript globales usados en varias partes del proyecto.
- Ejemplo: `product.ts`, `cart.ts`, `order.ts`, `user.ts`.

#### `public/` y `styles/`

- `public/`: Imágenes, iconos y otros assets estáticos.
- `styles/`: Estilos globales adicionales si no están en `app/globals.css`.

#### `config/`

- Configuración del sitio: nombre, descripción, URLs, SEO, menús de navegación.

### Convenciones de nombres

- Componentes React: `PascalCase` (ej. `ProductCard.tsx`).
- Hooks: `useXxx.ts` (ej.`use-cart.ts` o `useCart.ts`).
- Server actions: `actions.ts` dentro de cada feature.
- Queries: `queries.ts` dentro de cada feature.
- Tipos: `singular` o `plural` según corresponda (ej. `product.ts`, `cart.ts`).

### Uso de shadcn/ui

- Los componentes de shadcn se instalan en `components/ui/`.
- Se usan como bloques base para construir componentes en `composed/`, `features/*/components/` y `components/layout/`.
- No se modifica directamente el código de `components/ui/` salvo que sea necesario; las customizaciones se hacen en `composed/` o wrappers en `atomic/`.

### Flujo típico de una feature

1. Definir tipos en `types/` (si son globales) o dentro de la feature.
2. Crear validaciones en `features/<feature>/schemas.ts`.
3. Implementar acceso a datos en `features/<feature>/queries.ts` (usa `lib/db.ts` o `services/`).
4. Crear Server Actions en `features/<feature>/actions.ts`.
5. Construir componentes UI en `features/<feature>/components/` usando `components/ui/` y `components/composed/`.
6. Usar la feature en las páginas de `app/`.


### Patrones de Imports/Exports
---

#### ✅ BIEN – Importa solo lo que necesitas

```ts
// Componentes y hooks de React
import { useState, useEffect } from 'react'
import type { FC } from 'react'

// shadcn/ui: importa componente por componente
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// Tus componentes
import ProductCard from '@/components/composed/product-card'
import Header from '@/components/layout/header'

// Features
import { addToCart, updateQuantity } from '@/features/cart/actions'
import { useCart } from '@/features/cart/hooks'
import { getProductBySlug } from '@/features/products/queries'

// Librerías y utilidades
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/utils'
import { PRODUCT_STATUS } from '@/lib/constants'

// Tipos
import type { Product, ProductVariant } from '@/types/product'
import type { CartItem } from '@/types/cart'
```

**Rutas absolutas** (con `@/`) configuradas en `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

#### ❌ MAL – Evita importar todo el módulo

```ts
// ❌ No hagas esto en Next.js/React
import * as React from 'react'
import * as UI from '@/components/ui'
import * as CartActions from '@/features/cart/actions'
import * as Types from '@/types'
```

Motivos:

- Tree-shaking menos efectivo.
- Código menos claro: no se ve qué se usa realmente.
- Tipos y valores mezclados en un mismo namespace.

---

#### ✅ BIEN – Exports en componentes y utilidades

**Componentes (default export cuando hay un solo componente por archivo):**

```ts
// src/components/composed/product-card.tsx
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types/product'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Card>
      <CardContent>{product.name}</CardContent>
      <CardFooter>{formatPrice(product.price)}</CardFooter>
    </Card>
  )
}
```

**Utilidades y funciones (named exports):**

```ts
// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}
```

**Tipos (solo types, sin runtime):**

```ts
// src/types/product.ts
export interface Product {
  id: string
  slug: string
  name: string
  price: number
  variants: ProductVariant[]
}

export interface ProductVariant {
  id: string
  size: string
  color: string
  stock: number
}

export type ProductStatus = 'active' | 'draft' | 'archived'
```

**Server Actions (named exports):**

```ts
// src/features/cart/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { getCart, saveCart } from '@/lib/cart-store'
import type { CartItem } from '@/types/cart'

export async function addToCart(item: CartItem) {
  const cart = await getCart()
  // lógica...
  await saveCart(cart)
  revalidatePath('/cart')
}

export async function updateQuantity(itemId: string, quantity: number) {
  const cart = await getCart()
  // lógica...
  await saveCart(cart)
  revalidatePath('/cart')
}
```

---

#### ✅ BIEN – Agrupación y orden de imports

Orden recomendado (puedes automatizarlo con ESLint + `eslint-plugin-import`):

```ts
// 1. React y librerías externas
import { useState } from 'react'
import { clsx } from 'clsx'

// 2. Next.js
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// 3. shadcn/ui
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// 4. Componentes propios (por capas)
import ProductCard from '@/components/composed/product-card'
import Header from '@/components/layout/header'

// 5. Features
import { addToCart } from '@/features/cart/actions'
import { useCart } from '@/features/cart/hooks'

// 6. Librerías internas
import { cn, formatPrice } from '@/lib/utils'
import { PRODUCT_STATUS } from '@/lib/constants'

// 7. Tipos
import type { Product } from '@/types/product'
import type { CartItem } from '@/types/cart'
```

---

#### ❌ MAL – Mezclar tipos y valores en el mismo import cuando no es necesario

```ts
// ❌ Confuso
import { Product, getProductBySlug } from '@/features/products'

// ✅ Mejor: separa tipos y funciones
import type { Product } from '@/types/product'
import { getProductBySlug } from '@/features/products/queries'
```

---

#### ✅ BIEN – Re-exports puntuales (cuando tiene sentido)

Puedes crear “barrels” limitados para simplificar imports, pero sin exponer todo:

```ts
// src/components/ui/index.ts
export { Button } from './button'
export { Input } from './input'
export { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog'
```

Uso:

```ts
import { Button, Input } from '@/components/ui'
```

Evita:

```ts
// ❌ Demasiado genérico y pesado
export * from './button'
export * from './input'
export * from './dialog'
```
---
## 🧩 Patrones de Componentes Next.js 16

### 1. Componentes Presentacionales (Dumb)

Máxima simplicidad. Solo reciben `props`, no tienen lógica de negocio, no llaman a APIs.

**✅ BIEN:**

```tsx
// src/components/ui/button.tsx (ejemplo estilo shadcn)
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
        danger: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        sm: 'h-8 px-3',
        md: 'h-10 px-4',
        lg: 'h-12 px-6',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  disabled?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
```

Uso en otro componente:

```tsx
import { Button } from '@/components/ui/button'

export default function Example() {
  return (
    <Button variant="danger" size="lg" onClick={() => console.log('click')}>
      Eliminar
    </Button>
  )
}
```

**❌ MAL – Lógica de negocio en componente dumb:**

```tsx
// ❌ No hagas esto en un componente presentacional
'use client'

import { useState } from 'react'
import { deleteProduct } from '@/features/products/actions'

export default function BadButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false)

  // ❌ Lógica que debería estar en un contenedor o Server Action
  const handleClick = async () => {
    setLoading(true)
    await deleteProduct(productId)
    setLoading(false)
  }

  return <button onClick={handleClick}>Eliminar</button>
}
```

---

### 2. Componentes Contenedores (Smart)

Manejan lógica, estado, comunicación con APIs / Server Actions. En Next.js 16 suelen ser **Server Components** que llaman a `features/*/queries.ts` y/o **Client Components** que usan hooks y Server Actions.

**✅ BIEN – Server Component contenedor:**

```tsx
// src/app/(storefront)/products/page.tsx
import { getProductsByCategory } from '@/features/products/queries'
import ProductCard from '@/components/composed/product-card'
import type { Product } from '@/types/product'

interface ProductsPageProps {
  searchParams: Promise<{ category?: string; q?: string }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { category, q } = await searchParams

  const products: Product[] = await getProductsByCategory({ category, q })

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Productos</h1>

      {products.length === 0 ? (
        <p>No hay productos disponibles.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
```

**✅ BIEN – Client Component contenedor (con lógica de UI):**

```tsx
// src/features/cart/components/cart-container.tsx
'use client'

import { useState, useTransition } from 'react'
import { addToCart, updateQuantity, removeFromCart } from '@/features/cart/actions'
import { useCart } from '@/features/cart/hooks'
import CartItemRow from './cart-item-row'
import { Button } from '@/components/ui/button'

export default function CartContainer() {
  const { items, total } = useCart()
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  async function handleUpdateQuantity(itemId: string, quantity: number) {
    startTransition(async () => {
      await updateQuantity(itemId, quantity)
      setMessage('Cantidad actualizada')
    })
  }

  async function handleRemove(itemId: string) {
    startTransition(async () => {
      await removeFromCart(itemId)
      setMessage('Producto eliminado del carrito')
    })
  }

  return (
    <div className="cart-container">
      {message && <p className="mb-2 text-sm text-green-600">{message}</p>}

      {items.length === 0 ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        <>
          <ul className="space-y-2">
            {items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemove}
              />
            ))}
          </ul>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-lg font-semibold">Total: ${total.toFixed(2)}</p>
            <Button disabled={isPending} onClick={() => (window.location.href = '/checkout')}>
              Ir a pagar
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
```

---

### 3. Usar Server Components por defecto

En Next.js 16, todo es **Server Component** a menos que marques `'use client'`.

**✅ BIEN – Server Component (default):**

```tsx
// src/app/(storefront)/page.tsx
import { getFeaturedProducts } from '@/features/products/queries'
import ProductCard from '@/components/composed/product-card'

export default async function HomePage() {
  const products = await getFeaturedProducts()

  return (
    <main>
      <h1>Destacados</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </main>
  )
}
```

**❌ MAL – Marcar todo como `'use client'` sin necesidad:**

```tsx
// ❌ No hagas esto si no usas hooks, estado o eventos del navegador
'use client'

import { getFeaturedProducts } from '@/features/products/queries'

export default function HomePage() {
  // ❌ Estás forzando cliente sin necesidad
  const products = getFeaturedProducts()

  return <div>...</div>
}
```

---

### 4. Props – Específicos y Tipados

Los props son el contrato de tu componente.

**✅ BIEN:**

```tsx
// src/components/composed/product-card.tsx
import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types/product'

export interface ProductCardProps {
  product: Product
  onQuickAdd?: (productId: string) => void
}

export default function ProductCard({ product, onQuickAdd }: ProductCardProps) {
  return (
    <Card>
      <CardContent>
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={300}
          height={300}
          className="h-48 w-full object-cover"
        />
        <h3 className="mt-2 text-base font-medium">{product.name}</h3>
        <p className="text-sm text-gray-600">{formatPrice(product.price)}</p>
      </CardContent>
      <CardFooter>
        {onQuickAdd && (
          <button
            type="button"
            className="rounded bg-blue-600 px-3 py-1 text-sm text-white"
            onClick={() => onQuickAdd(product.id)}
          >
            Agregar
          </button>
        )}
      </CardFooter>
    </Card>
  )
}
```

**❌ MAL – Props genéricos y sin tipos:**

```tsx
// ❌ Evita esto
export default function BadProductCard({ data, options, config }: any) {
  // ❌ No sabes qué estructura tienen
  return <div>{data.name}</div>
}
```

---

### 5. Children y composición – Máxima flexibilidad

Usa `children` y slots (en React, `children` y render props) para hacer componentes reutilizables.

**✅ BIEN:**

```tsx
// src/components/composed/card.tsx
import { cn } from '@/lib/utils'

export interface CardProps {
  children: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export default function Card({ children, header, footer, className }: CardProps) {
  return (
    <div className={cn('rounded-lg border bg-white shadow-sm', className)}>
      {header && <div className="border-b px-4 py-3">{header}</div>}

      <div className="p-4">{children}</div>

      {footer && <div className="border-t bg-gray-50 px-4 py-3">{footer}</div>}
    </div>
  )
}
```

Uso:

```tsx
import Card from '@/components/composed/card'
import { Button } from '@/components/ui/button'

export default function Example() {
  return (
    <Card
      header={<h2 className="text-lg font-semibold">Título de la tarjeta</h2>}
      footer={
        <Button variant="primary" onClick={() => console.log('acción')}>
          Acción
        </Button>
      }
    >
      <p>Contenido flexible de la tarjeta.</p>
    </Card>
  )
}
```

**❌ MAL – Todo hardcodeado:**

```tsx
// ❌ Poco reutilizable
export default function BadCard({ title, content, buttonText }: { title: string; content: string; buttonText: string }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <p>{content}</p>
      <button>{buttonText}</button>
    </div>
  )
}
```

---

### 6. Hooks y utilidades – Lógica reutilizable (`useXXX`)

Extrae lógica común a hooks con patrón `useXXX`

**✅ BIEN – `use-cart.ts`:**

```ts
// src/features/cart/hooks.ts
import { create } from 'zustand'
import type { CartItem } from '@/types/cart'

interface CartState {
  items: CartItem[]
  total: number
  addItem: (item: CartItem) => void
  updateQuantity: (itemId: string, quantity: number) => void
  removeItem: (itemId: string) => void
  clear: () => void
}

export const useCart = create<CartState>((set, get) => ({
  items: [],
  total: 0,

  addItem: (item) => {
    const items = [...get().items, item]
    set({ items, total: items.reduce((acc, it) => acc + it.price * it.quantity, 0) })
  },

  updateQuantity: (itemId, quantity) => {
    const items = get().items
      .map((it) => (it.id === itemId ? { ...it, quantity } : it))
      .filter((it) => it.quantity > 0)

    set({ items, total: items.reduce((acc, it) => acc + it.price * it.quantity, 0) })
  },

  removeItem: (itemId) => {
    const items = get().items.filter((it) => it.id !== itemId)
    set({ items, total: items.reduce((acc, it) => acc + it.price * it.quantity, 0) })
  },

  clear: () => set({ items: [], total: 0 }),
}))
```

Uso en componente:

```tsx
'use client'

import { useCart } from '@/features/cart/hooks'
import { Button } from '@/components/ui/button'

export default function AddToCartButton({ productId, price }: { productId: string; price: number }) {
  const addItem = useCart((state) => state.addItem)

  return (
    <Button onClick={() => addItem({ id: productId, productId, price, quantity: 1 })}>
      Agregar al carrito
    </Button>
  )
}
```

**❌ MAL – Lógica duplicada en múltiples componentes:**

```tsx
// ❌ Repetido en varios componentes de carrito
'use client'

import { useState } from 'react'

export function BadCartComponent() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)

  // ❌ Misma lógica copiada en varios sitios
  const addItem = (item) => {
    const newItems = [...items, item]
    setItems(newItems)
    setTotal(newItems.reduce((acc, it) => acc + it.price * it.quantity, 0))
  }

  // ...
}
```

---

### 7. Server Actions – Lógica de mutación reutilizable

Para crear, actualizar o borrar datos, usa **Server Actions** en lugar de poner lógica directamente en los componentes.

**✅ BIEN – `features/cart/actions.ts`:**

```ts
// src/features/cart/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { getCart, saveCart } from '@/lib/cart-store'
import type { CartItem } from '@/types/cart'

export async function addToCart(item: CartItem) {
  const cart = await getCart()
  const exists = cart.items.find((i) => i.id === item.id)

  if (exists) {
    exists.quantity += item.quantity
  } else {
    cart.items.push(item)
  }

  await saveCart(cart)
  revalidatePath('/cart')
}

export async function updateQuantity(itemId: string, quantity: number) {
  const cart = await getCart()
  const item = cart.items.find((i) => i.id === itemId)
  if (!item) return

  item.quantity = quantity
  if (item.quantity <= 0) {
    cart.items = cart.items.filter((i) => i.id !== itemId)
  }

  await saveCart(cart)
  revalidatePath('/cart')
}

export async function removeFromCart(itemId: string) {
  const cart = await getCart()
  cart.items = cart.items.filter((i) => i.id !== itemId)
  await saveCart(cart)
  revalidatePath('/cart')
}
```

Uso en componente cliente:

```tsx
'use client'

import { addToCart } from '@/features/cart/actions'
import { Button } from '@/components/ui/button'
import type { Product } from '@/types/product'

export default function AddToCartServerButton({ product }: { product: Product }) {
  return (
    <form
      action={async () => {
        'use server'
        await addToCart({
          id: product.id,
          productId: product.id,
          price: product.price,
          quantity: 1,
        })
      }}
    >
      <Button type="submit">Agregar al carrito</Button>
    </form>
  )
}
```

---

Con estos patrones mantienes la claridad del proyecto realizado **Next.js 16 + TypeScript + shadcn**.

## 📐 SOLID Aplicado a Next.js 16

### S – Single Responsibility Principle

**Un componente / archivo = una responsabilidad clara.**

**❌ MAL – Un componente hace demasiado:**

```tsx
// ❌ ImageGallery.tsx hace: búsqueda, filtrado, ordenamiento, render, acciones, etc.
'use client'

import { useState, useMemo } from 'react'
import { deleteImage, downloadImage } from '@/features/images/actions'
import type { Image } from '@/types/image'

export default function ImageGallery({ initialImages }: { initialImages: Image[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date')

  const filteredAndSorted = useMemo(() => {
    return initialImages
      .filter((img) => img.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
  }, [initialImages, searchQuery, sortBy])

  return (
    <div>
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Buscar..."
      />
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'name' | 'date')}>
        <option value="name">Nombre</option>
        <option value="date">Fecha</option>
      </select>

      <table>
        <tbody>
          {filteredAndSorted.map((image) => (
            <tr key={image.id}>
              <td>{image.name}</td>
              <td>
                <button onClick={() => downloadImage(image.id)}>Descargar</button>
                <button onClick={() => deleteImage(image.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

**✅ BIEN – Separado en componentes con responsabilidades claras:**

```text
app/(admin)/images/page.tsx          # Contenedor (Server Component)
├─ components/image-filters.tsx      # Búsqueda y ordenamiento
├─ components/image-list.tsx         # Renderiza lista
│  └─ components/image-item.tsx      # Cada imagen + acciones
└─ features/images/actions.ts        # Server actions (download, delete)
```

Ejemplo:

```tsx
// app/(admin)/images/page.tsx
import { getImages } from '@/features/images/queries'
import ImageFilters from '@/components/image-filters'
import ImageList from '@/components/image-list'

export default async function ImagesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: 'name' | 'date' }>
}) {
  const { q, sort } = await searchParams
  const images = await getImages({ q, sort })

  return (
    <div>
      <h1>Galería de imágenes</h1>
      <ImageFilters />
      <ImageList images={images} />
    </div>
  )
}
```

```tsx
// components/image-filters.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export default function ImageFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateQuery = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(key, value)
      router.push(`?${params.toString()}`)
    },
    [router, searchParams]
  )

  return (
    <div className="mb-4 flex gap-2">
      <input
        defaultValue={searchParams.get('q') ?? ''}
        onChange={(e) => updateQuery('q', e.target.value)}
        placeholder="Buscar..."
        className="rounded border px-2 py-1"
      />
      <select
        defaultValue={searchParams.get('sort') ?? 'date'}
        onChange={(e) => updateQuery('sort', e.target.value)}
        className="rounded border px-2 py-1"
      >
        <option value="name">Nombre</option>
        <option value="date">Fecha</option>
      </select>
    </div>
  )
}
```

```tsx
// components/image-list.tsx
import ImageItem from './image-item'
import type { Image } from '@/types/image'

export default function ImageList({ images }: { images: Image[] }) {
  return (
    <table>
      <tbody>
        {images.map((image) => (
          <ImageItem key={image.id} image={image} />
        ))}
      </tbody>
    </table>
  )
}
```

```tsx
// components/image-item.tsx
'use client'

import { deleteImage, downloadImage } from '@/features/images/actions'

export default function ImageItem({ image }: { image: Image }) {
  return (
    <tr>
      <td>{image.name}</td>
      <td>
        <button onClick={() => downloadImage(image.id)}>Descargar</button>
        <button onClick={() => deleteImage(image.id)}>Eliminar</button>
      </td>
    </tr>
  )
}
```

---

### O – Open/Closed Principle

**Abierto para extensión, cerrado para modificación.**

**❌ MAL – Hay que modificar el componente para cada caso:**

```tsx
// ❌ Cada nuevo tipo requiere modificar el componente
export default function Alert({ type, message }: { type: 'alert' | 'success' | 'error'; message: string }) {
  if (type === 'alert') {
    return <div className="alert">{message}</div>
  }
  if (type === 'success') {
    return <div className="success">{message}</div>
  }
  if (type === 'error') {
    return <div className="error">{message}</div>
  }
  return null
}
```

**✅ BIEN – Extensible vía props y composición:**

```tsx
// components/ui/alert.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const alertVariants = cva(
  'rounded-md border-l-4 px-4 py-3 text-sm',
  {
    variants: {
      variant: {
        info: 'border-blue-500 bg-blue-50 text-blue-900',
        success: 'border-green-500 bg-green-50 text-green-900',
        warning: 'border-yellow-500 bg-yellow-50 text-yellow-900',
        error: 'border-red-500 bg-red-50 text-red-900',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
)

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  icon?: React.ReactNode
}

export default function Alert({ className, variant, icon, children, ...props }: AlertProps) {
  return (
    <div className={cn(alertVariants({ variant }), className)} {...props}>
      {icon && <div className="mb-1">{icon}</div>}
      {children}
    </div>
  )
}
```

Uso – sin modificar el componente:

```tsx
import Alert from '@/components/ui/alert'

<Alert variant="success">✓ Guardado correctamente</Alert>

<Alert variant="error" icon={<span>⚠️</span>}>
  ✗ Error al procesar
</Alert>
```

Puedes añadir nuevos `variant` en `alertVariants` sin cambiar la lógica del componente.

---

### L – Liskov Substitution Principle

**Componentes intercambiables que implementan el mismo contrato.**

**✅ BIEN – Mismo contrato (props y eventos):**

```tsx
// components/ui/button-primary.tsx
import { Button, type ButtonProps } from '@/components/ui/button'

export default function ButtonPrimary(props: ButtonProps) {
  return <Button {...props} variant="primary" />
}
```

```tsx
// components/ui/button-secondary.tsx
import { Button, type ButtonProps } from '@/components/ui/button'

export default function ButtonSecondary(props: ButtonProps) {
  return <Button {...props} variant="secondary" />
}
```

Ambos comparten el mismo contrato (`ButtonProps`), así que son intercambiables:

```tsx
import ButtonPrimary from '@/components/ui/button-primary'
import ButtonSecondary from '@/components/ui/button-secondary'

export default function FormActions() {
  return (
    <>
      <ButtonPrimary onClick={save}>Guardar</ButtonPrimary>
      <ButtonSecondary onClick={cancel}>Cancelar</ButtonSecondary>
    </>
  )
}
```

**❌ MAL – Contratos diferentes:**

```tsx
// ❌ Button1.tsx
export default function Button1({ text, onClick }: { text: string; onClick: () => void }) {
  return <button onClick={onClick}>{text}</button>
}

// ❌ Button2.tsx
export default function Button2({ label, onPress }: { label: string; onPress: () => void }) {
  return <button onClick={onPress}>{label}</button>
}
```

No son intercambiables sin tocar el código que los usa.

---

### I – Interface Segregation Principle

**Props específicos, no objetos genéricos con “todo”.**

**❌ MAL – Props genérico:**

```tsx
// ❌ ¿Qué debe contener config?
export default function Card({ config }: { config: Record<string, any> }) {
  return (
    <div>
      <h2>{config.title ?? config.name}</h2>
      <p>{config.description}</p>
      <button onClick={config.onClick}>Acción</button>
    </div>
  )
}
```

**✅ BIEN – Props específicos y tipados:**

```tsx
// components/composed/card.tsx
export interface CardProps {
  title: string
  subtitle?: string
  description?: string
  icon?: React.ReactNode
  actions?: Array<{ label: string; onClick: () => void }>
  children?: React.ReactNode
}

export default function Card({ title, subtitle, description, icon, actions, children }: CardProps) {
  return (
    <div className="rounded-lg border p-4">
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
      </div>

      {description && <p className="mb-3 text-sm text-gray-700">{description}</p>}
      {children}

      {actions && (
        <div className="mt-3 flex gap-2">
          {actions.map((action) => (
            <button
              key={action.label}
              className="rounded bg-blue-600 px-3 py-1 text-sm text-white"
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

### D – Dependency Inversion Principle

**No hardcodees dependencias; inyéctalas (props, hooks, context).**

**❌ MAL – Hardcodeada:**

```tsx
// ❌ Componente acoplado a una implementación concreta
'use client'

import { useCartStore } from '@/stores/cart-store'
import { fetchProductsFromAPI } from '@/services/products'

export default function ProductList() {
  const cart = useCartStore()
  const [products, setProducts] = useState([])

  useEffect(() => {
    fetchProductsFromAPI().then(setProducts)
  }, [])

  // ...
}
```

**✅ BIEN – Inyectada vía props o hooks:**

Opción 1: inyección por props (útil para componentes reutilizables):

```tsx
// components/product-list.tsx
import type { Product } from '@/types/product'

export interface ProductListProps {
  products: Product[]
  onAddToCart: (productId: string) => void
}

export default function ProductList({ products, onAddToCart }: ProductListProps) {
  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>
          <span>{p.name}</span>
          <button onClick={() => onAddToCart(p.id)}>Agregar</button>
        </li>
      ))}
    </ul>
  )
}
```

Uso en una página:

```tsx
// app/(storefront)/products/page.tsx
import { getProducts } from '@/features/products/queries'
import { addToCart } from '@/features/cart/actions'
import ProductList from '@/components/product-list'

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <ProductList
      products={products}
      onAddToCart={async (id) => {
        'use server'
        await addToCart(/* ... */)
      }}
    />
  )
}
```

Opción 2: abstracción vía hooks:

```ts
// hooks/use-products.ts
import { useEffect, useState } from 'react'
import { getProducts } from '@/features/products/queries'
import type { Product } from '@/types/product'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  return { products, loading, error }
}
```

Componente agnóstico de la fuente de datos:

```tsx
'use client'

import { useProducts } from '@/hooks/use-products'
import ProductList from '@/components/product-list'

export default function ProductsClient() {
  const { products, loading, error } = useProducts()

  if (loading) return <p>Cargando...</p>
  if (error) return <p>Error al cargar productos</p>

  return <ProductList products={products} onAddToCart={(id) => console.log(id)} />
}
```

Así el componente depende de una **abstracción** (`useProducts`), no de una implementación concreta de API.

---

Con estos patrones aplicas SOLID en Next.js 16 manteniendo la misma intención que en tu ejemplo de Vue, pero usando componentes, hooks y Server Actions propios del ecosistema React/Next.

## 🎚️ Granularidad y Modularización (Next.js 16)

### Niveles de Componentes

Inspirado en Atomic Design, pero adaptado a Next.js + shadcn:

```text
ATÓMICOS
├─ Button, Input, Icon, Badge, Label
├─ Componentes base de shadcn/ui o wrappers muy simples
├─ Sin lógica de negocio, altamente reutilizables

MOLECULARES
├─ FormGroup, SearchBox, Card, ProductCard, CartItem
├─ Combinaciones de átomos con algo de lógica de UI

ORGÁNICOS
├─ ImageGallery, UploadForm, ProductList, CartContainer, CheckoutForm
├─ Lógica más compleja, pueden contener moléculas y átomos
├─ Suelen vivir en features/*/components o components/composed

PÁGINAS (ROUTES)
├─ HomePage, ProductsPage, CartPage, CheckoutPage, AdminDashboard
└─ Vistas completas, enrutables, definidas en app/
```

Ejemplo en la estructura del proyecto:

```text
proyecto-norte/
├─ components/
│  ├─ ui/                 # Atómicos (shadcn)
│  │  ├─ button.tsx
│  │  ├─ input.tsx
│  │  └─ badge.tsx
│  ├─ composed/           # Moleculares
│  │  ├─ form-group.tsx
│  │  ├─ card.tsx
│  │  └─ product-card.tsx
│  └─ layout/
│     ├─ header.tsx
│     └─ footer.tsx
│
├─ features/
│  ├─ products/
│  │  ├─ components/     # Orgánicos
│  │  │  ├─ product-list.tsx
│  │  │  └─ product-filters.tsx
│  │  ├─ queries.ts
│  │  └─ actions.ts
│  ├─ cart/
│  │  ├─ components/
│  │  │  └─ cart-container.tsx
│  │  ├─ hooks.ts
│  │  └─ actions.ts
│  └─ checkout/
│     ├─ components/
│     │  └─ checkout-form.tsx
│     └─ actions.ts
│
└─ app/
   ├─ (storefront)/
   │  ├─ page.tsx                 # HomePage
   │  ├─ products/
   │  │  └─ page.tsx             # ProductsPage
   │  ├─ cart/
   │  │  └─ page.tsx             # CartPage
   │  └─ checkout/
   │     └─ page.tsx             # CheckoutPage
   └─ (admin)/
      └─ dashboard/
         └─ page.tsx             # AdminDashboard
```

---

### Regla del Pulgar: ¿Cuándo Crear un Componente?

| Pregunta | Respuesta | Acción |
|----------|-----------|--------|
| ¿Se repite en 2+ lugares? | Sí | Extraer a componente (`components/` o `features/*/components`) |
| ¿Tiene lógica específica de UI o negocio? | Sí | Considerar componente + hook / Server Action |
| ¿Es complejo de entender en una sola lectura? | Sí | Dividir en componentes menores |
| ¿Son solo 2–3 líneas de JSX sin lógica? | Sí | Dejar donde está (KISS) |
| ¿Se puede entender en ~30 segundos? | Sí | OK mantener junto; si no, separar |

En Next.js 16 aplica también:

- Si un componente crece y mezcla **data fetching**, **UI** y **acciones**, separa:
  - Data fetching → `features/*/queries.ts` o directamente en Server Component.
  - Acciones → `features/*/actions.ts` (Server Actions).
  - UI → componentes más pequeños en `components/` o `features/*/components/`.

---

### Ejemplo: Refactorizar de Grande a Granular

**❌ MAL – Un componente gigante (300+ líneas):**

```tsx
// ❌ app/(storefront)/products/page.tsx (monolítico)
'use client'

import { useState, useMemo, useEffect } from 'react'
import { deleteProduct, downloadProduct } from '@/features/products/actions'
import type { Product } from '@/types/product'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'date'>('date')
  const [filterCategory, setFilterCategory] = useState<string | null>(null)

  // Carga de datos
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data)
        setLoading(false)
      })
  }, [])

  // Filtrado y ordenamiento
  const filteredAndSorted = useMemo(() => {
    return products
      .filter((p) =>
        filterCategory ? p.category === filterCategory : true
      )
      .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name)
        if (sortBy === 'price') return a.price - b.price
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
  }, [products, searchQuery, sortBy, filterCategory])

  // Lógica de acciones
  async function handleDelete(productId: string) {
    await deleteProduct(productId)
    setProducts((prev) => prev.filter((p) => p.id !== productId))
  }

  async function handleDownload(productId: string) {
    await downloadProduct(productId)
  }

  if (loading) return <p>Cargando productos...</p>

  return (
    <div>
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Buscar..."
      />
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
        <option value="name">Nombre</option>
        <option value="price">Precio</option>
        <option value="date">Fecha</option>
      </select>
      <select
        value={filterCategory ?? ''}
        onChange={(e) => setFilterCategory(e.target.value || null)}
      >
        <option value="">Todas las categorías</option>
        <option value="ropa">Ropa</option>
        <option value="accesorios">Accesorios</option>
      </select>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {filteredAndSorted.map((p) => (
          <div key={p.id} className="rounded border p-3">
            <h3>{p.name}</h3>
            <p>${p.price}</p>
            <button onClick={() => handleDownload(p.id)}>Descargar</button>
            <button onClick={() => handleDelete(p.id)}>Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

Problemas:

- Demasiada lógica en una sola página.
- Difícil de testear y reutilizar.
- Mezcla data fetching, filtros, UI y acciones.

---

**✅ BIEN – Varios componentes pequeños + hooks + Server Actions:**

```text
src/
├─ app/(storefront)/products/
│  └─ page.tsx                 # Contenedor (Server Component)
│
├─ components/
│  ├─ product-filters.tsx      # UI de filtros (SearchBox, selects)
│  ├─ product-grid.tsx         # Grid que renderiza ProductCard
│  └─ product-card.tsx         # Tarjeta de producto (átomo + molécula)
│
├─ features/
│  ├─ products/
│  │  ├─ components/
│  │  │  ├─ product-list.tsx
│  │  │  └─ product-filters.tsx
│  │  ├─ queries.ts            # getProducts, getProductsByCategory, etc.
│  │  └─ actions.ts            # deleteProduct, downloadProduct
│  └─ cart/
│     ├─ hooks.ts              # useCart
│     └─ actions.ts            # addToCart
```

Ejemplo:

```tsx
// app/(storefront)/products/page.tsx
import { getProducts } from '@/features/products/queries'
import ProductFilters from '@/components/product-filters'
import ProductGrid from '@/components/product-grid'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; category?: string }>
}) {
  const { q, sort, category } = await searchParams
  const products = await getProducts({ q, sort, category })

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Productos</h1>
      <ProductFilters />
      <ProductGrid products={products} />
    </div>
  )
}
```

```tsx
// components/product-filters.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function ProductFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateQuery = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(key, value)
      router.push(`?${params.toString()}`)
    },
    [router, searchParams]
  )

  return (
    <div className="mb-4 flex gap-2">
      <Input
        defaultValue={searchParams.get('q') ?? ''}
        onChange={(e) => updateQuery('q', e.target.value)}
        placeholder="Buscar..."
        className="w-48"
      />
      <Select defaultValue={searchParams.get('sort') ?? 'date'} onValueChange={(v) => updateQuery('sort', v)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Ordenar por" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name">Nombre</SelectItem>
          <SelectItem value="price">Precio</SelectItem>
          <SelectItem value="date">Fecha</SelectItem>
        </SelectContent>
      </Select>
      <Select
        defaultValue={searchParams.get('category') ?? ''}
        onValueChange={(v) => updateQuery('category', v)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Categoría" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todas</SelectItem>
          <SelectItem value="ropa">Ropa</SelectItem>
          <SelectItem value="accesorios">Accesorios</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
```

```tsx
// components/product-grid.tsx
import ProductCard from './product-card'
import type { Product } from '@/types/product'

export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
```

```tsx
// components/product-card.tsx
'use client'

import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { addToCart } from '@/features/cart/actions'
import type { Product } from '@/types/product'

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Card>
      <CardContent>
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={300}
          height={300}
          className="h-48 w-full object-cover"
        />
        <h3 className="mt-2 text-base font-medium">{product.name}</h3>
        <p className="text-sm text-gray-600">${product.price}</p>
      </CardContent>
      <CardFooter>
        <form
          action={async () => {
            'use server'
            await addToCart({
              id: product.id,
              productId: product.id,
              price: product.price,
              quantity: 1,
            })
          }}
        >
          <Button type="submit" size="sm">
            Agregar
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
```

**Beneficios:**

- ✅ Cada componente es pequeño y entendible en < 30 segundos.
- ✅ Fácil de testear en aislamiento (puedes probar `ProductCard`, `ProductFilters`, etc. por separado).
- ✅ Lógica de datos en `features/products/queries.ts` y acciones en `features/products/actions.ts`.
- ✅ Reutilizable: `ProductCard` se puede usar en Home, CategoryPage, SearchPage, etc.
- ✅ Mantenible: cambiar filtros, estilo o lógica no afecta a todo el archivo gigante.

---

### Guía rápida para decidir granularidad

- Si un archivo supera ~200–250 líneas y hace varias cosas → **dividir**.
- Si un componente tiene:
  - más de 3 responsabilidades claras (filtros, lista, acciones, etc.) → **separar**.
  - lógica que podría usarse en otra página → **mover a hook / feature**.
- Si un componente es solo JSX simple y se usa en un solo lugar → **puede quedarse donde está**.

Aplica esto tanto en `app/` como en `components/` y `features/*/components/` para mantener el proyecto escalable y fácil de navegar.
---
## 📝 Convenciones de Código (Next.js 16)

### Naming

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Componentes React | PascalCase | `ImageCard.tsx`, `UserProfile.tsx` |
| Archivos de componentes | kebab-case | `image-card.tsx`, `user-profile.tsx` |
| Hooks (composables) | camelCase con prefijo `use` | `useImageLoader.ts`, `useFormValidation.ts` |
| Stores (si usas Zustand u otro) | camelCase | `cartStore.ts`, `imageStore.ts` |
| Server Actions | camelCase | `addToCart.ts` (dentro de `actions.ts`) |
| Funciones utilitarias | camelCase | `formatDate.ts`, `parseImageUrl.ts` |
| Variables / constantes | camelCase | `imageCount`, `isLoading` |
| Constantes globales (enums, configs) | UPPER_SNAKE_CASE | `PRODUCT_STATUS`, `MAX_UPLOAD_SIZE` |
| Props booleanos | `is*`, `has*`, `can*` | `isLoading`, `hasError`, `canSubmit` |
| Funciones event handlers | `handle*` o `on*` | `handleClick`, `onSubmit` |
| Tipos e interfaces | PascalCase | `Product`, `CartItem`, `ImageUploadProps` |
| Archivos de tipos | kebab-case o singular | `product.ts`, `cart-item.ts` |

**✅ BIEN:**

```ts
// src/features/images/hooks.ts
import { useState, useEffect } from 'react'
import { getImages } from './queries'
import type { Image } from '@/types/image'

export function useImageLoader(folderId: string) {
  const [images, setImages] = useState<Image[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let cancelled = false

    getImages({ folderId })
      .then((data) => {
        if (!cancelled) setImages(data)
      })
      .catch(() => {
        if (!cancelled) setHasError(true)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [folderId])

  return { images, isLoading, hasError }
}
```

```ts
// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}
```

```tsx
// src/components/image-card.tsx
'use client'

import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatFileSize } from '@/lib/utils'
import type { Image as ImageType } from '@/types/image'

export interface ImageCardProps {
  image: ImageType
  onSelect?: (imageId: string) => void
}

export default function ImageCard({ image, onSelect }: ImageCardProps) {
  const handleClick = () => {
    onSelect?.(image.id)
  }

  return (
    <Card>
      <CardContent>
        <Image
          src={image.url}
          alt={image.name}
          width={300}
          height={200}
          className="h-48 w-full object-cover"
        />
        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm font-medium">{image.name}</p>
          <p className="text-xs text-gray-600">{formatFileSize(image.size)}</p>
        </div>
        <Button className="mt-2" size="sm" onClick={handleClick}>
          Seleccionar
        </Button>
      </CardContent>
    </Card>
  )
}
```

**❌ MAL:**

```ts
// ❌ src/features/images/hooks.ts
import { img_loader } from '@/composables'        // ❌ snake_case
import { Format_FileSize } from '@/utils'         // ❌ PascalCase en función utilitaria

const imgs = []                                   // ❌ nombre poco claro
const loading = false

const ImageSelect = () => {}                       // ❌ PascalCase para función
const on_image_click = () => {}                    // ❌ snake_case en handler

export { imgs, loading, ImageSelect, on_image_click }
```

```tsx
// ❌ src/components/image-card.tsx
'use client'

import { img_loader } from '@/composables/img_loader'
import { Format_FileSize } from '@/utils/formatters'

export interface image_card_props {               // ❌ interfaz en snake_case
  image_data: any                                 // ❌ any + snake_case
  on_image_select?: (id: string) => void
}

export default function image_card({ image_data, on_image_select }: image_card_props) {
  const on_image_click = () => {
    on_image_select?.(image_data.id)
  }

  return <div onClick={on_image_click}>{image_data.name}</div>
}
```

---

### Estructura de archivos y exports

- Un **componente principal por archivo**, con `export default`.
- Tipos relacionados en el mismo archivo o en `types/`, pero siempre con nombre claro.

**✅ BIEN:**

```ts
// src/components/product-card.tsx
import type { Product } from '@/types/product'

export interface ProductCardProps {
  product: Product
  onQuickAdd?: (productId: string) => void
}

export default function ProductCard({ product, onQuickAdd }: ProductCardProps) {
  // ...
}
```

```ts
// src/types/product.ts
export interface Product {
  id: string
  slug: string
  name: string
  price: number
}

export type ProductStatus = 'active' | 'draft' | 'archived'
```

**❌ MAL:**

```ts
// ❌ exports confusos
export function ProductCard() {}
export function product_card_helpers() {}
export const productcard = {}
```

---

### Handlers y eventos

- Usa `handleXxx` para funciones internas del componente.
- Usa `onXxx` en props que se pasan hacia afuera (contrato de evento).

**✅ BIEN:**

```tsx
interface Props {
  onSubmit?: (data: FormData) => void
  onCancel?: () => void
}

export default function CheckoutForm({ onSubmit, onCancel }: Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    onSubmit?.(formData)
  }

  const handleCancel = () => {
    onCancel?.()
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* campos */}
      <button type="submit">Pagar</button>
      <button type="button" onClick={handleCancel}>
        Cancelar
      </button>
    </form>
  )
}
```

**❌ MAL:**

```tsx
// ❌ Nombres confusos
function submit_form() {}
const on_click_btn = () => {}
function Process() {}
```

---

Aplica estas convenciones en todo el proyecto (`app/`, `components/`, `features/`, `lib/`, `types/`) para mantener el código consistente y fácil de leer.

### 🇪🇸 Idioma – Español Obligatorio

**TODO el código, documentación y comentarios DEBE estar en español.**

Esto incluye:
- **Nombres de variables y funciones** → camelCase en español  
- **Nombres de componentes** → PascalCase en español  
- **Comentarios en el código** → español  
- **Documentación de props** → español  
- **Textos en JSX/TSX** → español  
- **Errores y mensajes** → español  
- **Valores mágicos y constantes** → documentados en español  

**Excepciones (solo valores técnicos internos):**
- Imports de librerías externas (no se traducen).
- Nombres de APIs externas y métodos del navegador.
- Valores técnicos inamovibles (ej. `method: 'POST'`, `content-type`, etc.).

---

**✅ BIEN – Hook en español:**

```ts
// src/features/galeria/hooks.ts
import { useState, useEffect, useMemo } from 'react'
import { obtenerImagenes } from './queries'
import type { Imagen } from '@/tipos/imagen'

export function useGaleriaDatos(carpetaId: string) {
  const [imagenes, setImagenes] = useState<Imagen[]>([])
  const [estaCargando, setEstaCargando] = useState(true)
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null)
  const [terminoBusqueda, setTerminoBusqueda] = useState('')

  /** Obtiene las imágenes del servidor */
  useEffect(() => {
    let cancelado = false

    obtenerImagenes({ carpetaId })
      .then((datos) => {
        if (!cancelado) setImagenes(datos)
      })
      .catch((error) => {
        if (!cancelado)
          setErrorMensaje(error instanceof Error ? error.message : 'Error desconocido')
      })
      .finally(() => {
        if (!cancelado) setEstaCargando(false)
      })

    return () => {
      cancelado = true
    }
  }, [carpetaId])

  // Filtra imágenes por término de búsqueda
  const imagenesFiltrables = useMemo(() => {
    const termino = terminoBusqueda.toLowerCase()
    return imagenes.filter((img) => img.nombre.toLowerCase().includes(termino))
  }, [imagenes, terminoBusqueda])

  return {
    imagenes,
    estaCargando,
    errorMensaje,
    terminoBusqueda,
    setTerminoBusqueda,
    imagenesFiltrables,
  }
}
```

---

**✅ BIEN – Componente en español:**

```tsx
// src/components/tarjeta-imagen.tsx
'use client'

import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatearTamanioArchivo } from '@/lib/formateadores'
import type { Imagen } from '@/tipos/imagen'

export interface TarjetaImagenProps {
  imagen: Imagen
  onDescargar?: () => void
  onEliminar?: () => void
}

export default function TarjetaImagen({
  imagen,
  onDescargar,
  onEliminar,
}: TarjetaImagenProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <Image
          src={imagen.miniatura}
          alt={imagen.nombre}
          width={60}
          height={60}
          className="h-16 w-16 rounded object-cover"
        />

        <div className="flex-1">
          <h3 className="text-sm font-medium">{imagen.nombre}</h3>
          <p className="text-xs text-gray-600">
            {formatearTamanioArchivo(imagen.tamanio)}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDescargar}
            title="Descargar archivo"
          >
            ⬇️
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onEliminar}
            title="Eliminar imagen"
          >
            🗑️
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

**✅ BIEN – Página en español:**

```tsx
// src/app/(admin)/galeria/page.tsx
import { obtenerImagenes } from '@/features/galeria/queries'
import TarjetaImagen from '@/components/tarjeta-imagen'

export default async function GaleriaPage() {
  const imagenes = await obtenerImagenes({ carpetaId: 'principal' })

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Galería de imágenes</h1>

      {imagenes.length === 0 ? (
        <p>No hay imágenes en esta galería.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {imagenes.map((imagen) => (
            <TarjetaImagen
              key={imagen.id}
              imagen={imagen}
              onDescargar={() => console.log('Descargar', imagen.id)}
              onEliminar={() => console.log('Eliminar', imagen.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

---

**✅ BIEN – Utilidades y tipos en español:**

```ts
// src/lib/formateadores.ts
/**
 * Formatea un tamaño en bytes a una cadena legible.
 * Ejemplo: 1024 → "1 KB"
 */
export function formatearTamanioArchivo(bytes: number): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const tamanios = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${tamanios[i]}`
}
```

```ts
// src/tipos/imagen.ts
export interface Imagen {
  id: string
  nombre: string
  url: string
  miniatura: string
  tamanio: number
  createdAt: string
}

export type EstadoCarga = 'inicial' | 'cargando' | 'exitoso' | 'error'
```

---

**❌ MAL – Mezcla de idiomas:**

```ts
// ❌ Nombres en inglés
const imageList = useState<Imagen[]>([])
const loadImages = async () => {}
const handleClick = () => {}
const errorMessage = useState<string | null>(null)

// ❌ Comentarios en inglés
// This function loads all images from the server
const obtenerImagenes = () => {}

// ❌ Props sin traducir
interface Props {
  title: string      // ¿Por qué no "titulo"?
  loading: boolean   // ¿Por qué no "estaCargando"?
}
```

```tsx
// ❌ Componente con mezcla de idiomas
export default function ImageCard({ title, loading }: Props) {
  // ❌ Debería ser TarjetaImagen con titulo y estaCargando
  return <div>{title}</div>
}
```

---

**Excepciones (OK no traducir):**

```ts
// ✅ Imports de librerías externas (no se traducen)
import { useState, useEffect, useMemo } from 'react'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// ✅ Nombres de APIs externas
const respuesta = await fetch('[https://api.externa.com/imagenes](https://api.externa.com/imagenes)')

// ✅ Valores técnicos inamovibles
const solicitudHttp = await fetch(url, { method: 'POST' })

// ✅ Métodos de librerías y del lenguaje
imagenes.filter((img) => img.nombre.includes(termino))
Array.isArray(datos)
Object.entries(config)
```

---

Aplica esta regla en todo el proyecto (`app/`, `components/`, `features/`, `lib/`, `tipos/`) para mantener el código consistente y fácil de entender para todo el equipo en español.
### Estructura Interna de Componentes (Next.js 16)

Mantener un **orden lógico y consistente** dentro de cada archivo `.tsx`.

#### Orden recomendado en un componente

1. Imports (React/Next primero, luego librerías, luego propios)
2. Types / Interfaces
3. Props del componente
4. Estado local (`useState`, `useReducer`, etc.)
5. Hooks / stores / composables propios
6. Propiedades derivadas (`useMemo`, variables calculadas)
7. Funciones (handlers, helpers)
8. Efectos / lifecycle (`useEffect`, `useLayoutEffect`)
9. Retorno (JSX)

---

**✅ BIEN – Componente con estructura clara:**

```tsx
// src/components/product-card.tsx
'use client'

// 1. Imports
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/formateadores'
import { useCart } from '@/features/cart/hooks'
import type { Product } from '@/tipos/producto'

// 2. Types / Interfaces
export interface ProductCardProps {
  product: Product
}

// 3. Componente
export default function ProductCard({ product }: ProductCardProps) {
  // 4. Estado local (si hace falta)
  const router = useRouter()
  const { addItem } = useCart()

  // 5. Hooks / stores / composables propios
  // (ya usamos useCart arriba)

  // 6. Propiedades derivadas
  const precioFormateado = formatPrice(product.precio)

  // 7. Funciones
  const handleVerDetalle = () => {
    router.push(`/products/${product.slug}`)
  }

  const handleAgregarAlCarrito = () => {
    addItem({
      id: product.id,
      productId: product.id,
      precio: product.precio,
      cantidad: 1,
    })
  }

  // 8. Efectos / lifecycle (si hacen falta)
  // En este caso no necesitamos useEffect

  // 9. Retorno (JSX)
  return (
    <Card className="flex flex-col">
      <CardContent className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={product.imagenUrl}
            alt={product.nombre}
            fill
            className="object-cover"
          />
        </div>

        <div className="p-3">
          <h3 className="text-sm font-medium">{product.nombre}</h3>
          <p className="text-sm text-gray-600">{precioFormateado}</p>
        </div>
      </CardContent>

      <CardFooter className="mt-auto p-3">
        <Button className="w-full" size="sm" onClick={handleAgregarAlCarrito}>
          Agregar al carrito
        </Button>
        <Button
          className="mt-2 w-full"
          size="sm"
          variant="outline"
          onClick={handleVerDetalle}
        >
          Ver detalle
        </Button>
      </CardFooter>
    </Card>
  )
}
```

---

**✅ BIEN – Server Component con estructura clara:**

```tsx
// src/app/(storefront)/products/page.tsx

// 1. Imports
import { Suspense } from 'react'
import { getProducts } from '@/features/productos/queries'
import ProductGrid from '@/components/product-grid'
import ProductFilters from '@/components/product-filters'

// 2. Types / Interfaces
interface ProductsPageProps {
  searchParams: Promise<{
    q?: string
    categoria?: string
    orden?: string
  }>
}

// 3. Componente
export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  // 4. No hay estado local en Server Components
  // 5. No hooks en Server Components

  // 6. Obtención de datos
  const { q, categoria, orden } = await searchParams
  const productos = await getProducts({ q, categoria, orden })

  // 7. Funciones (si hacen falta)
  // En este caso no necesitamos

  // 8. No useEffect en Server Components

  // 9. Retorno (JSX)
  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Productos</h1>

      <Suspense fallback={<p>Cargando filtros…</p>}>
        <ProductFilters />
      </Suspense>

      <ProductGrid productos={productos} />
    </div>
  )
}
```

---

### TypeScript Siempre

Next.js + TypeScript hace el código más seguro y fácil de mantener.

**✅ BIEN – Componente con tipos explícitos:**

```tsx
// src/features/checkout/components/formulario-pago.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface DatosPago {
  numeroTarjeta: string
  titular: string
  vencimiento: string
  cvv: string
}

interface FormularioPagoProps {
  monto: number
  onPagoCompletado: (datos: DatosPago) => Promise<void>
}

export default function FormularioPago({
  monto,
  onPagoCompletado,
}: FormularioPagoProps) {
  const [datos, setDatos] = useState<DatosPago>({
    numeroTarjeta: '',
    titular: '',
    vencimiento: '',
    cvv: '',
  })

  const [estaEnviando, setEstaEnviando] = useState(false)
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null)

  const handleChange = (campo: keyof DatosPago, valor: string) => {
    setDatos((prev) => ({ ...prev, [campo]: valor }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEstaEnviando(true)
    setErrorMensaje(null)

    try {
      await onPagoCompletado(datos)
    } catch (error) {
      setErrorMensaje(
        error instanceof Error ? error.message : 'Error al procesar el pago'
      )
    } finally {
      setEstaEnviando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm">Monto a pagar: ${monto.toFixed(2)}</p>

      <Input
        label="Número de tarjeta"
        value={datos.numeroTarjeta}
        onChange={(e) => handleChange('numeroTarjeta', e.target.value)}
        required
      />
      <Input
        label="Titular"
        value={datos.titular}
        onChange={(e) => handleChange('titular', e.target.value)}
        required
      />
      <div className="grid grid-cols-2 gap-2">
        <Input
          label="Vencimiento"
          value={datos.vencimiento}
          onChange={(e) => handleChange('vencimiento', e.target.value)}
          placeholder="MM/AA"
          required
        />
        <Input
          label="CVV"
          value={datos.cvv}
          onChange={(e) => handleChange('cvv', e.target.value)}
          placeholder="123"
          required
        />
      </div>

      {errorMensaje && (
        <p className="text-sm text-red-600">{errorMensaje}</p>
      )}

      <Button type="submit" disabled={estaEnviando} className="w-full">
        {estaEnviando ? 'Procesando…' : 'Pagar'}
      </Button>
    </form>
  )
}
```

**❌ MAL – Sin tipos:**

```tsx
// ❌ Evita esto en Next.js + TypeScript
'use client'

import { useState } from 'react'

export default function FormularioPago({ monto, onPagoCompletado }: any) {
  const [datos, setDatos] = useState({
    numeroTarjeta: '',
    titular: '',
    vencimiento: '',
    cvv: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    await onPagoCompletado(datos)
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

---

### Organización dentro de un archivo `.tsx`

**✅ Orden correcto recomendado:**

1. Imports  
   - React / Next primero  
   - Librerías externas  
   - Componentes y utilidades propias  

2. Types / Interfaces  
   - Tipos locales del componente  
   - Props  

3. Declaración del componente  
   - `export default function NombreComponente(props: Props) { ... }`

4. Estado local  
   - `useState`, `useReducer`  

5. Hooks / stores / composables propios  
   - `useCart`, `useProductos`, etc.  

6. Propiedades derivadas  
   - `useMemo`, variables calculadas  

7. Funciones  
   - Handlers (`handleXxx`)  
   - Helpers internos  

8. Efectos / lifecycle  
   - `useEffect`, `useLayoutEffect` (solo en Client Components)  

9. Retorno (JSX)  

---

**✅ BIEN – Resumen visual:**

```tsx
// 1. Imports
import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useCart } from '@/features/cart/hooks'
import type { Product } from '@/tipos/producto'

// 2. Types / Interfaces
interface Props {
  product: Product
}

// 3. Componente
export default function ProductCard({ product }: Props) {
  // 4. Estado local
  const [estaCargando, setEstaCargando] = useState(false)

  // 5. Hooks / stores / composables
  const router = useRouter()
  const { addItem } = useCart()

  // 6. Propiedades derivadas
  const precioFormateado = useMemo(
    () => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(product.precio),
    [product.precio]
  )

  // 7. Funciones
  const handleAgregar = () => {
    setEstaCargando(true)
    addItem({ id: product.id, productId: product.id, precio: product.precio, cantidad: 1 })
      .finally(() => setEstaCargando(false))
  }

  const handleVerDetalle = () => {
    router.push(`/products/${product.slug}`)
  }

  // 8. Efectos
  useEffect(() => {
    // Ejemplo: log o analytics
    console.log('Producto renderizado:', product.nombre)
  }, [product.nombre])

  // 9. Retorno
  return (
    <div>
      <h3>{product.nombre}</h3>
      <p>{precioFormateado}</p>
      <button onClick={handleAgregar} disabled={estaCargando}>
        Agregar
      </button>
      <button onClick={handleVerDetalle}>Ver detalle</button>
    </div>
  )
}
```

Aplica este orden en todos los componentes (`app/`, `components/`, `features/*/components/`) para que cualquier persona del equipo pueda leer y entender rápidamente cada archivo.

---

## 🔧 Mantenibilidad (Next.js 16)

### 1. Documentación de Props

Todos los props deben estar documentados con comentarios JSDoc para que sea claro qué hace cada uno.

**✅ BIEN:**

```tsx
// src/components/tarjeta-imagen.tsx
'use client'

import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatearTamanioArchivo } from '@/lib/formateadores'
import type { Imagen } from '@/tipos/imagen'

export interface TarjetaImagenProps {
  /** Objeto con los datos de la imagen a mostrar */
  imagen: Imagen

  /** Callback opcional al hacer clic en descargar */
  onDescargar?: () => void

  /** Callback opcional al hacer clic en eliminar */
  onEliminar?: () => void

  /** Si la imagen es seleccionable (default: false) */
  seleccionable?: boolean

  /** Tamaño de la tarjeta (default: 'md') */
  tamanio?: 'sm' | 'md' | 'lg'
}

export default function TarjetaImagen({
  imagen,
  onDescargar,
  onEliminar,
  seleccionable = false,
  tamanio = 'md',
}: TarjetaImagenProps) {
  // ...
}
```

**✅ BIEN – Props con valores por defecto claros:**

```tsx
// src/components/product-card.tsx
'use client'

import type { Product } from '@/tipos/producto'

export interface ProductCardProps {
  /** Producto a mostrar en la tarjeta */
  product: Product

  /** Mostrar botón de "Agregar al carrito" (default: true) */
  mostrarBotonCarrito?: boolean

  /** Mostrar precio con descuento si existe (default: true) */
  mostrarDescuento?: boolean
}

export default function ProductCard({
  product,
  mostrarBotonCarrito = true,
  mostrarDescuento = true,
}: ProductCardProps) {
  // ...
}
```

**❌ MAL – Props sin documentar:**

```tsx
// ❌ No sabes qué hace cada prop
interface Props {
  data: any
  config: object
  onClick: () => void
  show: boolean
}
```

---

### 2. Formato de Código

Usa **Prettier + ESLint** (configurados en el proyecto) para mantener un estilo consistente.

```bash
npm run lint      # ESLint
npm run format    # Prettier
```

**Reglas base recomendadas:**

- Línea máx. **100–120 caracteres**
- **2 espacios** de indentación
- **Semicolons** al final de cada sentencia
- **Comillas simples** para strings (`'texto'`)
- TypeScript estricto activado (`strict: true` en `tsconfig.json`)

Configuración típica en `package.json`:

```json
{
  "scripts": {
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,md}\""
  }
}
```

---

### 3. Testing Mindset

Escribe componentes pensando en testing: fáciles de aislar, con props claros y sin dependencias hardcodeadas.

**✅ Testeable – Componente puro:**

```tsx
// src/components/boton-pago.tsx
'use client'

import { Button } from '@/components/ui/button'

export interface BotonPagoProps {
  /** Monto a pagar */
  monto: number

  /** Callback cuando se completa el pago */
  onPagoCompletado: () => void

  /** Si el botón está deshabilitado */
  deshabilitado?: boolean
}

export default function BotonPago({
  monto,
  onPagoCompletado,
  deshabilitado = false,
}: BotonPagoProps) {
  const handleClick = () => {
    onPagoCompletado()
  }

  return (
    <Button disabled={deshabilitado} onClick={handleClick}>
      Pagar ${monto.toFixed(2)}
    </Button>
  )
}
```

Este componente es fácil de testear porque:

- Solo depende de sus props.
- No tiene lógica de API ni stores hardcodeados.
- Es predecible: mismos props → mismo render.

**❌ Difícil de testear – Dependencias hardcodeadas:**

```tsx
// ❌ Componente acoplado a implementaciones concretas
'use client'

import { useCartStore } from '@/stores/cart-store'
import { fetchProductsFromAPI } from '@/services/products'

export default function ProductList() {
  const cart = useCartStore()
  const [products, setProducts] = useState([])

  useEffect(() => {
    fetchProductsFromAPI().then(setProducts)
  }, [])

  // ...
}
```

Para hacerlo testeable, inyecta las dependencias:

```tsx
// ✅ Versión testeable
interface Props {
  products: Product[]
  onAddToCart: (productId: string) => void
}

export default function ProductList({ products, onAddToCart }: Props) {
  // ...
}
```

---

### 4. Refactoring Preventivo

No esperes a que el código esté roto para refactorizar.

**Señales de que toca refactorizar:**

- Un componente supera **150–200 líneas** → dividir en componentes más pequeños.
- Ves **lógica repetida** en 2+ componentes → extraer a:
  - Hook (`useXxx`) en `hooks/` o `features/*/hooks.ts`
  - Función utilitaria en `lib/`
- Un prop tiene **10+ opciones** o un `switch` gigante → probablemente necesita redesign (ej. usar composición, variantes, o separar componentes).
- Te toma **más de 5–10 segundos** entender qué hace un componente → simplificar o dividir.
- Una página (`app/.../page.tsx`) mezcla:
  - Data fetching
  - Filtros
  - UI compleja
  - Acciones  
  → separar en:
  - Server Component (data fetching)
  - Componentes de UI (`components/`, `features/*/components/`)
  - Server Actions (`features/*/actions.ts`)

**Ejemplo de refactor preventivo:**

Si empiezas con:

```tsx
// app/(storefront)/products/page.tsx (monolítico)
export default async function ProductsPage() {
  // data fetching
  // filtros
  // lista de productos
  // acciones
}
```

Refactoriza a:

```text
app/(storefront)/products/page.tsx      # Solo orquesta
components/product-filters.tsx          # UI de filtros
components/product-grid.tsx             # Grid de productos
components/product-card.tsx             # Tarjeta individual
features/products/queries.ts            # Data fetching
features/products/actions.ts            # Acciones (si hacen falta)
```

---

### 5. Comentarios y Documentación Interna

- Comenta **por qué**, no **qué** (el código ya muestra el qué).
- Usa JSDoc en funciones y componentes públicos:

```ts
/**
 * Obtiene productos filtrados y ordenados según los parámetros.
 */
export async function getProducts({
  q,
  categoria,
  orden,
}: {
  q?: string
  categoria?: string
  orden?: string
}): Promise<Product[]> {
  // ...
}
```

- Documenta constantes mágicas:

```ts
// Tiempo de caché para productos destacados (en segundos)
const CACHE_PRODUCTOS_DESTACADOS = 3600
```

---

Aplica estas prácticas en todo el proyecto (`app/`, `components/`, `features/`, `lib/`, `tipos/`) para mantener el código fácil de leer, modificar y testear a lo largo del tiempo.

---
## 📚 Ejemplos Prácticos (Next.js 16)

### Ejemplo 1: Componente Mal Hecho vs. Bien Hecho

**❌ MAL – ProductsPage (145 líneas de caos):**

```tsx
// ❌ app/(storefront)/products/page.tsx (monolítico, difícil de mantener)
'use client'

import { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import { deleteProduct } from '@/features/products/actions'
import type { Product } from '@/tipos/producto'

export default function ProductsPage() {
  const [productos, setProductos] = useState<Product[]>([])
  const [estaCargando, setEstaCargando] = useState(true)
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null)
  const [terminoBusqueda, setTerminoBusqueda] = useState('')
  const [orden, setOrden] = useState<'nombre' | 'precio' | 'fecha'>('fecha')
  const [categoria, setCategoria] = useState<string | null>(null)

  useEffect(() => {
    setEstaCargando(true)
    fetch('/api/productos')
      .then((res) => res.json())
      .then((datos) => {
        setProductos(datos)
        setEstaCargando(false)
      })
      .catch((err) => {
        setErrorMensaje(err.message)
        setEstaCargando(false)
      })
  }, [])

  const productosFiltrados = useMemo(() => {
    let resultado = productos.filter((p) =>
      p.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase())
    )

    if (categoria) {
      resultado = resultado.filter((p) => p.categoria === categoria)
    }

    if (orden === 'nombre') {
      resultado.sort((a, b) => a.nombre.localeCompare(b.nombre))
    } else if (orden === 'precio') {
      resultado.sort((a, b) => a.precio - b.precio)
    } else {
      resultado.sort(
        (a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
      )
    }

    return resultado
  }, [productos, terminoBusqueda, orden, categoria])

  async function handleEliminar(id: string) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return
    await deleteProduct(id)
    setProductos((prev) => prev.filter((p) => p.id !== id))
  }

  function formatearPrecio(precio: number) {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(precio)
  }

  if (estaCargando) return <div>Cargando productos...</div>
  if (errorMensaje) return <div>Error: {errorMensaje}</div>

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Productos</h1>

      <div className="mb-4 flex gap-2">
        <input
          value={terminoBusqueda}
          onChange={(e) => setTerminoBusqueda(e.target.value)}
          placeholder="Buscar productos..."
          className="rounded border px-2 py-1"
        />
        <select
          value={orden}
          onChange={(e) => setOrden(e.target.value as any)}
          className="rounded border px-2 py-1"
        >
          <option value="fecha">Fecha</option>
          <option value="nombre">Nombre</option>
          <option value="precio">Precio</option>
        </select>
        <select
          value={categoria ?? ''}
          onChange={(e) => setCategoria(e.target.value || null)}
          className="rounded border px-2 py-1"
        >
          <option value="">Todas las categorías</option>
          <option value="ropa">Ropa</option>
          <option value="accesorios">Accesorios</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {productosFiltrados.map((p) => (
          <div key={p.id} className="rounded border p-3">
            <div className="relative h-40 w-full">
              <Image src={p.imagenUrl} alt={p.nombre} fill className="object-cover" />
            </div>
            <h3 className="mt-2 text-sm font-medium">{p.nombre}</h3>
            <p className="text-sm text-gray-600">{formatearPrecio(p.precio)}</p>
            <div className="mt-2 flex gap-2">
              <button
                className="rounded bg-blue-600 px-2 py-1 text-xs text-white"
                onClick={() => console.log('Ver detalle', p.id)}
              >
                Ver
              </button>
              <button
                className="rounded bg-red-600 px-2 py-1 text-xs text-white"
                onClick={() => handleEliminar(p.id)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

Problemas:

- Un solo archivo con > 140 líneas.
- Mezcla data fetching, filtros, UI y acciones.
- Difícil de testear y reutilizar.
- Lógica de filtrado y ordenamiento dentro del componente.

---

**✅ BIEN – Dividido en componentes y features:**

Estructura:

```text
app/(storefront)/products/
└─ page.tsx                 # Contenedor (Server Component)

components/
├─ product-filters.tsx      # UI de filtros
├─ product-grid.tsx         # Grid de productos
└─ product-card.tsx         # Tarjeta individual

features/
└─ products/
   ├─ queries.ts            # Data fetching
   └─ actions.ts            # Acciones (eliminar, etc.)
```

---

`page.tsx` (40–50 líneas – contenedor):

```tsx
// app/(storefront)/products/page.tsx
import { Suspense } from 'react'
import { getProducts } from '@/features/products/queries'
import ProductFilters from '@/components/product-filters'
import ProductGrid from '@/components/product-grid'

interface ProductsPageProps {
  searchParams: Promise<{
    q?: string
    categoria?: string
    orden?: 'nombre' | 'precio' | 'fecha'
  }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { q, categoria, orden } = await searchParams

  const productos = await getProducts({ q, categoria, orden })

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Productos</h1>

      <Suspense fallback={<p>Cargando filtros…</p>}>
        <ProductFilters />
      </Suspense>

      <ProductGrid productos={productos} />
    </div>
  )
}
```

---

`product-filters.tsx` (35–45 líneas):

```tsx
// src/components/product-filters.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function ProductFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const actualizarParametro = useCallback(
    (clave: string, valor: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(clave, valor)
      router.push(`?${params.toString()}`)
    },
    [router, searchParams]
  )

  return (
    <div className="mb-4 flex gap-2">
      <Input
        defaultValue={searchParams.get('q') ?? ''}
        onChange={(e) => actualizarParametro('q', e.target.value)}
        placeholder="Buscar productos..."
        className="w-48"
      />

      <Select
        defaultValue={searchParams.get('orden') ?? 'fecha'}
        onValueChange={(v) => actualizarParametro('orden', v)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Ordenar por" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="fecha">Fecha</SelectItem>
          <SelectItem value="nombre">Nombre</SelectItem>
          <SelectItem value="precio">Precio</SelectItem>
        </SelectContent>
      </Select>

      <Select
        defaultValue={searchParams.get('categoria') ?? ''}
        onValueChange={(v) => actualizarParametro('categoria', v)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Categoría" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todas</SelectItem>
          <SelectItem value="ropa">Ropa</SelectItem>
          <SelectItem value="accesorios">Accesorios</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
```

---

`product-grid.tsx` (25–35 líneas):

```tsx
// src/components/product-grid.tsx
import ProductCard from './product-card'
import type { Product } from '@/tipos/producto'

export interface ProductGridProps {
  productos: Product[]
}

export default function ProductGrid({ productos }: ProductGridProps) {
  if (productos.length === 0) {
    return <p>No se encontraron productos.</p>
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {productos.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
```

---

`product-card.tsx` (50–60 líneas – presentacional):

```tsx
// src/components/product-card.tsx
'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCart } from '@/features/cart/hooks'
import { formatPrice } from '@/lib/formateadores'
import type { Product } from '@/tipos/producto'

export interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter()
  const { addItem } = useCart()

  const precioFormateado = formatPrice(product.precio)

  const handleVerDetalle = () => {
    router.push(`/products/${product.slug}`)
  }

  const handleAgregarAlCarrito = () => {
    addItem({
      id: product.id,
      productId: product.id,
      precio: product.precio,
      cantidad: 1,
    })
  }

  return (
    <Card className="flex flex-col">
      <CardContent className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={product.imagenUrl}
            alt={product.nombre}
            fill
            className="object-cover"
          />
        </div>

        <div className="p-3">
          <h3 className="text-sm font-medium">{product.nombre}</h3>
          <p className="text-sm text-gray-600">{precioFormateado}</p>
        </div>
      </CardContent>

      <CardFooter className="mt-auto flex gap-2 p-3">
        <Button className="flex-1" size="sm" onClick={handleVerDetalle}>
          Ver
        </Button>
        <Button className="flex-1" size="sm" onClick={handleAgregarAlCarrito}>
          Agregar
        </Button>
      </CardFooter>
    </Card>
  )
}
```

**Comparación:**

- ❌ MAL: 1 archivo, ~145 líneas, imposible de testear, acoplado.
- ✅ BIEN: 4 archivos, cada uno ~40–60 líneas, testeable, reutilizable y claro.

---

### Ejemplo 2: Hook de Lógica Común

`useProductActions.ts`:

```ts
// src/features/products/hooks.ts
'use client'

import { useState } from 'react'
import { deleteProduct } from './actions'

export function useProductActions() {
  const [estaProcesando, setEstaProcesando] = useState(false)
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null)

  const handleEliminar = async (productId: string, onSuccess?: () => void) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return

    setEstaProcesando(true)
    setErrorMensaje(null)

    try {
      await deleteProduct(productId)
      onSuccess?.()
    } catch (err) {
      setErrorMensaje(
        err instanceof Error ? err.message : 'Error al eliminar el producto'
      )
    } finally {
      setEstaProcesando(false)
    }
  }

  return {
    estaProcesando,
    errorMensaje,
    handleEliminar,
  }
}
```

**Uso en cualquier componente:**

```tsx
// src/components/admin/product-row.tsx
'use client'

import { useProductActions } from '@/features/products/hooks'

interface ProductRowProps {
  productId: string
  nombre: string
  onEliminado?: () => void
}

export default function ProductRow({ productId, nombre, onEliminado }: ProductRowProps) {
  const { estaProcesando, errorMensaje, handleEliminar } = useProductActions()

  return (
    <tr>
      <td>{nombre}</td>
      <td>
        <button
          disabled={estaProcesando}
          onClick={() => handleEliminar(productId, onEliminado)}
        >
          {estaProcesando ? 'Eliminando…' : 'Eliminar'}
        </button>
        {errorMensaje && <p className="text-sm text-red-600">{errorMensaje}</p>}
      </td>
    </tr>
  )
}
```

Con este patrón:

- La lógica de eliminación está centralizada.
- Cualquier componente que necesite eliminar productos solo usa `useProductActions`.
- Es fácil de testear y modificar sin tocar múltiples archivos.

---

Puedes seguir este mismo enfoque para otras áreas del ecommerce: carrito, checkout, usuarios, etc., manteniendo componentes pequeños, hooks reutilizables y una clara separación de responsabilidades.

## ⚠️ Anti-Patrones a Evitar (Next.js 16)

| Anti-patrón | ❌ Problema | ✅ Solución |
|------------|-----------|----------|
| **Props drilling excesivo** (pasar props por 3+ niveles) | Acoplamiento innecesario, difícil de mantener | Usar hooks compartidos (`useCart`, `useUser`), contexto o mantener la lógica cerca de donde se usa |
| **Lógica de negocio en el JSX** | Difícil de testear y leer | Mover lógica a funciones, hooks o Server Actions fuera del retorno |
| **Componentes gigantes (200+ líneas)** | Incomprensible, no testeable | Dividir en componentes más pequeños y hooks |
| **Mutación directa de estado o props** | Comportamiento inesperado, bugs sutiles | Usar `setState` de forma inmutable, no mutar objetos/arrays directamente |
| **Llamadas a API en `useEffect` sin cleanup ni control** | Memory leaks, requests innecesarias, race conditions | Usar `AbortController`, limpiar en el return del `useEffect`, o mejor: usar Server Components y Server Actions |
| **`useMemo` / `useCallback` sin dependencias claras o sin necesidad** | Lógica “mágica”, posible caché incorrecto | Usar `useMemo` solo cuando hay cálculos costosos o dependencias claras; si no, usar variables normales |
| **Estado local para datos derivados** | Reactividad inconsistente, bugs | Usar `useMemo` o simplemente calcular el valor en el render si es barato |
| **Mezclar lógica de servidor y cliente sin criterio** | Hidratación incorrecta, errores de “window is not defined” | Marcar `'use client'` solo cuando hace falta (estado, eventos, navegador); dejar el resto como Server Component |
| **Server Actions que hacen demasiado** | Difícil de testear y mantener | Una Server Action = una responsabilidad clara; dividir si crece mucho |
| **Componentes de cliente que hacen fetching de datos que podría ser servidor** | Peor SEO, más tiempo de carga, más JavaScript en cliente | Usar Server Components para fetching de datos; cliente solo para interacción |
| **Contextos globales para todo** | Re-renders innecesarios, estado difícil de rastrear | Usar contexto solo cuando realmente es global; para lo demás, props + hooks + features |

---

### Ejemplos concretos de anti-patrones en Next.js

#### 1. Props drilling excesivo

**❌ MAL:**

```tsx
// app/(storefront)/products/page.tsx
export default async function ProductsPage() {
  const productos = await getProducts()
  return <ProductGrid productos={productos} usuario={usuario} carrito={carrito} />
}

// components/product-grid.tsx
export default function ProductGrid({ productos, usuario, carrito }: any) {
  return (
    <div>
      {productos.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          usuario={usuario}
          carrito={carrito}
        />
      ))}
    </div>
  )
}

// components/product-card.tsx
export default function ProductCard({ product, usuario, carrito }: any) {
  // solo usa product
}
```

**✅ BIEN:**

```tsx
// components/product-card.tsx
export interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  // usa solo lo que necesita
}

// components/product-grid.tsx
export interface ProductGridProps {
  productos: Product[]
}

export default function ProductGrid({ productos }: ProductGridProps) {
  return (
    <div>
      {productos.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
```

Si necesitas carrito o usuario, úsalos donde haga falta (hook, contexto limitado, o pasar solo a los componentes que lo requieren).

---

#### 2. Lógica de negocio en el JSX

**❌ MAL:**

```tsx
export default function CartSummary({ items }: { items: CartItem[] }) {
  return (
    <div>
      <p>
        Total:{' '}
        ${items
          .reduce((acc, item) => acc + item.precio * item.cantidad, 0)
          .toFixed(2)}
      </p>
      <p>
        Descuento:{' '}
        ${items
          .filter((i) => i.conDescuento)
          .reduce((acc, item) => acc + item.precio * 0.1 * item.cantidad, 0)
          .toFixed(2)}
      </p>
    </div>
  )
}
```

**✅ BIEN:**

```tsx
function calcularTotal(items: CartItem[]): number {
  return items.reduce((acc, item) => acc + item.precio * item.cantidad, 0)
}

function calcularDescuento(items: CartItem[]): number {
  return items
    .filter((i) => i.conDescuento)
    .reduce((acc, item) => acc + item.precio * 0.1 * item.cantidad, 0)
}

export default function CartSummary({ items }: { items: CartItem[] }) {
  const total = calcularTotal(items)
  const descuento = calcularDescuento(items)

  return (
    <div>
      <p>Total: ${total.toFixed(2)}</p>
      <p>Descuento: ${descuento.toFixed(2)}</p>
    </div>
  )
}
```

---

#### 3. Componentes gigantes (200+ líneas)

Ya visto en el ejemplo de `ProductsPage` monolítico vs. dividido en:

- `page.tsx` (contenedor)
- `product-filters.tsx`
- `product-grid.tsx`
- `product-card.tsx`
- `features/products/queries.ts`
- `features/products/actions.ts`

Regla: si pasas de ~150–200 líneas y el componente hace varias cosas, divide.

---

#### 4. Mutación directa de estado o props

**❌ MAL:**

```tsx
'use client'

export default function CartBad({ items }: { items: CartItem[] }) {
  const handleIncrementar = (index: number) => {
    // ❌ mutación directa
    items[index].cantidad++
  }

  return <div>...</div>
}
```

**✅ BIEN:**

```tsx
'use client'

import { useState } from 'react'
import type { CartItem } from '@/tipos/carrito'

export default function CartGood({ initialItems }: { initialItems: CartItem[] }) {
  const [items, setItems] = useState(initialItems)

  const handleIncrementar = (index: number) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, cantidad: item.cantidad + 1 } : item
      )
    )
  }

  return <div>...</div>
}
```

---

#### 5. Llamadas a API en `useEffect` sin cleanup

**❌ MAL:**

```tsx
'use client'

import { useEffect, useState } from 'react'

export default function ProductsBad() {
  const [productos, setProductos] = useState([])

  useEffect(() => {
    // ❌ Sin cleanup, sin AbortController
    fetch('/api/productos').then((res) => res.json()).then(setProductos)
  }, [])

  return <div>...</div>
}
```

**✅ BIEN:**

```tsx
'use client'

import { useEffect, useState } from 'react'

export default function ProductsGood() {
  const [productos, setProductos] = useState([])

  useEffect(() => {
    const controller = new AbortController()

    fetch('/api/productos', { signal: controller.signal })
      .then((res) => res.json())
      .then(setProductos)
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error(err)
        }
      })

    return () => {
      controller.abort()
    }
  }, [])

  return <div>...</div>
}
```

O, mejor aún en Next.js 16: usar **Server Component** y hacer el fetching en servidor.

---

#### 6. `useMemo` / `useCallback` mal usados

**❌ MAL:**

```tsx
'use client'

import { useMemo } from 'react'

export default function ProductCard({ product }: { product: Product }) {
  // ❌ useMemo innecesario para algo barato
  const nombre = useMemo(() => product.nombre, [product.nombre])

  return <h3>{nombre}</h3>
}
```

**✅ BIEN:**

```tsx
export default function ProductCard({ product }: { product: Product }) {
  // ✅ Sin useMemo innecesario
  return <h3>{product.nombre}</h3>
}
```

Usa `useMemo` cuando:

- El cálculo es costoso.
- Depende de varias variables y quieres evitar recalcular en cada render.

---

#### 7. Estado local para datos derivados

**❌ MAL:**

```tsx
'use client'

import { useState, useEffect } from 'react'

export default function CartBad({ items }: { items: CartItem[] }) {
  const [total, setTotal] = useState(0)

  useEffect(() => {
    setTotal(
      items.reduce((acc, item) => acc + item.precio * item.cantidad, 0)
    )
  }, [items])

  return <p>Total: ${total}</p>
}
```

**✅ BIEN:**

```tsx
export default function CartGood({ items }: { items: CartItem[] }) {
  const total = items.reduce((acc, item) => acc + item.precio * item.cantidad, 0)

  return <p>Total: ${total}</p>
}
```

---

#### 8. Mezclar servidor y cliente sin criterio

**❌ MAL:**

```tsx
// ❌ Todo marcado como cliente sin necesidad
'use client'

import { getProducts } from '@/features/products/queries'

export default function ProductsPage() {
  const productos = getProducts() // ❌ llamada sincrónica en cliente

  return <div>...</div>
}
```

**✅ BIEN:**

```tsx
// ✅ Server Component por defecto
import { getProducts } from '@/features/products/queries'
import ProductGrid from '@/components/product-grid'

export default async function ProductsPage() {
  const productos = await getProducts()
  return <ProductGrid productos={productos} />
}
```

Solo usa `'use client'` cuando necesites:

- Estado local (`useState`, `useReducer`)
- Eventos del navegador (`onClick`, `onChange`, etc.)
- APIs del navegador (`window`, `localStorage`, etc.)

---

Aplica estas reglas en todo el proyecto para evitar deuda técnica, componentes difíciles de mantener y bugs sutiles.

## 🧪 Testing (Next.js 16)

Aunque uses las herramientas de testing que prefieras (Jest, Vitest, React Testing Library, Playwright, etc.), sigue estos principios:

- **Aislamiento**: Un componente debe poder testearse sin depender de sus hijos ni de la app completa.
- **Mocking**: Las dependencias externas (APIs, Server Actions, hooks de estado global) deben ser mockeadas.
- **Semántica**: Testea comportamiento y resultados visibles, no detalles de implementación internos.
- **Coverage**: Apunta a >80% de cobertura en lógica crítica (features, hooks, utilidades, componentes clave).

---

### Principios aplicados a Next.js

#### 1. Aislamiento

**✅ BIEN – Componente testeable en aislamiento:**

```tsx
// src/components/product-card.tsx
'use client'

import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/formateadores'
import type { Product } from '@/tipos/producto'

export interface ProductCardProps {
  product: Product
  onVerDetalle?: (slug: string) => void
  onAgregarAlCarrito?: (productId: string) => void
}

export default function ProductCard({
  product,
  onVerDetalle,
  onAgregarAlCarrito,
}: ProductCardProps) {
  const precioFormateado = formatPrice(product.precio)

  return (
    <Card>
      <CardContent>
        <Image src={product.imagenUrl} alt={product.nombre} width={300} height={200} />
        <h3>{product.nombre}</h3>
        <p>{precioFormateado}</p>
      </CardContent>
      <CardFooter>
        <Button onClick={() => onVerDetalle?.(product.slug)}>Ver</Button>
        <Button onClick={() => onAgregarAlCarrito?.(product.id)}>Agregar</Button>
      </CardFooter>
    </Card>
  )
}
```

Este componente es fácil de testear porque:

- Solo depende de sus props.
- No tiene lógica de API ni estado global hardcodeado.
- Puedes probar qué hace al hacer clic en los botones.

---

#### 2. Mocking de dependencias

**✅ BIEN – Mock de hooks y Server Actions:**

Ejemplo conceptual con React Testing Library + Jest/Vitest:

```ts
// src/components/product-card.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import ProductCard from './product-card'
import type { Product } from '@/tipos/producto'

const mockProduct: Product = {
  id: 'prod-1',
  slug: 'camiseta-basica',
  nombre: 'Camiseta básica',
  precio: 49.9,
  imagenUrl: '/images/camiseta.jpg',
  categoria: 'ropa',
}

describe('ProductCard', () => {
  it('llama a onAgregarAlCarrito con el productId al hacer clic en "Agregar"', () => {
    const onAgregarAlCarrito = jest.fn()
    const onVerDetalle = jest.fn()

    render(
      <ProductCard
        product={mockProduct}
        onVerDetalle={onVerDetalle}
        onAgregarAlCarrito={onAgregarAlCarrito}
      />
    )

    const botonAgregar = screen.getByRole('button', { name: /agregar/i })
    fireEvent.click(botonAgregar)

    expect(onAgregarAlCarrito).toHaveBeenCalledTimes(1)
    expect(onAgregarAlCarrito).toHaveBeenCalledWith(mockProduct.id)
  })

  it('llama a onVerDetalle con el slug al hacer clic en "Ver"', () => {
    const onAgregarAlCarrito = jest.fn()
    const onVerDetalle = jest.fn()

    render(
      <ProductCard
        product={mockProduct}
        onVerDetalle={onVerDetalle}
        onAgregarAlCarrito={onAgregarAlCarrito}
      />
    )

    const botonVer = screen.getByRole('button', { name: /ver/i })
    fireEvent.click(botonVer)

    expect(onVerDetalle).toHaveBeenCalledTimes(1)
    expect(onVerDetalle).toHaveBeenCalledWith(mockProduct.slug)
  })
})
```

**❌ MAL – Test acoplado a implementación interna:**

```ts
// ❌ No testes esto
it('llama a la Server Action addToCart directamente', async () => {
  // Testear que se llama a una Server Action concreta
  // te acopla a la implementación, no al comportamiento visible
})
```

En su lugar, testea:

- Que al hacer clic se dispara el callback esperado.
- Que se muestra el mensaje correcto.
- Que el estado cambia como corresponde.

---

#### 3. Testear comportamiento, no implementación

**✅ BIEN – Test semántico:**

```ts
describe('CartSummary', () => {
  it('muestra el total calculado a partir de los items del carrito', () => {
    const items: CartItem[] = [
      { id: '1', productId: 'p1', precio: 10, cantidad: 2 },
      { id: '2', productId: 'p2', precio: 5, cantidad: 3 },
    ]

    render(<CartSummary items={items} />)

    // Total = 10*2 + 5*3 = 35
    expect(screen.getByText(/total:/i)).toHaveTextContent('Total: $35.00')
  })

  it('muestra un mensaje cuando el carrito está vacío', () => {
    render(<CartSummary items={[]} />)

    expect(screen.getByText(/tu carrito está vacío/i)).toBeInTheDocument()
  })
})
```

**❌ MAL – Test acoplado a detalles internos:**

```ts
// ❌ No hagas esto
it('usa la función calcularTotalInternamente con los items correctos', () => {
  // Testear una función interna o estado privado
  // te acopla a cómo está implementado, no a qué hace
})
```

---

#### 4. Coverage enfocado en lo importante

Prioriza cobertura en:

- **Hooks**: `useCart`, `useProductActions`, etc.
- **Utilidades**: `formatPrice`, `formatFileSize`, validaciones, etc.
- **Server Actions**: lógica de mutación (crear pedido, actualizar carrito, etc.).
- **Componentes clave**: `ProductCard`, `CartItem`, `CheckoutForm`, `OrderSummary`, etc.

No es necesario testear cada pequeño componente de UI de shadcn; céntrate en tu lógica de dominio (productos, carrito, checkout, usuarios).

---

### Ejemplos conceptuales

#### Hook testeable

```ts
// src/features/cart/hooks.test.ts
import { renderHook, act } from '@testing-library/react'
import { useCart } from './hooks'

describe('useCart', () => {
  it('agrega un item al carrito y actualiza el total', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.addItem({
        id: 'item-1',
        productId: 'prod-1',
        precio: 10,
        cantidad: 2,
      })
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.total).toBe(20)
  })

  it('actualiza la cantidad de un item existente', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.addItem({
        id: 'item-1',
        productId: 'prod-1',
        precio: 10,
        cantidad: 1,
      })
      result.current.updateQuantity('item-1', 3)
    })

    expect(result.current.items.cantidad).toBe(3)
    expect(result.current.total).toBe(30)
  })
})
```

---

#### Componente con Server Action (test de comportamiento)

```tsx
// src/components/add-to-cart-button.tsx
'use client'

import { addToCart } from '@/features/cart/actions'
import { Button } from '@/components/ui/button'
import type { Product } from '@/tipos/producto'

export interface AddToCartButtonProps {
  product: Product
  onAdded?: () => void
}

export default function AddToCartButton({ product, onAdded }: AddToCartButtonProps) {
  return (
    <form
      action={async () => {
        'use server'
        await addToCart({
          id: product.id,
          productId: product.id,
          precio: product.precio,
          cantidad: 1,
        })
        onAdded?.()
      }}
    >
      <Button type="submit">Agregar al carrito</Button>
    </form>
  )
}
```

Test conceptual:

```ts
describe('AddToCartButton', () => {
  it('llama a onAdded después de enviar el formulario', async () => {
    const onAdded = jest.fn()
    const product: Product = { /* ... */ }

    render(<AddToCartButton product={product} onAdded={onAdded} />)

    const boton = screen.getByRole('button', { name: /agregar al carrito/i })
    fireEvent.click(boton)

    // Aquí dependería de cómo mocks las Server Actions,
    // pero lo importante es testear que onAdded se llama
    // cuando la acción "termina".
    expect(onAdded).toHaveBeenCalled()
  })
})
```

---

### Resumen de buenas prácticas de testing

- Escribe componentes y hooks **pensando en testing** desde el inicio.
- Usa **props y callbacks claros** para poder mockear comportamientos.
- Testea **qué hace el componente**, no cómo lo hace por dentro.
- Mantén los tests **legibles y cercanos al dominio** (carrito, productos, checkout).
- No busques 100% de cobertura a cualquier costo; prioriza **lo crítico para el negocio**.

Aplica estos principios en `components/`, `features/`, `hooks/` y `lib/` para tener una base sólida que te permita refactorizar con confianza.
