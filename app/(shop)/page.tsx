import { HeroSection } from "@/components/store/hero-section";
import { TrustBar } from "@/components/store/trust-bar";
import { AboutSection } from "@/components/store/about-section";
import { CategoryGrid } from "@/components/store/category-grid";
import { BestSellersSection } from "@/components/store/best-sellers-section";

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
