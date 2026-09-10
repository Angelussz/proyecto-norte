export interface ProductoCarrito {
  id: string
  nombre: string
  color: string
  tamanio: string
  precio: number
  imagenUrl: string
  cantidad: number
}

export interface ResumenPedido {
  subtotal: number
  envio: string
  impuestos: string
  total: number
}
