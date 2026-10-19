"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { CartItem } from "@/features/cart/types/cart.interface";

interface CartStore {
  items: CartItem[];
  addItem: (newItem: CartItem) => void;
  updateQuantity: (id: string, newQuantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],

      addItem: (newItem) =>
        set((state) => {
          const existingItem = state.items.find(
            (item) =>
              item.id === newItem.id && item.color === newItem.color && item.size === newItem.size,
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === newItem.id && item.color === newItem.color && item.size === newItem.size
                  ? {
                      ...item,
                      quantity: item.quantity + newItem.quantity,
                    }
                  : item,
              ),
            };
          }

          return { items: [...state.items, newItem] };
        }),

      updateQuantity: (id, newQuantity) => {
        if (newQuantity < 1) return;

        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: newQuantity } : item,
          ),
        }));
      },

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-norte-v3",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);
