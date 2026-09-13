export interface CartItem {
  id: string
  name: string
  color: string
  size: string
  price: number
  imageUrl: string
  quantity: number
}

export interface OrderSummary {
  subtotal: number
  shipping: string
  taxes: string
  total: number
}
