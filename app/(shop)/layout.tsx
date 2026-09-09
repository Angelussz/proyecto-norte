import { Bebas_Neue, Inter } from "next/font/google";
import { StoreHeader } from "@/components/store/store-header";
import { StoreFooter } from "@/components/store/store-footer";

const display = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-shop-body",
});

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${display.variable} ${body.variable} flex min-h-screen flex-col bg-background text-foreground`}
      style={{ fontFamily: "var(--font-shop-body), sans-serif" }}
    >
      <StoreHeader />
      <div className="flex flex-1 flex-col">{children}</div>
      <StoreFooter />
    </div>
  );
}
