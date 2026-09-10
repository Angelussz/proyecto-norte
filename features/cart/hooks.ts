"use client"

import { useState } from "react"
import type { ProductoCarrito, ResumenPedido } from "@/types/cart"

const PRODUCTOS_EJEMPLO: ProductoCarrito[] = [
  {
    id: "1",
    nombre: "Structured Wool Coat",
    color: "Stone Grey",
    tamanio: "L",
    precio: 450,
    imagenUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBrtrcFGyOp3-sKX00ylLWfidMZMSfdxEUvZwD5E2E9THKqE9q9zDflOSBiQEvKX37HTyYB3EnUrAIDjw0dumhUZ4oQ1QiQpel85rqSBBxtkHMWIxbcD_LWJOvOunMC_Tdgd4Aa0iAWwRi7PIF9Tq1ZV3IEDBlxukUUIcB-3kHLip9F_JCX2gj7rUr1orwZrmqmKGaUcrWWSSGb0YYyAJtjN0rzfrkbxTPLx50ka887dPzDEGFql3B7",
    cantidad: 1,
  },
  {
    id: "2",
    nombre: "Premium Leather Boots",
    color: "Warm Black",
    tamanio: "42",
    precio: 320,
    imagenUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuArWqimaebFD9-z-m0fSd0_KCGAjWNYsJHOzYUglWMVF3N9fcIunWHL-iyDMnOxUJJqpa3TQZQ3mFjHAkRrN7-C7y-XatidzziLsW3THfKA7flScjuzLJOgLMB4jXSiJmx9urn2k78KhkhcHwsvOuUpcjntFpBoTqWbDH57gij1eY-XU_2eFLe-zN6AKeaQ0wO4NyU8JjzkmCRjKbnbrv-0P_y6hkmK2sA84fK4v1bTNCu78-deE45v",
    cantidad: 1,
  },
]

export function useCarrito() {
  const [productos, setProductos] =
    useState<ProductoCarrito[]>(PRODUCTOS_EJEMPLO)

  const actualizarCantidad = (id: string, nuevaCantidad: number) => {
    if (nuevaCantidad < 1) return
    setProductos((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, cantidad: nuevaCantidad } : item
      )
    )
  }

  const eliminarProducto = (id: string) => {
    setProductos((prev) => prev.filter((item) => item.id !== id))
  }

  const subtotal = productos.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  )

  const totalItems = productos.reduce(
    (acc, item) => acc + item.cantidad,
    0
  )

  const resumen: ResumenPedido = {
    subtotal,
    envio: "Calculated at checkout",
    impuestos: "Calculated at checkout",
    total: subtotal,
  }

  return {
    productos,
    resumen,
    totalItems,
    actualizarCantidad,
    eliminarProducto,
  }
}
