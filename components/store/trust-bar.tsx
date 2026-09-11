import { ShieldCheck, Truck, RotateCcw, Lock } from "lucide-react";

export function TrustBar() {
  return (
    <section className="bg-[#faf3e4] py-[32px] border-b border-[#D8D2C4]">
      <div className="px-5 md:px-[64px] max-w-[1280px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[24px] text-center md:text-left divide-y md:divide-y-0 md:divide-x divide-transparent md:divide-[#D8D2C4]">
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-start space-y-2 md:space-y-0 md:space-x-4 px-4 py-4 md:py-0">
            <ShieldCheck className="text-[#C77D2E] w-[32px] h-[32px]" />
            <div className="text-center md:text-left">
              <h4 className="text-[14px] font-semibold text-[#1e1c13] tracking-[0.05em]">Premium Quality</h4>
              <p className="text-[12px] font-medium text-[#534438]">Materials</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-start space-y-2 md:space-y-0 md:space-x-4 px-4 py-4 md:py-0 border-t md:border-t-0 md:border-l border-[#D8D2C4]">
            <Truck className="text-[#C77D2E] w-[32px] h-[32px]" />
            <div className="text-center md:text-left">
              <h4 className="text-[14px] font-semibold text-[#1e1c13] tracking-[0.05em]">Free Shipping</h4>
              <p className="text-[12px] font-medium text-[#534438]">On Orders Over $99</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-start space-y-2 md:space-y-0 md:space-x-4 px-4 py-4 md:py-0 border-t md:border-t-0 md:border-l border-[#D8D2C4]">
            <RotateCcw className="text-[#C77D2E] w-[32px] h-[32px]" />
            <div className="text-center md:text-left">
              <h4 className="text-[14px] font-semibold text-[#1e1c13] tracking-[0.05em]">14-Day Easy</h4>
              <p className="text-[12px] font-medium text-[#534438]">Returns</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-start space-y-2 md:space-y-0 md:space-x-4 px-4 py-4 md:py-0 border-t md:border-t-0 md:border-l border-[#D8D2C4]">
            <Lock className="text-[#C77D2E] w-[32px] h-[32px]" />
            <div className="text-center md:text-left">
              <h4 className="text-[14px] font-semibold text-[#1e1c13] tracking-[0.05em]">Secure Payments</h4>
              <p className="text-[12px] font-medium text-[#534438]">100% Protected</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
