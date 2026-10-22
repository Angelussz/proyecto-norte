"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Headphones,
  MapPin,
  RotateCcw,
  Ruler,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
  ChevronRight,
} from "lucide-react";

export function ContactView() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    reason: "",
    orderNum: "",
    message: "",
    privacy: false,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.email ||
      !formData.reason ||
      !formData.message ||
      !formData.privacy
    ) {
      return;
    }
    // Simular envío exitoso
    setSubmitted(true);
  }

  return (
    <div className="flex flex-col w-full bg-background text-foreground">
      {/* ── 1. Editorial Hero & Header ──────────────────────────────────── */}
      <section className="w-full max-w-7xl mx-auto px-5 md:px-16 pt-12 pb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border/60">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-block w-6 h-[1.5px] bg-[#894d00]" />
              <span className="text-xs uppercase tracking-[0.25em] text-[#894d00] font-semibold">
                Atención al Cliente &amp; Atelier
              </span>
            </div>
            <h1
              className="text-6xl md:text-8xl tracking-tight text-foreground leading-none uppercase"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              Contacto
            </h1>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed mt-4 max-w-xl">
              Estamos aquí para acompañarte en tu experiencia NORTE. Escríbenos para consultas sobre
              pedidos, piezas a medida o colaboraciones de prensa.
            </p>
          </div>

          {/* Live Atelier Status Badge */}
          <div className="bg-[#f4eddf] p-5 flex items-center gap-4 self-start md:self-end shadow-sm">
            <div className="relative flex items-center justify-center size-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#54624f] opacity-75" />
              <span className="relative inline-flex rounded-full size-2 bg-[#54624f]" />
            </div>
            <div>
              <span className="block text-[11px] uppercase tracking-widest text-muted-foreground">
                Atelier Activo
              </span>
              <span className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                Madrid, España · Lun - Vie
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Main 2-Column Section: Form + Direct Channels ────────────── */}
      <section className="w-full max-w-7xl mx-auto px-5 md:px-16 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Column 1: Bespoke Contact Form (7 cols) */}
          <div className="lg:col-span-7 bg-[#f4eddf] p-8 md:p-12 shadow-sm">
            <div className="mb-8">
              <span className="text-xs uppercase tracking-widest text-[#54624f] font-semibold block mb-1">
                Formulario de Asistencia
              </span>
              <h2
                className="text-3xl md:text-4xl tracking-wider text-foreground uppercase"
                style={{ fontFamily: "var(--font-display), sans-serif" }}
              >
                Envíanos un Mensaje
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Respondemos a todas las consultas personalmente en menos de 24 horas laborables.
              </p>
            </div>

            {submitted ? (
              <div className="p-8 bg-[#d5e4cc] text-[#131f10] text-center flex flex-col items-center gap-3">
                <CheckCircle2 className="size-10 text-[#33402F]" />
                <h3
                  className="text-2xl tracking-wider uppercase"
                  style={{ fontFamily: "var(--font-display), sans-serif" }}
                >
                  Mensaje Recibido
                </h3>
                <p className="text-sm max-w-md">
                  Tu mensaje ha sido recibido con éxito. Un miembro de nuestro equipo te responderá
                  a la brevedad a tu correo electrónico.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      name: "",
                      email: "",
                      reason: "",
                      orderNum: "",
                      message: "",
                      privacy: false,
                    });
                  }}
                  className="mt-4 px-6 py-2.5 bg-[#33402F] text-white text-xs uppercase tracking-widest font-semibold hover:bg-[#20291d] transition-colors"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="flex flex-col">
                    <label
                      className="text-xs uppercase tracking-widest text-foreground mb-2 font-semibold"
                      htmlFor="contact-name"
                    >
                      Nombre Completo <span className="text-[#894d00]">*</span>
                    </label>
                    <input
                      className="bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#894d00] rounded-none border border-border/50"
                      id="contact-name"
                      name="name"
                      placeholder="Elena Garuz"
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      suppressHydrationWarning
                      autoComplete="name"
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col">
                    <label
                      className="text-xs uppercase tracking-widest text-foreground mb-2 font-semibold"
                      htmlFor="contact-email"
                    >
                      Correo Electrónico <span className="text-[#894d00]">*</span>
                    </label>
                    <input
                      className="bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#894d00] rounded-none border border-border/50"
                      id="contact-email"
                      name="email"
                      placeholder="elena@ejemplo.com"
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      suppressHydrationWarning
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Inquiry Reason */}
                  <div className="flex flex-col">
                    <label
                      className="text-xs uppercase tracking-widest text-foreground mb-2 font-semibold"
                      htmlFor="contact-reason"
                    >
                      Motivo de Consulta <span className="text-[#894d00]">*</span>
                    </label>
                    <div className="relative">
                      <select
                        className="w-full bg-white px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#894d00] rounded-none border border-border/50 appearance-none cursor-pointer pr-10"
                        id="contact-reason"
                        name="reason"
                        required
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        suppressHydrationWarning
                      >
                        <option disabled value="">
                          Selecciona un motivo
                        </option>
                        <option value="pedido">Consulta sobre pedido</option>
                        <option value="asesoria">Asesoría de tallas y materiales</option>
                        <option value="cita">Cita previa en Atelier</option>
                        <option value="prensa">Prensa y colaboraciones</option>
                        <option value="otros">Otros</option>
                      </select>
                      <ChevronRight className="rotate-90 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground size-4" />
                    </div>
                  </div>

                  {/* Order Number (Optional) */}
                  <div className="flex flex-col">
                    <label
                      className="text-xs uppercase tracking-widest text-foreground mb-2 font-semibold flex justify-between"
                      htmlFor="contact-order-num"
                    >
                      <span>Número de Pedido</span>
                      <span className="text-[10px] text-muted-foreground font-normal">
                        Opcional
                      </span>
                    </label>
                    <input
                      className="bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#894d00] rounded-none border border-border/50"
                      id="contact-order-num"
                      name="order-num"
                      placeholder="#NOR-9402"
                      type="text"
                      value={formData.orderNum}
                      onChange={(e) => setFormData({ ...formData, orderNum: e.target.value })}
                      suppressHydrationWarning
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="flex flex-col">
                  <label
                    className="text-xs uppercase tracking-widest text-foreground mb-2 font-semibold"
                    htmlFor="contact-message"
                  >
                    Mensaje <span className="text-[#894d00]">*</span>
                  </label>
                  <textarea
                    className="bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#894d00] rounded-none border border-border/50 resize-y"
                    id="contact-message"
                    name="message"
                    placeholder="Escribe tu mensaje detallando cualquier aspecto sobre las piezas, medidas o preferencias…"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    suppressHydrationWarning
                  />
                </div>

                {/* Privacy Policy Checkbox */}
                <div className="flex items-start gap-3 pt-2">
                  <input
                    className="mt-1 size-4 rounded-none text-[#894d00] focus:ring-0 bg-white border border-border cursor-pointer"
                    id="contact-privacy"
                    name="privacy"
                    required
                    type="checkbox"
                    checked={formData.privacy}
                    onChange={(e) => setFormData({ ...formData, privacy: e.target.checked })}
                    suppressHydrationWarning
                  />
                  <label
                    className="text-xs text-muted-foreground leading-relaxed select-none cursor-pointer"
                    htmlFor="contact-privacy"
                  >
                    Acepto la{" "}
                    <span className="text-foreground underline underline-offset-2 hover:text-[#894d00] transition-colors">
                      política de privacidad
                    </span>{" "}
                    y el tratamiento de mis datos personales para gestionar esta solicitud.
                  </label>
                </div>

                {/* Submit Button & Direct notice */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    className="w-full sm:w-auto bg-[#C77D2E] text-white px-10 py-4 font-headline text-lg tracking-widest uppercase hover:bg-[#894d00] transition-colors flex items-center justify-center gap-3 rounded-none shadow-sm"
                    type="submit"
                    style={{ fontFamily: "var(--font-display), sans-serif" }}
                  >
                    <span>Enviar Mensaje</span>
                    <ArrowRight className="size-5" />
                  </button>

                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <ShieldCheck className="size-4 text-[#54624f]" />
                    Canal directo y confidencial
                  </span>
                </div>
              </form>
            )}
          </div>

          {/* Column 2: Direct Channels & Atelier Info (5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            {/* Atelier & Showroom Block */}
            <div className="bg-[#eee8d9] p-8 relative overflow-hidden shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-[#54624f] font-semibold block">
                    Espacio Físico
                  </span>
                  <h3
                    className="text-2xl tracking-wider text-foreground uppercase mt-1"
                    style={{ fontFamily: "var(--font-display), sans-serif" }}
                  >
                    Atelier &amp; Showroom
                  </h3>
                </div>
                <Store className="size-6 text-[#894d00]" />
              </div>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <MapPin className="size-4.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Calle Mayor del Mar 24</p>
                    <p className="text-xs text-muted-foreground">
                      Barrio Histórico, 28004 Madrid, España
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="size-4.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">
                      Lunes a Viernes: 10:00 — 19:30 h
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Sábados: Con cita previa exclusiva
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-5 border-t border-border/50 flex items-center justify-between">
                <a
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#894d00] uppercase tracking-wider hover:opacity-80 transition-opacity"
                  href="mailto:concierge@norte-studio.com?subject=Reserva%20de%20cita%20privada"
                >
                  <span>Reservar cita privada</span>
                  <ArrowUpRight className="size-4" />
                </a>
                <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
                  Acceso a probador sastre
                </span>
              </div>
            </div>

            {/* Direct Support Block */}
            <div className="bg-[#f4eddf] p-8 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-[#54624f] font-semibold block">
                    Línea Directa
                  </span>
                  <h3
                    className="text-2xl tracking-wider text-foreground uppercase mt-1"
                    style={{ fontFamily: "var(--font-display), sans-serif" }}
                  >
                    Atención Personal
                  </h3>
                </div>
                <Headphones className="size-6 text-[#894d00]" />
              </div>
              <div className="space-y-3 text-sm">
                <div className="bg-white p-4 flex flex-col justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                    Correo Electrónico Atelier
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <a
                      className="font-medium text-foreground hover:text-[#894d00] transition-colors text-sm"
                      href="mailto:concierge@norte-studio.com"
                    >
                      concierge@norte-studio.com
                    </a>
                    <a
                      className="text-xs text-muted-foreground hover:text-[#894d00] transition-colors"
                      href="mailto:info@norte-studio.com"
                    >
                      info@norte-studio.com (General)
                    </a>
                  </div>
                </div>

                <div className="bg-white p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 block">
                      Teléfono / WhatsApp
                    </span>
                    <a
                      className="font-medium text-foreground hover:text-[#894d00] transition-colors text-sm"
                      href="tel:+34912345678"
                    >
                      +34 912 345 678
                    </a>
                  </div>
                  <span className="text-xs bg-[#d5e4cc] text-[#131f10] px-2 py-1 uppercase tracking-widest font-semibold">
                    9h — 18h
                  </span>
                </div>
              </div>
            </div>

            {/* FAQ Fast Navigation */}
            <div className="bg-[#f4eddf] p-6 shadow-sm">
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground block mb-2 font-semibold">
                Guías Frecuentes
              </span>
              <h4
                className="text-xl tracking-wider text-foreground uppercase mb-4"
                style={{ fontFamily: "var(--font-display), sans-serif" }}
              >
                ¿Necesitas resolverlo ahora?
              </h4>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <Link
                  className="flex items-center justify-between p-3 bg-white hover:bg-[#eee8d9] transition-colors text-foreground"
                  href="#"
                >
                  <span className="flex items-center gap-2.5">
                    <Truck className="size-4 text-[#894d00]" />
                    <span>Plazos de Envío y Entregas Internacionales</span>
                  </span>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Link>
                <Link
                  className="flex items-center justify-between p-3 bg-white hover:bg-[#eee8d9] transition-colors text-foreground"
                  href="#"
                >
                  <span className="flex items-center gap-2.5">
                    <Ruler className="size-4 text-[#894d00]" />
                    <span>Guía de Tallas, Siluetas y Medidas</span>
                  </span>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Link>
                <Link
                  className="flex items-center justify-between p-3 bg-white hover:bg-[#eee8d9] transition-colors text-foreground"
                  href="#"
                >
                  <span className="flex items-center gap-2.5">
                    <RotateCcw className="size-4 text-[#894d00]" />
                    <span>Política de Cambios y Devoluciones</span>
                  </span>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Editorial Atmospheric Anchor ─────────────────────────────── */}
      <section className="w-full max-w-7xl mx-auto px-5 md:px-16 py-12">
        <div className="bg-[#eee8d9] overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-sm">
          {/* Visual Left Block */}
          <div className="lg:col-span-6 relative min-h-[380px] lg:min-h-full">
            <Image
              alt="Atelier y taller de sastrería NORTE"
              className="object-cover object-center"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8bLKcW_ezc9QAoeimf5QrdMCO-QViogeoNMoGkAYiQqQ2mxqIlu7fyNpVrOpsO71nmct7We9olSo3AfaYs8D89lV383gvKoeRcic1CtO-1_DEG7DfmUvJmHC5sQrmnRioN57bBDuu3HPA8vqH-hzzW-czMqjJ3JRQnN-cTIqWFXOBmdJsFxQqBaAzFI73CJ7_3fhhRmEQopcb9ra8WzvMQm4dnwM-2uN0Z0BMhQwok757UWu246W9"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />
            <div className="absolute bottom-6 left-6 text-white lg:hidden">
              <span className="text-[10px] uppercase tracking-widest bg-[#54624f] px-2 py-1">
                Atelier Central
              </span>
              <p
                className="text-2xl tracking-wider mt-1 uppercase"
                style={{ fontFamily: "var(--font-display), sans-serif" }}
              >
                Confección Cálida y Honesta
              </p>
            </div>
          </div>

          {/* Narrative Right Block */}
          <div className="lg:col-span-6 p-8 md:p-14 flex flex-col justify-between bg-[#eee8d9]">
            <div>
              <div className="flex items-center gap-2 text-[#894d00] mb-3">
                <Sparkles className="size-4.5" />
                <span className="text-xs uppercase tracking-[0.2em] font-semibold">
                  Hecho con propósito
                </span>
              </div>
              <h3
                className="text-3xl md:text-5xl tracking-wide text-foreground uppercase leading-none mb-6"
                style={{ fontFamily: "var(--font-display), sans-serif" }}
              >
                Una relación cercana basada en la calma y el detalle
              </h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6">
                Cada prenda NORTE se concibe para habitar tu día a día con comodidad reflexiva. Si
                deseas consultar composiciones de lino puro, cuidados específicos de hilado o
                coordinar un pedido especial para ceremonias, nuestro equipo de diseño te atenderá
                con dedicación artesanal.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                <div>
                  <span
                    className="text-3xl text-foreground block uppercase"
                    style={{ fontFamily: "var(--font-display), sans-serif" }}
                  >
                    100%
                  </span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    Fibras Naturales
                  </span>
                </div>
                <div>
                  <span
                    className="text-3xl text-foreground block uppercase"
                    style={{ fontFamily: "var(--font-display), sans-serif" }}
                  >
                    &lt; 24h
                  </span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    Atención sastre
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#C77D2E] text-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#894d00] transition-colors rounded-none shadow-sm"
              >
                Explorar Catálogo <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
