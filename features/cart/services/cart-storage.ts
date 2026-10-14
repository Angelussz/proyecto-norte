import type { CartItem } from "@/features/cart/types/cart.interface";

const CART_KEY = "cart-norte-v2";
const UPDATE_EVENT = "cart-norte:update";

/**
 * Store externo del carrito basado en localStorage.
 * Se lee con useSyncExternalStore para evitar setState dentro de efectos
 * y garantizar que SSR e hidratación rendericen el mismo snapshot inicial.
 */
export function subscribeToCart(onStoreChange: () => void): () => void {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(UPDATE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(UPDATE_EVENT, onStoreChange);
  };
}

export function getCartSnapshot(): string | null {
  return localStorage.getItem(CART_KEY);
}

export function getCartServerSnapshot(): string | null {
  return null;
}

export function parseCartItems(snapshot: string | null): CartItem[] {
  if (!snapshot) return [];

  try {
    const parsed: unknown = JSON.parse(snapshot);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function hasStoredCart(snapshot: string | null): boolean {
  return snapshot !== null;
}

export function writeCartItems(items: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  // El evento "storage" solo salta en otras pestañas; este notifica a la actual.
  window.dispatchEvent(new Event(UPDATE_EVENT));
}
