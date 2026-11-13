import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Falta DATABASE_URL en el archivo .env");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

async function main() {
  // Parámetros por CLI o valores por defecto
  const email = (process.argv[2] || "admin@admin.com").toLowerCase().trim();
  const password = process.argv[3] || "admin123";
  const name = process.argv[4] || "Carlos";
  const lastName = process.argv[5] || "Mendoza";
  const phone = process.argv[6] || "+51 987 654 321";
  const roleInput = (process.argv[7] || "ADMIN").toUpperCase();
  const role = roleInput === "CUSTOMER" ? "CUSTOMER" : "ADMIN";

  console.log(`\n⏳ Procesando usuario: ${email}...`);

  // Generamos el hash con bcryptjs (cost factor 10)
  const passwordHash = await hash(password, 10);

  // Usamos upsert para crear o actualizar si ya existía
  const user = await prisma.users.upsert({
    where: { email },
    update: {
      name,
      last_name: lastName,
      phone,
      password_hash: passwordHash,
      role,
      email_verified: true,
      email_verified_at: new Date(),
    },
    create: {
      name,
      last_name: lastName,
      email,
      phone,
      password_hash: passwordHash,
      role,
      email_verified: true,
      email_verified_at: new Date(),
    },
  });

  console.log("\n✅ Usuario guardado correctamente en la base de datos:");
  console.log("--------------------------------------------------");
  console.log(`ID:             ${user.id}`);
  console.log(`Nombre:         ${user.name}`);
  console.log(`Apellido:       ${user.last_name}`);
  console.log(`Email:          ${user.email}`);
  console.log(`Contraseña:     ${password} (almacenada como hash bcrypt)`);
  console.log(`Teléfono:       ${user.phone}`);
  console.log(`Rol:            ${user.role}`);
  console.log(`Email Verif.:   ${user.email_verified}`);
  console.log("--------------------------------------------------\n");
}

main()
  .catch((error) => {
    console.error("❌ Error al crear el usuario:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
