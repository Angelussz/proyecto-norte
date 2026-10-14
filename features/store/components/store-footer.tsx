//import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

//const COL_2 = ["Política de Privacidad", "Términos y Condiciones"];

export function StoreFooter() {
  return (
    <footer className="mt-auto w-full border-t border-border bg-muted">
      <div className="mx-auto w-full max-w-7xl grid 7xl grid-cols-1 gap-6 px-5 py-16 md:grid-cols-2 md:px-16">
        <div className="flex flex-col gap-4">
          <span
            className="text-3xl tracking-wider text-foreground"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            NORTE
          </span>
          <p className="mt-auto text-xs text-muted-foreground">
            © 2026 NORTE. TODOS LOS DERECHOS RESERVADOS.
          </p>
        </div>
        {/* <div className="flex flex-col gap-3">
          {COL_2.map((item) => (
            <Link
              key={item}
              href="#"
              className="text-sm font-semibold uppercase text-muted-foreground underline decoration-1 opacity-80 transition-opacity hover:text-primary hover:opacity-100"
            >
              {item}
            </Link>
          ))}
        </div> */}
        <div className="flex flex-col gap-4">
          <span className="text-sm font-semibold uppercase text-foreground">
            Mantente al día
          </span>
          <p className="text-base text-muted-foreground">
            Suscribite a nuestro newsletter para acceder anticipadamente a las nuevas colecciones.
          </p>
          <div className="mt-2 flex border-b border-border pb-2 transition-colors focus-within:border-foreground">
            <Input
              type="email"
              placeholder="Ingresá tu correo electrónico"
              className="border-none bg-transparent p-0 shadow-none focus-visible:ring-0"
            />
            <Button variant="ghost" size="icon" aria-label="Suscribirse">
              <ArrowRight className="size-5" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
