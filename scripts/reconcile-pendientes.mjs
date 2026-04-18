/**
 * Reconcilia pendientes_acreditacion_1 con asistentes_encuentro_1.
 *
 * Busca pendientes en estado "approved" que no tengan su correspondiente
 * registro en asistentes (por bug histórico del orden de operaciones en
 * PATCH) y los inserta.
 *
 * Uso:
 *   MONGODB_DB_SUFFIX=production node --env-file=.env.local \
 *     scripts/reconcile-pendientes.mjs
 */

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI no está seteada");
  process.exit(1);
}

const client = new MongoClient(uri);
await client.connect();
const suffix = process.env.MONGODB_DB_SUFFIX || "production";
const dbName = `cejop_${suffix}`;
const db = client.db(dbName);

console.log(`→ Ambiente: ${dbName}\n`);

const approved = await db
  .collection("pendientes_acreditacion_1")
  .find({ estado: "approved" })
  .toArray();

console.log(`Pendientes aprobados: ${approved.length}`);

let created = 0;
let alreadyThere = 0;

for (const doc of approved) {
  const mail = (doc.mail || "").toLowerCase();
  if (!mail) {
    console.log(`  · (sin mail) ${doc.nombre} — skip`);
    continue;
  }
  const existing = await db
    .collection("asistentes_encuentro_1")
    .findOne({ mail });

  if (existing) {
    console.log(`  · ${mail} — ya en asistentes`);
    alreadyThere++;
    continue;
  }

  const inscriptoFlag = !!doc.inscripto;
  const tipo = inscriptoFlag ? "inscripto_no_confirmado" : "walk_in";
  await db.collection("asistentes_encuentro_1").insertOne({
    mail,
    nombre: doc.nombre || "",
    telefono: doc.telefono || "",
    tipo,
    inscripto: inscriptoFlag,
    confirmado: false,
    encuentro: "e1",
    createdAt: doc.resolvedAt || new Date(),
    pendienteId: String(doc._id),
  });
  console.log(`  ✓ ${mail} → asistentes (tipo: ${tipo})`);
  created++;
}

console.log(
  `\nResumen: ${created} creados en asistentes, ${alreadyThere} ya estaban.\n`
);

await client.close();
