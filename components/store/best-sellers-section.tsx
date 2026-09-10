import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";

const BEST_SELLERS = [
  {
    id: "1",
    title: "Classic Sunglasses",
    price: 49.0,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB0WXa1rD04hSq4_xI8kc__3MeZTxwGlhgE1q5NYei4EcxiknkYNjbviHoavZ23Fuhe5Ui_2HcE5MlHG54SK5L1TeEKNyzOyj9a7zoLAZId0Y0jC2F_b7RkyMYu-yizNCebnm-V5THA1u8SYM5e9UmO8BY6SjC9r5PYqknhHykxS4GzM3iAxHPnGZPNPSTMMa91inkoMy8s_9GgEFp3qRHGZKE-ntAEdPKEp4VVDo9eHAg4gbh0xVsp"
  },
  {
    id: "2",
    title: "Linen Shirt",
    price: 69.0,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBbulJAIWPb5vlGpWiLNAbF8qT4B7MScIsu2omEmtLW-Fbb_yT3lawPftxhGHPDo4obA999BNfn_o_NDacN0goYIYfo2pqHNDSEKnZZeuY-DYomuQXK3R4zXEUkXBKEiVyQA8fC_9slE1ELuLWEmbyeQD23ezMvq53mr3UZDh4rSovUaBs7-DJgvNgXm9HSs0sERdC5WaxBHVALFo3u6YhZ3uOdGKLY4QwIsY6MJYRbKXgM0hjyyEvA"
  },
  {
    id: "3",
    title: "Minimal Watch",
    price: 129.0,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBFT0hAmKPMvfrYI5zzN16aHeQ2jnHP6Gw3p7nib_PwYN5BPtIGjey0bl7t-HPWAEZkLe6PIFJXC0KtTXFAYuUewYX0NOsnqT4A-glj_PzVySYoXRqgxUop4vH3aYtnstjFF4AqELfyKmdGoTdKE1QMsMGatkqUEJ_PlTfJK6Pp2ZNk2uWRoWeQtfrDsvLI63AXjwRn6eR93eE0VUT_9lmK8EaodHoZDnSCldxC_foXSWYqIzT3g8Ex"
  },
  {
    id: "4",
    title: "Essential Sneakers",
    price: 89.0,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD96fOGUad-h1Yw0NbUi4OCoC_cpTuHgxG8spokCxu85p5quDpVJaOEoPL24fpH51Agkx4oQiiz9rmQgjUGdvYzQPrczubblEIQdkb1o2Ju5ALVcelujxQUMbTBdnInnK8UPScsjFgrgldNgyjN3jnv-TOmrLBnE6uznr9Lm7qfnEkxv6QQWXIrhB2-C9-_8J86yB1aTfZ7hwnynpF7bhQtDPE4YFUEfRHa7EfA3D20QM5b8jKHTvKG"
  }
];

export function BestSellersSection() {
  return (
    <section className="py-[64px] px-5 md:px-[64px] max-w-[1280px] mx-auto">
      <div className="flex justify-between items-end mb-[32px] border-b border-[#D8D2C4] pb-4">
        <h2 
          className="text-[32px] leading-[36px] tracking-[0.02em] text-[#1e1c13] uppercase"
          style={{ fontFamily: "var(--font-display), sans-serif" }}
        >
          Best Sellers
        </h2>
        <Link
          href="#"
          className="text-[14px] font-semibold uppercase tracking-[0.05em] text-[#534438] flex items-center hover:text-[#1e1c13] transition-colors"
        >
          View All <ArrowRight className="ml-1 w-[18px] h-[18px]" />
        </Link>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[24px] gap-y-[32px]">
        {BEST_SELLERS.map((product) => (
          <div key={product.id} className="group relative">
            <button className="absolute top-4 right-4 z-10 text-[#534438] hover:text-[#C77D2E] transition-colors">
              <Heart className="w-[24px] h-[24px]" />
            </button>
            <Link href={`/product/${product.id}`} className="block">
              <div className="relative aspect-square mb-4 bg-[#eee8d9] p-4 flex items-center justify-center">
                <Image
                  alt={product.title}
                  className="object-cover mix-blend-multiply"
                  src={product.image}
                  fill
                />
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-[14px] font-semibold text-[#1e1c13]">{product.title}</h3>
                  <p className="text-[12px] font-medium text-[#534438] mt-1">${product.price.toFixed(2)}</p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
