'use client';

import { useEffect, useMemo, useSyncExternalStore } from 'react';

import {
  getCartServerSnapshot,
  getCartSnapshot,
  hasStoredCart,
  parseCartItems,
  subscribeToCart,
  writeCartItems,
} from '@/features/cart/services/cart-storage';

import type {
  CartItem,
  OrderSummary,
} from '@/features/cart/types/cart.interface';

const CART_SEED_ITEMS: CartItem[] = [
  {
    id: '85dd9bb3-dad3-41ee-86b5-2be05ff07d31',
    name: 'Coastal Overshirt',
    color: 'Estándar',
    size: 'M',
    price: 139,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBd-YsR-XNfNdYYiIB9pddWYzQC4GRRh3DinlyIPQEjXj4Qo5lD3hjDLANrRM_0GaTR_NjueqE0fduw4-W_Po0s9oVjba9rP0-abr2-VthEqyRv2aeSKUAIrZCp1k_79XQITX-fp8ukMAj9bowci6xAx3A4srU1PDwAPDITKOtfKJazc7Bx5Lh18jBtmts8nffQhSbfPXfBs24Ur0AeKvf--Wdr4PZFFYJXKI5OO9eyFxRJ46_9hMHh',
    quantity: 1,
  },
  {
    id: '501f3a52-2d8e-46be-a201-ad02027c5d59',
    name: 'Field Linen Shirt',
    color: 'Estándar',
    size: 'L',
    price: 128,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBMn1DJnKYB5FMQoR7oSs53BpdsFlVDrZSBSzM6Gc9KnBY9Hf8iwcsi8nHXY7BJAG_xlyStcYz6qyhpeqo5yCHvmmyGv_wGsXpEKCfB0IrbKzGufd9raZGSL07Bz8boWB3FwFxLkaUrFROOd4NrA_07soH9StsyQizJ8_WN5jS_SpJ5nYLei3dqXGArKy3btgyKderS1R8Ebnuoas11Ss1iB0AKKJzD3bDUebP5bfC90vYRXKmCcR24',
    quantity: 1,
  },
];

export function useCart() {
  const snapshot = useSyncExternalStore(
    subscribeToCart,
    getCartSnapshot,
    getCartServerSnapshot,
  );

  const items = useMemo(() => parseCartItems(snapshot), [snapshot]);

  // Siembra inicial solo cuando nunca hubo carrito guardado.
  // Escribe en el store externo (localStorage) en vez de usar setState.
  useEffect(() => {
    if (hasStoredCart(snapshot)) return;

    writeCartItems(CART_SEED_ITEMS);
  }, [snapshot]);

  const addItem = (newItem: CartItem) => {
    const existingItem = items.find(
      (item) =>
        item.id === newItem.id &&
        item.color === newItem.color &&
        item.size === newItem.size,
    );

    if (existingItem) {
      writeCartItems(
        items.map((item) =>
          item.id === newItem.id &&
          item.color === newItem.color &&
          item.size === newItem.size
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item,
        ),
      );

      return;
    }

    writeCartItems([...items, newItem]);
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    writeCartItems(
      items.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  const removeItem = (id: string) => {
    writeCartItems(items.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    writeCartItems([]);
  };

  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  const summary: OrderSummary = { subtotal };

  const isLoading = !hasStoredCart(snapshot);

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