import Link from "next/link";

export default function ProductNotFound() {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-4 px-5 py-24 text-center md:px-16">
      <h1
        className="text-5xl uppercase tracking-wide text-foreground"
        style={{ fontFamily: "var(--font-display), sans-serif" }}
      >
        Producto no encontrado
      </h1>
      <p className="max-w-md text-base text-muted-foreground">
        El producto que buscas no existe o ya no está disponible.
      </p>
      <Link
        href="/"
        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground uppercase tracking-widest transition-all hover:bg-primary/80"
      >
        Volver a la tienda
      </Link>
    </section>
  );
}
