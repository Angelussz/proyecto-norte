import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import { QueryProvider } from "./providers";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NORTE",
  description: "NORTE - Tienda de ropa y accesorios de diseño propio.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${bebasNeue.variable} ${inter.variable} h-full antialiased`}>
      <head>
        {/* Material Symbols Outlined — iconos para el panel Admin */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="min-h-full flex flex-col font-body bg-background text-on-background">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
