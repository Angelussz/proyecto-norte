import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const CATEGORIES = [
  {
    title: "Men",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWdSprNGTgxBlN1l9XC3OYy2Oh9D7yMcVUDeG7098zFWsDT3HpL2B92bDQuAR6zwyXjt6uehYRC3mOqaYa9tm-gwm52bUyUhBunu7Jv3yL1MEMgCao2LskNiehlHjnxJ5kYSLOKg23F5F-G_azHETjahQZybCEz2y-14GEJY_w7yGO3KhJ6t1zyuxXnyaeOiilK2ALXNmKq4q20ze7q4J2eBVvwTrEyBWf74wAWzfkZidYNSWIFGPp",
  },
  {
    title: "Women",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB7PzReJ2qcvlMj8hQMGCxwKDhPVVgSu9EJ6JfuycbYYJ4X1AoAy6X5n6M3Nc5vrh7LVk_BLkvidPtryUopotyrDCV-MzrBfqA6Fcbq0G94S0mgTVtkzfEy6Di3-sZI3YnV7ClVFuQ9rCXB-KP2sduxQqtEQ90jhiFgEh2UPSBIU5dzuEz9rzYStMvl-fvY0sUVskrUXSF8rhFUWMVYdBMsfYSwh5aOJdXOo3fzFWJx8-38d9ypcDBc",
  },
  {
    title: "Accessories",
    image: "/category-accessories.jpg",
  },
  {
    title: "Footwear",
    image: "/category-footwear.jpg",
  }
];

export function CategoryGrid() {
  return (
    <section className="bg-[#33402F] py-[64px] text-[#fff9ed]">
      <div className="px-5 md:px-[64px] max-w-[1280px] mx-auto">
        <div className="flex justify-between items-end mb-[32px] border-b border-[#D8D2C4]/20 pb-4">
          <h2 
            className="text-[32px] leading-[36px] tracking-[0.02em] uppercase"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            Shop By Category
          </h2>
          <Link
            href="#"
            className="text-[14px] font-semibold uppercase tracking-[0.05em] flex items-center hover:text-[#C77D2E] transition-colors"
          >
            Explore All <ArrowRight className="ml-1 w-[18px] h-[18px]" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[24px]">
          {CATEGORIES.map((category) => (
            <Link key={category.title} href="#" className="group block text-center">
              <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-none bg-[#f4eddf]">
                <Image
                  alt={`${category.title} Category`}
                  className="object-cover absolute inset-0 w-full h-full group-hover:scale-105 transition-transform duration-500"
                  src={category.image}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <h3 className="text-[14px] font-semibold uppercase tracking-[0.05em]">{category.title}</h3>
              <p className="text-[12px] font-medium text-[#fff9ed]/70">Collection</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
