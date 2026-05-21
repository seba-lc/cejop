/**
 * Migración one-shot: marcar todos los documentos existentes en `encuestas`
 * (los inscriptos al 1er encuentro) con `encuentroId: "e1"`.
 *
 * Idempotente: solo toca docs SIN `encuentroId`. Correr varias veces es seguro.
 *
 * Uso:
 *   MONGODB_URI="..." MONGODB_DB_SUFFIX="production" \
 *     npx tsx tools/migrate-encuestas-e1.ts --dry-run
 *
 *   MONGODB_URI="..." MONGODB_DB_SUFFIX="production" \
 *     npx tsx tools/migrate-encuestas-e1.ts --apply
 */
import { MongoClient } from "mongodb";

async function main() {
  const mode = process.argv[2];
  if (mode !== "--dry-run" && mode !== "--apply") {
    console.error("Usage: tsx tools/migrate-encuestas-e1.ts --dry-run|--apply");
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("ERROR: MONGODB_URI no está seteada");
    process.exit(1);
  }
  const suffix = process.env.MONGODB_DB_SUFFIX || "production";
  const dbName = `cejop_${suffix}`;

  const client = new MongoClient(uri);
  await client.connect();
  try {
    const db = client.db(dbName);
    const col = db.collection("encuestas");

    const total = await col.countDocuments({});
    const pending = await col.countDocuments({
      encuentroId: { $exists: false },
    });
    const already = await col.countDocuments({
      encuentroId: { $exists: true },
    });

    console.log(`DB: ${dbName}`);
    console.log(`Colección: encuestas`);
    console.log(`  total docs:         ${total}`);
    console.log(`  ya con encuentroId: ${already}`);
    console.log(`  a migrar (sin id):  ${pending}`);

    if (mode === "--dry-run") {
      console.log("\n[dry-run] No se aplicaron cambios.");
      return;
    }

    if (pending === 0) {
      console.log("\nNada que migrar. Saliendo.");
      return;
    }

    console.log(`\n[apply] Marcando ${pending} docs con encuentroId="e1"...`);
    const res = await col.updateMany(
      { encuentroId: { $exists: false } },
      { $set: { encuentroId: "e1" } },
    );
    console.log(`OK: matched=${res.matchedCount} modified=${res.modifiedCount}`);
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error("ERROR:", err);
  process.exit(1);
});
