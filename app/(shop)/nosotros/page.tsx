import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Leaf, Scissors, Infinity, ArrowUpRight, Quote, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Nosotros | NORTE - Estilo sin esfuerzo, confianza cada día",
  description:
    "Conocé la historia, el manifiesto y la filosofía artesanal de NORTE. Prendas de lino, lana merina y algodón orgánico con diseño atemporal.",
};

export default function NosotrosPage() {
  return (
    <div className="flex flex-col w-full bg-background text-foreground">
      {/* ── 1. Editorial Hero Section ───────────────────────────────────── */}
      <section className="w-full max-w-7xl mx-auto px-5 md:px-16 pt-10 md:pt-14 pb-16">
        <div className="flex flex-col">
          {/* Eyebrow & Issue Stamp */}
          <div className="flex items-center justify-between pb-6 text-xs uppercase tracking-widest text-muted-foreground border-b border-border/60">
            <span className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#C77D2E]"></span>
              Edición Nosotros
            </span>
            <span className="text-muted-foreground/80">Fundado en el Norte Peninsular · 2021</span>
          </div>

          {/* High-Impact Typographic Heading */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pt-8 pb-12">
            <div className="lg:col-span-8">
              <p className="text-xs uppercase tracking-[0.25em] text-[#54624f] font-semibold mb-3">
                Nuestra Esencia
              </p>
              <h1
                className="text-5xl sm:text-7xl lg:text-8xl leading-none text-foreground tracking-wider uppercase"
                style={{ fontFamily: "var(--font-display), sans-serif" }}
              >
                DISCIPLINA, TIERRA Y ELEGANCIA ATEMPORAL.
              </h1>
            </div>
            <div className="lg:col-span-4 lg:pb-2">
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                Concebimos piezas diseñadas para convivir en sosiego con el entorno. Prendas nacidas
                del lino vivo, el algodón puro y la serenidad de una vida al aire libre.
              </p>
            </div>
          </div>

          {/* Hero Visual Mosaic */}
          <div className="relative w-full overflow-hidden bg-muted aspect-[4/3] md:aspect-[21/9] shadow-sm">
            <Image
              alt="Campaña Litoral NORTE en acantilados costeros"
              className="object-cover object-center hover:scale-[1.01] transition-transform duration-700 ease-out"
              src="https://lh3.googleusercontent.com/aida/AEtjO1WS91jLi6Vq0aS27R-G9hmqjIFpPk9HQOF4jco9lvSeMvG4o0aMEJdUrtdS50dRd7BwkoULsxw98PcJSae0Q333UX_e1NcKEZoxFDFHOa1OwGMWArPnm-FvTqiKKw6-yumlP5lGHOPyZ_WNlP8oAdCRAycbGF9PK5f4PyUw83EA-14QaGO16YGuMhvtJYo0DTM282eEauCn1P6LTGMcYNsrAPpPYy0qS_UzfVlG9cPO5mwRwKG2zRWWsA"
              fill
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 text-white max-w-md">
              <span className="text-[11px] uppercase tracking-[0.3em] text-[#ffb874] block mb-1">
                Campaña Litoral · Faro de Ribadeo
              </span>
              <p className="text-sm font-light text-white/90 italic">
                &ldquo;Vestir con la misma naturalidad con la que el viento abraza las dunas.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Manifesto Horizontal Banner ─────────────────────────────── */}
      <section className="w-full bg-[#33402F] text-[#fff9ed] py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-5 md:px-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <span className="text-xs uppercase tracking-widest text-[#d8e7cf] block mb-2 font-semibold">
                Manifiesto Norte
              </span>
              <h2
                className="text-3xl md:text-4xl tracking-wider text-[#fff9ed]"
                style={{ fontFamily: "var(--font-display), sans-serif" }}
              >
                RECHAZAMOS EL CONSUMO EFÍMERO. CREAMOS RELIQUIAS MODERNAS.
              </h2>
            </div>
            <div className="md:max-w-xs text-[#bccbb4] text-sm leading-relaxed">
              Cada costura, cada fibra y cada botón responde a un pacto ético inquebrantable:
              honestidad textil y respeto por el tiempo artesanal.
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Core Pillars (3 Columns) ─────────────────────────────────── */}
      <section className="w-full max-w-7xl mx-auto px-5 md:px-16 py-20">
        <div className="flex flex-col mb-12">
          <span className="text-xs uppercase tracking-[0.2em] text-[#C77D2E] font-semibold mb-2">
            Fundamentos de Marca
          </span>
          <h3
            className="text-3xl md:text-5xl text-foreground tracking-wide uppercase"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            EL PESO DE LO ESENCIAL
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pillar 1 */}
          <div className="bg-[#f4eddf] p-8 flex flex-col justify-between hover:bg-[#eee8d9] transition-colors duration-300">
            <div>
              <div className="flex items-center justify-between mb-8">
                <span
                  className="text-3xl text-[#894d00]"
                  style={{ fontFamily: "var(--font-display), sans-serif" }}
                >
                  01
                </span>
                <Leaf className="size-6 text-[#54624f]" />
              </div>
              <h4
                className="text-2xl text-foreground tracking-wider mb-4 uppercase"
                style={{ fontFamily: "var(--font-display), sans-serif" }}
              >
                ORIGEN Y MATERIA
              </h4>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Lino europeo de cultivo bajo en agua, lana merina regenerativa y algodón orgánico
                con certificación GOTS. Nuestras telas maduran con el uso en lugar de desgastarse.
              </p>
            </div>
            <div className="pt-6 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              <span>Trazabilidad 100%</span>
              <ArrowUpRight className="size-4" />
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="bg-[#f4eddf] p-8 flex flex-col justify-between hover:bg-[#eee8d9] transition-colors duration-300">
            <div>
              <div className="flex items-center justify-between mb-8">
                <span
                  className="text-3xl text-[#894d00]"
                  style={{ fontFamily: "var(--font-display), sans-serif" }}
                >
                  02
                </span>
                <Scissors className="size-6 text-[#54624f]" />
              </div>
              <h4
                className="text-2xl text-foreground tracking-wider mb-4 uppercase"
                style={{ fontFamily: "var(--font-display), sans-serif" }}
              >
                OFICIO CURATORIAL
              </h4>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Tiradas controladas bajo demanda calculada. Trabajamos con maestros patronistas y
                talleres familiares de Galicia, Oporto y Castilla, protegiendo técnicas en riesgo.
              </p>
            </div>
            <div className="pt-6 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              <span>Producción de Serie Corta</span>
              <ArrowUpRight className="size-4" />
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="bg-[#f4eddf] p-8 flex flex-col justify-between hover:bg-[#eee8d9] transition-colors duration-300">
            <div>
              <div className="flex items-center justify-between mb-8">
                <span
                  className="text-3xl text-[#894d00]"
                  style={{ fontFamily: "var(--font-display), sans-serif" }}
                >
                  03
                </span>
                <Infinity className="size-6 text-[#54624f]" />
              </div>
              <h4
                className="text-2xl text-foreground tracking-wider mb-4 uppercase"
                style={{ fontFamily: "var(--font-display), sans-serif" }}
              >
                DISEÑO ATEMPORAL
              </h4>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Prescindimos de las temporadas del calendario de moda rápida. Desarrollamos siluetas
                universales y relajadas que permanecen actuales en su armario durante décadas.
              </p>
            </div>
            <div className="pt-6 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              <span>Permanencia Estética</span>
              <ArrowUpRight className="size-4" />
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Split Editorial Storytelling (The Atelier) ─────────────── */}
      <section className="w-full bg-[#f4eddf] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-5 md:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Visual Column */}
            <div className="lg:col-span-6 relative">
              <div className="relative bg-muted overflow-hidden shadow-sm aspect-[4/5]">
                <Image
                  alt="Sastrería contemporánea NORTE"
                  className="object-cover object-top"
                  src="https://lh3.googleusercontent.com/aida/AEtjO1Vl_PX-W4ZyNh21TwzPoRxqDpnrIGRXDYRHwFabTb144qUPkO9k7BFZgEXEXwES1OwWLzW2llWjzYBAxHp7-aKmZxLozaJBGb8hzGFPDmsYoDZI6UjnFytr-2___47dmuxKKD0fiYyTTsDY47O3xyJwsb_SjoO9mxxw14Tmr7AV-QalVqGl_dE3VKyj9Et3fQzAq7p1nFg5n_qiBgdvttP8in2DtkQdeugHfskd6ab9_YSGCNi1TyChGrY"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              {/* Floating Editorial Badge */}
              <div className="hidden sm:block absolute -bottom-6 -right-6 bg-background p-6 shadow-md border border-border/60 max-w-xs">
                <p
                  className="text-2xl text-foreground tracking-wide uppercase"
                  style={{ fontFamily: "var(--font-display), sans-serif" }}
                >
                  EL CORTE NORTE
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                  Holgura medida, caída desestructurada y acabados ciegos hechos a mano.
                </p>
              </div>
            </div>

            {/* Narrative Column */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <span className="text-xs uppercase tracking-[0.25em] text-[#C77D2E] font-semibold mb-3">
                Capítulo II
              </span>
              <h3
                className="text-4xl sm:text-5xl lg:text-6xl text-foreground tracking-wider leading-none mb-6 uppercase"
                style={{ fontFamily: "var(--font-display), sans-serif" }}
              >
                EL TALLER DE DISEÑO: MANOS, TIEMPO Y RAÍCES
              </h3>
              <div className="space-y-4 text-muted-foreground text-base leading-relaxed">
                <p>
                  NORTE nació en una vieja mesa de corte de roble frente al mar Cantábrico. Nos
                  inspiraba la indumentaria de campo y la sastrería costera de mediados del siglo
                  XX: prendas robustas pero ingrávidas, resistentes al salitre y el viento, pero
                  amables con la piel.
                </p>
                <p>
                  No aspiramos a vestir a millones. Diseñamos para quienes entienden que el
                  verdadero lujo reside en no tener prisa. Cada patrón pasa por un proceso de
                  pruebas que se extiende hasta 8 meses antes de su corte final.
                </p>
              </div>

              {/* Technical Specs Micro-block */}
              <div className="mt-8 pt-8 border-t border-border/60 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#54624f]">
                    Patronaje
                  </p>
                  <p className="text-sm text-foreground mt-1">
                    Siluetas unisex de proporción balanceada y drapeado natural.
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#54624f]">
                    Tintes Vivos
                  </p>
                  <p className="text-sm text-foreground mt-1">
                    Pigmentos botánicos y minerales libres de químicos pesados.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Minimal Metrics & Milestones Row ──────────────────────────── */}
      <section className="w-full max-w-7xl mx-auto px-5 md:px-16 py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-left">
          <div className="p-4 flex flex-col items-center md:items-start">
            <span
              className="text-5xl md:text-6xl text-[#894d00] tracking-wider"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              100%
            </span>
            <span className="text-xs uppercase tracking-widest text-foreground font-semibold mt-2">
              Fibras Naturales
            </span>
            <span className="text-xs text-muted-foreground mt-1">
              Cero derivados plásticos sintéticos
            </span>
          </div>
          <div className="p-4 flex flex-col items-center md:items-start">
            <span
              className="text-5xl md:text-6xl text-[#894d00] tracking-wider"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              0%
            </span>
            <span className="text-xs uppercase tracking-widest text-foreground font-semibold mt-2">
              Excedente Textil
            </span>
            <span className="text-xs text-muted-foreground mt-1">
              Mermas recicladas en accesorios
            </span>
          </div>
          <div className="p-4 flex flex-col items-center md:items-start">
            <span
              className="text-5xl md:text-6xl text-[#894d00] tracking-wider"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              3 AÑOS
            </span>
            <span className="text-xs uppercase tracking-widest text-foreground font-semibold mt-2">
              Garantía de Costura
            </span>
            <span className="text-xs text-muted-foreground mt-1">
              Servicio de remiendo y reparación
            </span>
          </div>
          <div className="p-4 flex flex-col items-center md:items-start">
            <span
              className="text-5xl md:text-6xl text-[#894d00] tracking-wider"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              +12
            </span>
            <span className="text-xs uppercase tracking-widest text-foreground font-semibold mt-2">
              Talleres Locales
            </span>
            <span className="text-xs text-muted-foreground mt-1">
              Economía circular de cercanía
            </span>
          </div>
        </div>
      </section>

      {/* ── 6. Quote & Invitation Section ──────────────────────────────── */}
      <section className="w-full bg-[#f4eddf] py-20">
        <div className="max-w-4xl mx-auto px-5 md:px-16 text-center flex flex-col items-center">
          <Quote className="size-10 text-[#C77D2E] mb-4" />
          <blockquote
            className="text-2xl sm:text-3xl md:text-4xl text-foreground tracking-wide uppercase leading-tight mb-8 max-w-2xl"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            &ldquo;Crear ropa no es acelerar el mundo, sino ofrecer una pausa tangible. Algo que te
            acompañe en los días buenos y en los silenciosos.&rdquo;
          </blockquote>
          <div className="flex flex-col items-center mb-10">
            <div className="h-0.5 w-12 bg-[#C77D2E] mb-3"></div>
            <cite className="not-italic text-sm font-semibold uppercase tracking-widest text-foreground">
              Elena &amp; Mateo Vázquez
            </cite>
            <span className="text-xs text-muted-foreground mt-1">
              Directores Creativos y Co-fundadores de NORTE
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-md">
            <Link
              href="/products"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#C77D2E] text-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#894d00] transition-colors text-center rounded-none shadow-sm flex items-center justify-center gap-2"
            >
              Explorar la Colección <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/contacto"
              className="w-full sm:w-auto px-8 py-3.5 bg-transparent border border-foreground/30 text-foreground text-xs uppercase tracking-[0.2em] font-semibold hover:border-foreground transition-colors text-center rounded-none"
            >
              Contactar Atelier
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
