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
pnpm dlx prisma migrate dev --name mi_cambio
pnpm dlx prisma generate
pnpm dlx prisma migrate status

# 3. Resetear la base de datos (borra datos y re-aplica migraciones)
pnpm dlx prisma migrate reset
# te pide confirmar con el nombre de la DB, escribe: <tu POSTGRES_DB>

# 4. Borrar el volumen y volver a crearlo (hard reset)
docker compose down -v
docker compose up -d
pnpm dlx prisma migrate dev
```

Flujo completo desde cero (copiar/pegar):

```bash
docker compose up -d
pnpm dlx prisma migrate dev --name init
pnpm dlx prisma generate
# ... trabajas, cambias schema.prisma ...
pnpm dlx prisma migrate dev --name add_mi_cambio
# ... si algo se rompe ...
pnpm dlx prisma migrate reset
# ... si quieres partir de un volumen limpio ...
docker compose down -v
docker compose up -d
pnpm dlx prisma migrate dev
```

Útiles:

```bash
docker compose down           # apaga sin borrar datos
docker volume ls | grep norte # ver el volumen proyecto-norte-pgdata
```

> No edites SQL de `prisma/migrations/*` ya aplicadas; crea una migración nueva.
> `migrate deploy` es solo para prod/CI.
