'use client'

import ItemCarrito from '@/features/cart/components/item-carrito'
import ResumenPedido from '@/features/cart/components/resumen-pedido'
import { useCarrito } from '@/features/cart/hooks'

export default function CarritoPagina() {
  const {
    productos,
    resumen,
    totalItems,
    actualizarCantidad,
    eliminarProducto,
  } = useCarrito()

  return (
    <main className="grow w-full max-w-7xl mx-auto px-5 py-12 sm:px-16 sm:py-16">
      {/* Encabezado */}
      <header className="mb-12 sm:mb-16">
        <h1 className="font-headline text-5xl uppercase leading-none text-foreground sm:text-[80px]">
          Your Cart
        </h1>
        <p className="mt-4 text-base text-muted-foreground sm:text-lg">
          {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart.
        </p>
      </header>

      {/* Contenido principal */}
      <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
        {/* Lista de productos */}
        <div className="flex flex-col gap-6 w-full lg:w-2/3 sm:gap-8">
          {productos.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">
              Tu carrito está vacío.
            </p>
          ) : (
            productos.map((producto) => (
              <ItemCarrito
                key={producto.id}
                producto={producto}
                onActualizarCantidad={actualizarCantidad}
                onEliminar={eliminarProducto}
              />
            ))
          )}
        </div>

        {/* Resumen del pedido */}
        <ResumenPedido resumen={resumen} />
      </div>
    </main>
  )
}
