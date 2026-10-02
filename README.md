# Proyecto NORTE

## Empezando

Primero, ejecute el servidor de desarrollo:

```bash
pnpm dev

```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Base de datos local (Docker + Prisma)

Postgres 16 via `docker-compose.yml` (servicio `db`, volumen `proyecto-norte-pgdata`).
Requiere Docker Desktop encendido y `.env` con `POSTGRES_PASSWORD`, `POSTGRES_DB` y
`DATABASE_URL` apuntando a `localhost:5432` (password/db deben coincidir con `POSTGRES_*`).
Usar `pnpm dlx prisma ...` (no `npx`). Prisma 7: schema en `prisma/schema.prisma`, config en `prisma.config.ts`.

```bash
# 1. Encender Postgres
docker compose up -d
docker compose ps
docker compose logs -f db

# 2. Crear una nueva migración en desarrollo (con la DB encendida)
pnpm prisma migrate dev --name mi_cambio
pnpm prisma generate
pnpm prisma migrate status

# 3. Resetear la base de datos (borra datos y re-aplica migraciones)
pnpm dlx prisma migrate reset
# te pide confirmar con el nombre de la DB, escribe: <tu POSTGRES_DB>

# 4. Borrar el volumen y volver a crearlo (hard reset)
docker compose down -v
docker compose up -d
pnpm prisma migrate dev
```

Flujo completo desde cero (copiar/pegar):

```bash
docker compose up -d
pnpm prisma migrate dev  # si te sale el nombre dale enter
pnpm prisma generate
# ... trabajas, cambias schema.prisma ...
pnpm prisma migrate dev # si te sale el nombre dale enter
# ... si algo se rompe ...
pnpm prisma migrate reset
# ... si quieres partir de un volumen limpio ...
docker compose down -v
docker compose up -d
pnpm prisma migrate dev
```

Útiles:

```bash
docker compose down           # apaga sin borrar datos
docker volume ls | grep norte # ver el volumen proyecto-norte-pgdata
```

> No edites SQL de `prisma/migrations/*` ya aplicadas; crea una migración nueva.
> `migrate deploy` es solo para prod/CI.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Colaboración en Proyecto Norte

### Brian Segovia — Frontend

Participación en el desarrollo frontend del proyecto, trabajando en el listado de productos.

Tareas realizadas:

* Implementación de filtros por categoría.
* Implementación de filtro por rango de precio.
* Implementación de ordenamiento por precio.
* Implementación de ordenamiento por nombre.
* Desarrollo e integración del grid de productos.
* Desarrollo e integración de las cards de productos.
* Implementación del estado vacío cuando no se encuentran productos.
* Implementación de paginación.
* Integración de los filtros con la paginación.
* Trabajo con Git y GitHub mediante ramas para la colaboración del equipo.

### Cómo ver la página de productos

Para visualizar la página desarrollada:

1. Abrir una terminal en la carpeta del proyecto.
2. Ejecutar:

```bash
pnpm dev
```

3. Abrir el navegador y acceder a:

http://localhost:3000/products

Ahí se puede visualizar la página de productos desarrollada.

### Claudio Peñalva — Backend / API

Participación en el desarrollo del endpoint de catálogo público de productos con conexión a PostgreSQL via Prisma y fallback mock resiliente.

Tareas realizadas:

* Creación del endpoint público `GET /api/products`.
* Conexión a la base de datos PostgreSQL mediante Prisma ORM (Docker + Prisma 7).
* Filtros por categoría (`category`), rango de precio (`minPrice`, `maxPrice`) y ordenamiento (`price_asc`, `price_desc`, `name_asc`, `newest`).
* Paginación dinámica (`page`, `limit`).
* Sistema de fallback automático con MOCK: Si la base de datos PostgreSQL no está disponible (Docker apagado) o si la tabla de productos está vacía (sin seeds), el endpoint y la capa de servicio responden automáticamente con los datos mock, evitando caídas o bloqueos para el equipo de desarrollo.
* Implementación de la capa de servicio `getProductCatalog` (`features/product/services/product-catalog.service.ts`) con soporte tanto en client-side como en server-side.

### Cómo probar el endpoint de productos

1. Con el servidor de desarrollo encendido (`pnpm dev`).
2. Abrir en el navegador o herramienta de peticiones HTTP:

http://localhost:3000/api/products

3. Ejemplos de filtros soportados:

* Por categoría: `http://localhost:3000/api/products?category=Camisas`
* Por precio y ordenamiento: `http://localhost:3000/api/products?minPrice=100&maxPrice=150&sortBy=price_asc`
* Paginación: `http://localhost:3000/api/products?page=1&limit=6`

