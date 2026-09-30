"use client"

import { useEffect, useMemo, useSyncExternalStore } from "react"
import {
  getCartServerSnapshot,
  getCartSnapshot,
  hasStoredCart,
  parseCartItems,
  subscribeToCart,
  writeCartItems,
} from "@/features/cart/services/cart-storage"
import type { CartItem, OrderSummary } from "@/features/cart/types/cart.interface"

const CART_SEED_ITEMS: CartItem[] = [
  {
    id: "04611bb1-3ade-422d-aa8f-c39e5596dbce",
    name: "Coastal Overshirt",
    color: "Estándar",
    size: "M",
    price: 139,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBd-YsR-XNfNdYYiIB9pddWYzQC4GRRh3DinlyIPQEjXj4Qo5lD3hjDLANrRM_0GaTR_NjueqE0fduw4-W_Po0s9oVjba9rP0-abr2-VthEqyRv2aeSKUAIrZCp1k_79XQITX-fp8ukMAj9bowci6xAx3A4srU1PDwAPDITKOtfKJazc7Bx5Lh18jBtmts8nffQhSbfPXfBs24Ur0AeKvf--Wdr4PZFFYJXKI5OO9eyFxRJ46_9hMHh",
    quantity: 1,
  },
  {
    id: "095fe8ab-659f-4eea-85ef-59938a1444af",
    name: "Field Linen Shirt",
    color: "Estándar",
    size: "L",
    price: 128,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBMn1DJnKYB5FMQoR7oSs53BpdsFlVDrZSBSzM6Gc9KnBY9Hf8iwcsi8nHXY7BJAG_xlyStcYz6qyhpeqo5yCHvmmyGv_wGsXpEKCfB0IrbKzGufd9raZGSL07Bz8boWB3FwFxLkaUrFROOd4NrA_07soH9StsyQizJ8_WN5jS_SpJ5nYLei3dqXGArKy3btgyKderS1R8Ebnuoas11Ss1iB0AKKJzD3bDUebP5bfC90vYRXKmCcR24",
    quantity: 1,
  },
]

export function useCart() {
  const snapshot = useSyncExternalStore(
    subscribeToCart,
    getCartSnapshot,
    getCartServerSnapshot
  )
  const items = useMemo(() => parseCartItems(snapshot), [snapshot])

  // Siembra inicial solo cuando nunca hubo carrito guardado.
  // Escribe en el store externo (localStorage) en vez de usar setState.
  useEffect(() => {
    if (hasStoredCart(snapshot)) return

    writeCartItems(CART_SEED_ITEMS)
  }, [snapshot])

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return

    writeCartItems(
      items.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const removeItem = (id: string) => {
    writeCartItems(items.filter((item) => item.id !== id))
  }

  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  )

  const totalItems = items.reduce(
    (acc, item) => acc + item.quantity,
    0
  )

  const summary: OrderSummary = { subtotal }

  const isLoading = !hasStoredCart(snapshot)

  return {
    items,
    summary,
    totalItems,
    updateQuantity,
    removeItem,
    isLoading,
  }
}
