"use client"

import { useState, useEffect } from "react"
import type { CartItem, OrderSummary } from "@/features/cart/types/cart.interface"

const CART_KEY = "cart-norte"

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return []

    const saved = localStorage.getItem(CART_KEY)

    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      const existingItem = prev.find(
        (item) =>
          item.id === newItem.id &&
          item.color === newItem.color &&
          item.size === newItem.size
      )

      if (existingItem) {
        return prev.map((item) =>
          item.id === newItem.id &&
          item.color === newItem.color &&
          item.size === newItem.size
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        )
      }

      return [...prev, newItem]
    })
  }

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
    addItem,
    updateQuantity,
    removeItem,
  }
}