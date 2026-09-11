import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function AboutSection() {
  return (
    <section className="py-[64px] px-5 md:px-[64px] max-w-[1280px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[64px] items-center">
        <div className="relative h-[500px] bg-[#D8D2C4]">
          <Image
            alt="About Us"
            className="absolute inset-0 w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6fPTgVz1zFjKQq9owVVF2C8BoMIBVefzG9f6VxxkrnCiv_zKxOLVs6kboOSKcmmVwwRS5Gqai2vvbNCXYAu1SqtlUB-1xxEAFT30wMyGCu7P9KlfyKZDzYd8XYXFsKA50gt9rFLYmIg9KgNtC8NCD90G_EyHycDGLIPKpEZea52_wtduWD1-Rz8mNam4T2Pzj9QJbqyEqhjawBMSXtklckPXw5PKqE-cm_ORuGXIUeRF3P2Hdom6y"
            fill
          />
        </div>
        <div className="flex flex-col items-start">
          <span className="text-[14px] font-semibold uppercase text-[#534438] tracking-[0.05em] mb-[16px]">
            About Us
          </span>
          <h2 
            className="text-[32px] md:text-[48px] leading-tight md:leading-[48px] tracking-[0.02em] text-[#1e1c13] mb-[32px] uppercase"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            Style that feels<br />as good as it<br />looks.
          </h2>
          <p className="text-[18px] leading-[28px] text-[#534438] mb-[32px] max-w-md">
            We believe great style should be simple, sustainable, and made to move with you. Our collections are designed for the modern individual who values both form and function.
          </p>
          <Link
            href="#"
            className="inline-flex items-center justify-center bg-transparent text-[#1e1c13] border border-[#D8D2C4] text-[14px] font-semibold uppercase px-8 py-4 tracking-[0.05em] hover:border-[#1e1c13] transition-colors rounded-none"
          >
            Learn More <ArrowRight className="ml-2 w-[18px] h-[18px]" />
          </Link>
        </div>
      </div>
    </section>
  );
}
