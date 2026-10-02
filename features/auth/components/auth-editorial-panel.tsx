import Image from "next/image";

interface AuthEditorialPanelProps {
  /** Ruta relativa a /public o URL externa */
  src: string;
  /** Texto alternativo descriptivo de la imagen */
  alt: string;
  /** Etiqueta pequeña sobre el título */
  overline: string;
  /** Título editorial en mayúsculas */
  title: string;
  /** Descripción debajo del título */
  description: string;
  /** Badge en la esquina superior derecha */
  badge?: string;
}

/**
 * Panel derecho editorial de las páginas de autenticación.
 * Muestra una imagen de fondo con un overlay de gradiente
 * y texto flotante con estilo NORTE.
 */
export function AuthEditorialPanel({
  src,
  alt,
  overline,
  title,
  description,
  badge,
}: AuthEditorialPanelProps) {
  return (
    <section
      aria-label="Imagen editorial NORTE"
      className="hidden lg:flex lg:col-span-6 xl:col-span-7 justify-center xl:justify-end"
    >
      <div className="group relative w-full max-w-[580px] aspect-[4/5] overflow-hidden rounded-3xl border border-border/70 bg-muted shadow-2xl">
        {/* Imagen editorial */}
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes="(max-width: 1280px) 50vw, 580px"
          className="object-cover object-center saturate-[0.95] contrast-[1.03] transition-transform duration-700 ease-out group-hover:scale-[1.02]"
        />

        {/* Badge superior derecho */}
        {badge && (
          <div className="absolute right-6 top-6 rounded-full border border-white/20 bg-foreground/40 px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-widest text-white/90 backdrop-blur-md">
            {badge}
          </div>
        )}

        {/* Overlay con gradiente y texto flotante */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-8 text-white">
          <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-white/80">
            {overline}
          </p>
          <h2
            className="mt-1 text-xl uppercase tracking-[0.14em] text-white/90"
            style={{ fontFamily: "var(--font-bebas), sans-serif" }}
          >
            {title}
          </h2>
          <p className="mt-1 max-w-sm text-xs font-light leading-relaxed tracking-wide text-white/70">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
