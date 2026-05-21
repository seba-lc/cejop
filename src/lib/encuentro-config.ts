import { getDb } from "@/lib/mongodb";

/**
 * Config de encuentros CEJOP.
 *
 * El catálogo de encuentros vive en código (constante ENCUENTROS).
 * Cuál encuentro está VIGENTE en este momento se controla desde el
 * dashboard admin: la clave `encuentro_activo` en la colección `settings`.
 *
 * Convención de colecciones:
 *   feedback / asistentes / confirmaciones / pendientes_acreditacion →
 *     sufijo `_encuentro_<numero>` (helper colName()).
 *   encuestas → colección única con campo `encuentroId`.
 */

export type EncuentroId = "e1" | "e2";

export type EncuentroConfig = {
  id: EncuentroId;
  numero: number;
  ordinal: string;
  fecha: string;
  fechaLarga: string;
  titulo: string;
};

export const ENCUENTROS: Record<EncuentroId, EncuentroConfig> = {
  e1: {
    id: "e1",
    numero: 1,
    ordinal: "1er",
    fecha: "2026-04-18",
    fechaLarga: "sábado 18 de abril de 2026",
    titulo: "Mesa Panel Intendentes",
  },
  e2: {
    id: "e2",
    numero: 2,
    ordinal: "2do",
    fecha: "2026-05-30",
    fechaLarga: "sábado 30 de mayo de 2026",
    titulo: "2do encuentro CEJOP",
  },
};

/**
 * Default cuando no hay valor en settings: el último encuentro previo
 * que ya pasó (e1). Esto garantiza que un encuentro nuevo NO se active
 * solo por desplegar código — siempre requiere acción explícita en el
 * dashboard.
 */
export const ENCUENTRO_DEFAULT: EncuentroId = "e1";

export const SETTING_KEY_ENCUENTRO_ACTIVO = "encuentro_activo";

function isValidId(value: unknown): value is EncuentroId {
  return typeof value === "string" && value in ENCUENTROS;
}

/**
 * Lee el encuentro activo desde Mongo settings. Si no está seteado o el
 * valor es inválido, devuelve ENCUENTRO_DEFAULT.
 */
export async function getEncuentroActivo(): Promise<EncuentroId> {
  try {
    const db = await getDb();
    const setting = await db
      .collection("settings")
      .findOne({ key: SETTING_KEY_ENCUENTRO_ACTIVO });
    if (isValidId(setting?.value)) return setting.value;
  } catch (err) {
    console.error("[encuentro-config] error leyendo activo:", err);
  }
  return ENCUENTRO_DEFAULT;
}

export async function setEncuentroActivo(id: EncuentroId): Promise<void> {
  if (!isValidId(id)) throw new Error(`encuentroId inválido: ${id}`);
  const db = await getDb();
  await db.collection("settings").updateOne(
    { key: SETTING_KEY_ENCUENTRO_ACTIVO },
    { $set: { value: id, updatedAt: new Date() } },
    { upsert: true },
  );
}

export function getEncuentro(id: EncuentroId): EncuentroConfig {
  return ENCUENTROS[id];
}

type CollectionBase =
  | "feedback"
  | "asistentes"
  | "confirmaciones"
  | "pendientes_acreditacion";

/**
 * Resuelve el nombre real de la colección Mongo para un encuentro dado.
 * Ej: colName("feedback", "e2") → "feedback_encuentro_2"
 *
 * Nota: `pendientes_acreditacion` mantiene el patrón histórico sin sufijo
 * "_encuentro_" (la colección del 1er encuentro se llama
 * `pendientes_acreditacion_1`).
 */
export function colName(base: CollectionBase, id: EncuentroId): string {
  const numero = ENCUENTROS[id].numero;
  if (base === "pendientes_acreditacion") {
    return `pendientes_acreditacion_${numero}`;
  }
  return `${base}_encuentro_${numero}`;
}

export function emailCampaign(
  kind: "confirmacion" | "gracias-feedback",
  id: EncuentroId,
): string {
  return `${kind}-encuentro-${ENCUENTROS[id].numero}`;
}
