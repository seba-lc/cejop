/**
 * Backfill: manda el email de confirmación a los inscriptos ya marcados
 * como confirmado=true en cejop_production.confirmaciones_encuentro_1.
 *
 * Requiere: RESEND_API_KEY, MONGODB_URI, MONGODB_DB_SUFFIX en env.
 * Uso:
 *   MONGODB_DB_SUFFIX=production npx tsx --env-file=.env.local \
 *     scripts/backfill-confirmaciones.ts
 *
 * El helper sendConfirmacionAsistencia tiene dedup por email_sends,
 * así que es seguro correrlo varias veces: no reenvía a los que ya
 * recibieron el email.
 */

import { MongoClient } from "mongodb";
import { sendConfirmacionAsistencia } from "../src/lib/send-email";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI no está seteada");
  process.exit(1);
}
if (!process.env.RESEND_API_KEY) {
  console.error("RESEND_API_KEY no está seteada");
  process.exit(1);
}

const client = new MongoClient(uri);

async function main() {
  await client.connect();
  const suffix = process.env.MONGODB_DB_SUFFIX || "production";
  const dbName = `cejop_${suffix}`;
  const db = client.db(dbName);

  console.log(`\n→ Ambiente: ${dbName}`);

  const confirmaciones = await db
    .collection("confirmaciones_encuentro_1")
    .find({ confirmado: true })
    .toArray();

  console.log(
    `→ Confirmaciones activas encontradas: ${confirmaciones.length}\n`
  );

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const c of confirmaciones) {
    const mail = String(c.mail || "").toLowerCase();
    const encuesta = await db
      .collection("encuestas")
      .findOne({ "personal.mail": mail });
    const nombre = encuesta?.personal?.nombre || "";
    const label = nombre ? `${nombre} <${mail}>` : mail;

    const result = await sendConfirmacionAsistencia({ mail, nombre });

    if (result.skipped) {
      console.log(`  · ${label}  —  ya enviado previamente`);
      skipped++;
    } else if (result.ok) {
      console.log(`  ✓ ${label}  —  enviado (id: ${result.id})`);
      sent++;
    } else {
      console.log(`  ✗ ${label}  —  FALLO: ${result.error}`);
      failed++;
    }

    // pequeña pausa para respetar rate limit de Resend (2 req/s en free)
    await new Promise((r) => setTimeout(r, 600));
  }

  console.log(
    `\nResumen:\n  enviados: ${sent}\n  ya enviados previos (dedup): ${skipped}\n  fallidos: ${failed}\n`
  );

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
