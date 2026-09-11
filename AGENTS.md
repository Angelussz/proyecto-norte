<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS — proyecto-norte (NORTE tienda)

## Stack
- Next.js 16.3.4 (App Router) + React 19 + TypeScript 5. Package manager: **pnpm** (Volta: node 24.20.0, pnpm 11.26.0).
- Tailwind CSS v4 (`app/globals.css` con `@import "tailwindcss"` + tokens oklch beige/naranja/verde) + shadcn `base-nova` + `lucide-react` (no Material Symbols). `dark` por clase `.dark`.
- Comandos: `pnpm dev` / `pnpm build` / `pnpm start` / `pnpm lint` / `pnpm exec tsc --noEmit`.

## Estructura y capas (respetar)
- `app/(shop)/` — route group tienda (no aparece en la URL). `app/(shop)/layout.tsx` monta `StoreHeader/Footer` + fuentes `Bebas Neue`/`Inter`. No meter Header/Footer en `app/layout.tsx` raíz.
- `app/(shop)/product/[id]/page.tsx` — **Server Component async** (`params: Promise<{id}>`). Sin `useState`/`useMemo`; la interactividad vive en componentes `"use client"`. Incluye `generateMetadata` + `not-found.tsx`.
- `services/` — fetching/simulate API (ej. `services/product.service.ts::getProductDetail`). Hoy mock + `delay()`; mañana `fetch` con `cache: "force-cache"`. No poner fetching en `lib/`.
- `interfaces/` — contrato backend puro (ej. `interfaces/product.interface.ts`). No importar mocks ni fetch aquí.
- `lib/mocks.ts` — datos mock (`PRODUCT_BY_ID_MOCK`, forma `{ data: { product }, suggestions }`). El service adapta a `{ product, suggestions }`.
- `lib/products.ts` — solo helpers puros (`getGalleryImages`, `isSizeAvailable`, `formatPrice`). Fuente de verdad de disponibilidad: `variant.stock > 0`.
- `components/store/` — UI tienda (`store-header`, `store-footer`, `product-info` client, `product-suggestions`). Reutilizar `components/ui/*` (shadcn/Base-UI). Iconos siempre de `lucide-react`.
- `components.json` — aliases `@/components`, `@/lib`, `@/components/ui`.

## Convenciones
- Estilo editorial Stitch: `rounded-none`, `uppercase tracking-widest`, grid `md:grid-cols-12` (galería 7 / info 5 `sticky top-24`), `aspect-[4/5]` con brackets.
- Imágenes remotas: añadir hostname en `next.config.ts > images.remotePatterns` (actual: `lh3.googleusercontent.com`).
- Mock vigente: producto id `"1"` → probar en `/product/1`; otro id → `notFound()`.
- Antes de codificar rutas nuevas, leer la guía correspondiente en `node_modules/next/dist/docs/`.
