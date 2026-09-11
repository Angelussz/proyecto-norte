"use client"

import { useState, useEffect } from "react"
import type { CartItem, OrderSummary } from "@/types/cart"

const EXAMPLE_PRODUCTS: CartItem[] = [
  {
    id: "1",
    name: "Structured Wool Coat",
    color: "Stone Grey",
    size: "L",
    price: 450,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBrtrcFGyOp3-sKX00ylLWfidMZMSfdxEUvZwD5E2E9THKqE9q9zDflOSBiQEvKX37HTyYB3EnUrAIDjw0dumhUZ4oQ1QiQpel85rqSBBxtkHMWIxbcD_LWJOvOunMC_Tdgd4Aa0iAWwRi7PIF9Tq1ZV3IEDBlxukUUIcB-3kHLip9F_JCX2gj7rUr1orwZrmqmKGaUcrWWSSGb0YYyAJtjN0rzfrkbxTPLx50ka887dPzDEGFql3B7",
    quantity: 1,
  },
  {
    id: "2",
    name: "Premium Leather Boots",
    color: "Warm Black",
    size: "42",
    price: 320,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuArWqimaebFD9-z-m0fSd0_KCGAjWNYsJHOzYUglWMVF3N9fcIunWHL-iyDMnOxUJJqpa3TQZQ3mFjHAkRrN7-C7y-XatidzziLsW3THfKA7flScjuzLJOgLMB4jXSiJmx9urn2k78KhkhcHwsvOuUpcjntFpBoTqWbDH57gij1eY-XU_2eFLe-zN6AKeaQ0wO4NyU8JjzkmCRjKbnbrv-0P_y6hkmK2sA84fK4v1bTNCu78-deE45v",
    quantity: 1,
  },
]

const CART_KEY = "cart-norte"

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return EXAMPLE_PRODUCTS
    const saved = localStorage.getItem(CART_KEY)
    return saved ? JSON.parse(saved) : EXAMPLE_PRODUCTS
  })

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  )

  const totalItems = items.reduce(
    (acc, item) => acc + item.quantity,
    0
  )

  const summary: OrderSummary = {
    subtotal,
    shipping: "Calculated at checkout",
    taxes: "Calculated at checkout",
    total: subtotal,
  }

  return {
    items,
    summary,
    totalItems,
    updateQuantity,
    removeItem,
  }
}
