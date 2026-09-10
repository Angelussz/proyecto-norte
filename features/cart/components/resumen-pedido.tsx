  import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ResumenPedido } from '@/types/cart'

interface ResumenPedidoProps {
  resumen: ResumenPedido
}

export default function ResumenPedidoComponent({ resumen }: ResumenPedidoProps) {
  return (
    <div className="w-full lg:w-1/3">
      <div className="sticky p-6 border sm:p-8 border-border top-24 sm:top-25">
        <h3 className="mb-6 font-headline text-2xl uppercase text-foreground sm:text-[32px]">
          Order Summary
        </h3>

        <div className="mb-6 space-y-3 sm:mb-8 sm:space-y-4">
          <div className="flex justify-between text-sm text-muted-foreground sm:text-base">
            <span>Subtotal</span>
            <span>${resumen.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground sm:text-base">
            <span>Shipping</span>
            <span>{resumen.envio}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground sm:text-base">
            <span>Taxes</span>
            <span>{resumen.impuestos}</span>
          </div>
        </div>

        <div className="flex justify-between pt-4 mb-6 font-headline text-xl text-foreground border-t border-border sm:pt-6 sm:mb-8 sm:text-[32px]">
          <span>Total</span>
          <span>${resumen.total.toFixed(2)}</span>
        </div>

        <Button
          className="w-full py-5 text-sm font-semibold uppercase tracking-widest bg-[#C77D2E] hover:bg-primary-container text-white sm:py-6 sm:text-base"
        >
          Proceed to Checkout
        </Button>

        <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground sm:mt-6">
          <Lock className="w-4 h-4" />
          <span>Secure Checkout</span>
        </div>
      </div>
    </div>
  )
}
