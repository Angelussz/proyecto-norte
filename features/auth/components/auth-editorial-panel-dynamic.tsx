"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

// ─── Datos del panel por ruta ─────────────────────────────────────────────────
const PANELS = {
  "/login": {
    src: "/auth-editorial-login.jpg",
    alt: "Pareja en un estudio artesanal vistiendo prendas NORTE de lino natural",
    overline: "Archivo Privado",
    title: "Estudio & Vida Creativa",
    description:
      "Prendas de corte atemporal concebidas para la fluidez entre el proceso creativo y la vida cotidiana.",
    badge: "Edición Limitada",
  },
  "/register": {
    src: "/auth-editorial-register.jpg",
    alt: "Pareja caminando en acantilados costeros vistiendo ropa NORTE de lino blanco y oliva",
    overline: "Colección Esencial",
    title: "Vol. 04 / Verano",
    description:
      "Prendas concebidas para quienes eligen vivir con intención. Calidad artesanal sin concesiones.",
    badge: "Hecho a Mano",
  },
} as const;

type PanelRoute = keyof typeof PANELS;

/**
 * Panel editorial derecho con crossfade entre las dos imágenes.
 * Ambas imágenes están montadas en el DOM — solo cambia la opacidad,
 * lo que evita cualquier layout shift al navegar entre /login y /register.
 */
export function AuthEditorialPanelDynamic() {
  const pathname = usePathname();
  const activeRoute = (
    Object.keys(PANELS).includes(pathname) ? pathname : "/login"
  ) as PanelRoute;

  return (
    <section
      aria-label="Imagen editorial NORTE"
      className="hidden lg:flex lg:col-span-6 xl:col-span-7 items-center justify-center xl:justify-end"
    >
      <div className="group relative w-full max-w-[580px] aspect-[4/5] overflow-hidden rounded-3xl border border-border/70 bg-muted shadow-2xl">

        {/* Renderizamos ambas imágenes apiladas; solo una visible a la vez */}
        {(Object.entries(PANELS) as [PanelRoute, (typeof PANELS)[PanelRoute]][]).map(
          ([route, panel]) => {
            const isActive = route === activeRoute;
            return (
              <div
                key={route}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
                aria-hidden={!isActive}
              >
                <Image
                  src={panel.src}
                  alt={panel.alt}
                  fill
                  priority={route === "/login"}
                  sizes="(max-width: 1280px) 50vw, 580px"
                  className="object-cover object-center saturate-[0.95] contrast-[1.03]"
                />
              </div>
            );
          }
        )}

        {/* Badge — cambia con fade */}
        {(Object.entries(PANELS) as [PanelRoute, (typeof PANELS)[PanelRoute]][]).map(
          ([route, panel]) => {
            const isActive = route === activeRoute;
            return (
              <div
                key={`badge-${route}`}
                className={`absolute right-6 top-6 rounded-full border border-white/20 bg-foreground/40 px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-widest text-white/90 backdrop-blur-md transition-opacity duration-700 ease-in-out ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
                aria-hidden={!isActive}
              >
                {panel.badge}
              </div>
            );
          }
        )}

        {/* Overlay gradiente fijo */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

        {/* Texto flotante — cambia con fade */}
        {(Object.entries(PANELS) as [PanelRoute, (typeof PANELS)[PanelRoute]][]).map(
          ([route, panel]) => {
            const isActive = route === activeRoute;
            return (
              <div
                key={`caption-${route}`}
                className={`absolute inset-x-0 bottom-0 p-8 text-white transition-opacity duration-700 ease-in-out ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
                aria-hidden={!isActive}
              >
                <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-white/80">
                  {panel.overline}
                </p>
                <h2
                  className="mt-1 text-xl uppercase tracking-[0.14em] text-white/90"
                  style={{ fontFamily: "var(--font-bebas), sans-serif" }}
                >
                  {panel.title}
                </h2>
                <p className="mt-1 max-w-sm text-xs font-light leading-relaxed tracking-wide text-white/70">
                  {panel.description}
                </p>
              </div>
            );
          }
        )}
      </div>
    </section>
  );
}
