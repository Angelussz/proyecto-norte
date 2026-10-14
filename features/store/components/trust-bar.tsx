import { ShieldCheck, Truck, RotateCcw, Lock } from "lucide-react";

export function TrustBar() {
  return (
    <section className="bg-[#faf3e4] py-8 border-b border-[#D8D2C4]">
      <div className="px-5 md:px-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left divide-y md:divide-y-0 md:divide-x divide-transparent md:divide-[#D8D2C4]">
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-start space-y-2 md:space-y-0 md:space-x-4 px-4 py-4 md:py-0">
            <ShieldCheck className="text-[#C77D2E] size-8" />
            <div className="text-center md:text-left">
              <h4 className="text-sm font-semibold text-[#1e1c13] tracking-wider">Calidad Premium</h4>
              <p className="text-xs font-medium text-[#534438]">en Materiales</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center md:justify-start space-y-2 md:space-y-0 md:space-x-4 px-4 py-4 md:py-0 border-t md:border-t-0 md:border-l border-[#D8D2C4]">
            <Truck className="text-[#C77D2E] size-8" />
            <div className="text-center md:text-left">
              <h4 className="text-sm font-semibold text-[#1e1c13] tracking-wider">Envío Gratis</h4>
              <p className="text-xs font-medium text-[#534438]">En Pedidos desde $99</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center md:justify-start space-y-2 md:space-y-0 md:space-x-4 px-4 py-4 md:py-0 border-t md:border-t-0 md:border-l border-[#D8D2C4]">
            <RotateCcw className="text-[#C77D2E] size-8" />
            <div className="text-center md:text-left">
              <h4 className="text-sm font-semibold text-[#1e1c13] tracking-wider">Devoluciones</h4>
              <p className="text-xs font-medium text-[#534438]">Fáciles en 14 Días</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center md:justify-start space-y-2 md:space-y-0 md:space-x-4 px-4 py-4 md:py-0 border-t md:border-t-0 md:border-l border-[#D8D2C4]">
            <Lock className="text-[#C77D2E] size-8" />
            <div className="text-center md:text-left">
              <h4 className="text-sm font-semibold text-[#1e1c13] tracking-wider">Pagos Seguros</h4>
              <p className="text-xs font-medium text-[#534438]">100% Protegidos</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
