'use client'

import CartItemRow from '@/features/cart/components/cart-item'
import OrderSummaryComponent from '@/features/cart/components/order-summary'
import { useCart } from '@/features/cart/hooks'

export default function CartPage() {
  const {
    items,
    summary,
    totalItems,
    updateQuantity,
    removeItem,
    isLoading,
  } = useCart()

  let listContent

  if (isLoading) {
    listContent = (
      <div aria-busy="true" className="flex flex-col gap-6 sm:gap-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-6 pb-6 border-b border-border sm:pb-8 animate-pulse"
          >
            <div className="w-full h-62.5 shrink-0 bg-muted sm:w-50" />
            <div className="flex flex-col grow gap-4 py-2">
              <div className="h-7 w-2/3 bg-muted" />
              <div className="h-4 w-1/3 bg-muted" />
              <div className="h-4 w-1/4 bg-muted" />
              <div className="h-9 w-32 bg-muted mt-auto" />
            </div>
          </div>
        ))}
      </div>
    )
  } else if (items.length === 0) {
    listContent = (
      <p className="py-12 text-center text-muted-foreground">
        Tu carrito está vacío.
      </p>
    )
  } else {
    listContent = items.map((item) => (
      <CartItemRow
        key={item.id}
        item={item}
        onUpdateQuantity={updateQuantity}
        onRemove={removeItem}
      />
    ))
  }

  return (
    <main className="grow w-full max-w-7xl mx-auto px-5 py-12 sm:px-16 sm:py-16">
      {/* Encabezado */}
      <header className="mb-12 sm:mb-16">
        <h1 className="font-headline text-5xl uppercase leading-none text-foreground sm:text-[80px]">
          Tu Carrito
        </h1>
        <p className="mt-4 text-base text-muted-foreground sm:text-lg">
          {totalItems} {totalItems === 1 ? 'producto' : 'productos'} en tu carrito.
        </p>
      </header>

      {/* Contenido principal */}
      <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
        {/* Lista de productos */}
        <div className="flex flex-col gap-6 w-full lg:w-2/3 sm:gap-8">
          {listContent}
        </div>

        {/* Resumen del pedido */}
        <OrderSummaryComponent summary={summary} />
      </div>
    </main>
  )
}
