import Link from 'next/link'
import { Lock } from 'lucide-react'
import type { OrderSummary } from '@/features/cart/types/cart.interface'

interface OrderSummaryProps {
  summary: OrderSummary
}

export default function OrderSummaryComponent({ summary }: OrderSummaryProps) {
  return (
    <div className="w-full lg:w-1/3">
      <div className="sticky p-6 border sm:p-8 border-border top-24 sm:top-25">
        <h3 className="mb-6 font-headline text-2xl uppercase text-foreground sm:text-[32px]">
          Resumen del Pedido
        </h3>

        <div className="mb-6 space-y-3 sm:mb-8 sm:space-y-4">
          <div className="flex justify-between pt-4 font-headline text-xl text-foreground border-t border-border sm:pt-6 sm:text-[32px]">
            <span>Subtotal</span>
            <span>${summary.subtotal.toFixed(2)}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Impuestos y costo de envío se calculan en el checkout.
          </p>
        </div>

        <Link
          href="/checkout"
          className="inline-flex w-full items-center justify-center py-5 text-sm font-semibold uppercase tracking-widest bg-[#C77D2E] hover:bg-primary-container text-white sm:py-6 sm:text-base"
        >
          Proceder al Pago
        </Link>

        <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground sm:mt-6">
          <Lock className="w-4 h-4" />
          <span>Checkout Seguro</span>
        </div>
      </div>
    </div>
  )
}
