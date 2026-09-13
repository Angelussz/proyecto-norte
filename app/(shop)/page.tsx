import { HeroSection } from "@/features/store/components/hero-section";
import { TrustBar } from "@/features/store/components/trust-bar";
import { AboutSection } from "@/features/store/components/about-section";
import { CategoryGrid } from "@/features/store/components/category-grid";
import { BestSellersSection } from "@/features/store/components/best-sellers-section";

export const metadata = {
  title: "NORTE - Effortless Style, Everyday Confidence",
  description: "Timeless designs with modern comfort crafted for the way you live.",
};

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <TrustBar />
      <AboutSection />
      <CategoryGrid />
      <BestSellersSection />
    </main>
  );
}
