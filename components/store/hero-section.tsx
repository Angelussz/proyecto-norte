import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative w-full min-h-[500px] md:min-h-[600px] lg:min-h-[700px] flex items-center bg-[#3e4934] text-[#fff9ed] overflow-hidden">
      
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        <Image
          alt="NORTE - Effortless Style, Everyday Confidence"
          className="w-full h-full object-cover object-top"
          src="/hero-nuevo.jpg"
          fill
          priority
          sizes="100vw"
        />
      </div>

      {/* Mobile gradient overlay for text readability (optional, just in case the image is bright on mobile) */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#3e4934]/95 via-[#3e4934]/60 to-transparent z-10 md:hidden pointer-events-none" />

      {/* Content */}
      <div className="relative z-20 w-full px-5 md:px-[64px] max-w-[1280px] mx-auto flex flex-col justify-center py-12 md:py-16">
        <div className="max-w-md md:max-w-lg lg:max-w-xl md:mt-8">
          <h1 
            className="text-[44px] md:text-[64px] lg:text-[76px] leading-[0.95] tracking-[0.02em] text-[#fff9ed] mb-4 uppercase"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            Effortless<br />Style, Everyday<br />Confidence.
          </h1>
          <p className="text-[16px] md:text-[18px] leading-[26px] md:leading-[28px] text-[#e8e2d4] mb-8 max-w-sm md:max-w-md">
            Timeless designs with modern comfort crafted for the way you live.
          </p>
          <Link
            href="#"
            className="inline-flex items-center justify-center bg-[#C77D2E] text-white text-[13px] md:text-[14px] font-semibold uppercase px-7 md:px-8 py-3.5 md:py-4 tracking-[0.08em] hover:bg-[#b56e22] transition-colors rounded-none shadow-sm"
          >
            Shop Now <ArrowRight className="ml-2 w-[18px] h-[18px]" />
          </Link>
        </div>
      </div>
    </section>
  );
}
