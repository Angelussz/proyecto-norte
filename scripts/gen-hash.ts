import { hash, compare } from "bcryptjs";

async function main() {
  const h = await hash("password", 10);
  console.log("Hash generado:", h);
  const ok = await compare("password", h);
  console.log("Verificación:", ok);
}

main();
