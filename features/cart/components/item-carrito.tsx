"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { ProductoCarrito } from "@/types/cart";

interface ItemCarritoProps {
  producto: ProductoCarrito;
  onActualizarCantidad: (id: string, cantidad: number) => void;
  onEliminar: (id: string) => void;
}

export default function ItemCarrito({
  producto,
  onActualizarCantidad,
  onEliminar,
}: ItemCarritoProps) {
  return (
    <div className="flex flex-col gap-4 pb-6 border-b border-border sm:flex-row sm:gap-6 sm:pb-8">
      {/* Imagen del producto */}
      <div className="relative w-full h-62.5 shrink-0 overflow-hidden bg-muted sm:w-50">
        <Image
          src={producto.imagenUrl}
          alt={producto.nombre}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 200px"
        />
      </div>

      {/* Detalles del producto */}
      <div className="flex flex-col justify-between grow py-0 sm:py-2">
        <div>
          <div className="flex justify-between items-start gap-4">
            <div>
              <h2 className="font-headline text-2xl uppercase text-foreground sm:text-[32px]">
                {producto.nombre}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                Color: {producto.color}
              </p>
              <p className="text-sm text-muted-foreground sm:text-base">
                Size: {producto.tamanio}
              </p>
            </div>
            <p className="text-base font-semibold text-foreground sm:text-lg whitespace-nowrap">
              ${producto.precio.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-end mt-4 sm:mt-6">
          {/* Controles de cantidad */}
          <div className="flex items-center border border-border">
            <button
              className="px-3 py-2 transition-colors hover:bg-muted sm:px-4"
              onClick={() =>
                onActualizarCantidad(producto.id, producto.cantidad - 1)
              }
              aria-label="Disminuir cantidad"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-3 py-2 text-sm sm:px-4 sm:text-base">
              {producto.cantidad}
            </span>
            <button
              className="px-3 py-2 transition-colors hover:bg-muted sm:px-4"
              onClick={() =>
                onActualizarCantidad(producto.id, producto.cantidad + 1)
              }
              aria-label="Aumentar cantidad"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Botón eliminar */}
          <button
            className="flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary sm:text-sm"
            onClick={() => onEliminar(producto.id)}
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Remove</span>
          </button>
        </div>
      </div>
    </div>
  );
}
