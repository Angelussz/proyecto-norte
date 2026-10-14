"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type CardElementContextValue = {
  /** True cuando el CardElement reporta datos completos (event.complete). */
  cardComplete: boolean;
  /** Último error reportado por el CardElement, si hay. */
  cardError: string | null;
  /** Lo llama el formulario en cada onChange del CardElement. */
  reportCardChange: (complete: boolean, error: string | null) => void;
};

const CardElementContext =
  createContext<CardElementContextValue | null>(null);

/**
 * Comparte el estado del CardElement entre el formulario de tarjeta y el
 * botón de pago (ambos viven bajo CheckoutContent, fuera del alcance de
 * props directas). CardElement no expone `complete` de forma imperativa,
 * por eso la única fuente es su onChange.
 */
export function CardElementProvider({ children }: { children: ReactNode }) {
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const reportCardChange = useCallback(
    (complete: boolean, error: string | null) => {
      setCardComplete(complete);
      setCardError(error);
    },
    []
  );

  const value = useMemo(
    () => ({ cardComplete, cardError, reportCardChange }),
    [cardComplete, cardError, reportCardChange]
  );

  return (
    <CardElementContext.Provider value={value}>
      {children}
    </CardElementContext.Provider>
  );
}

export function useCardElementState(): CardElementContextValue {
  const ctx = useContext(CardElementContext);
  if (!ctx) {
    throw new Error(
      "useCardElementState debe usarse dentro de CardElementProvider"
    );
  }
  return ctx;
}
