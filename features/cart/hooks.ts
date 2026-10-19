"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/features/cart/store/cart-store";
import type { OrderSummary } from "@/features/cart/types/cart.interface";

export function useCart() {
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const initializeCart = async () => {
      try {
        if (!useCartStore.persist.hasHydrated()) {
          await useCartStore.persist.rehydrate();
        }
      } catch (error) {
        console.error("No se pudo restaurar el carrito:", error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void initializeCart();

    return () => {
      cancelled = true;
    };
  }, []);

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  const summary: OrderSummary = { subtotal };

  return {
    items,
    summary,
    totalItems,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    isLoading,
  };
}
