export interface CartItem {
  id: string
  name: string
  color: string
  size: string
  price: number
  imageUrl: string
  quantity: number
}

/**
 * Resumen del carrito: solo lo que el cliente conoce (suma de prendas x unidades).
 * Envío e impuestos los calcula el backend en el checkout (GET /api/checkout).
 */
export interface OrderSummary {
  subtotal: number
}
