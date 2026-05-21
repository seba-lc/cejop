/**
 * Config de encuentros CEJOP.
 *
 * Para activar un nuevo encuentro:
 *   1. Sumar la entrada al objeto ENCUENTROS.
 *   2. Cambiar ENCUENTRO_ACTIVO al nuevo id.
 *   3. Commit + deploy.
 *
 * Convención: las colecciones específicas de un encuentro usan sufijo
 * `_encuentro_<numero>` (asistentes, confirmaciones, pendientes_acreditacion,
 * feedback). La colección `encuestas` es compartida y se discrimina por
 * el campo `encuentroId`.
 */

export type EncuentroId = "e1" | "e2";

export type EncuentroConfig = {
  id: EncuentroId;
  numero: number;
  /** Slug para titles/copy. Ej: "1er", "2do", "3er". */
  ordinal: string;
  /** Fecha en formato ISO YYYY-MM-DD. */
  fecha: string;
  /** Texto humano para el copy ("sábado 30 de mayo de 2026"). */
  fechaLarga: string;
  /** Título corto del evento ("Mesa Panel Intendentes"). */
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

export const ENCUENTRO_ACTIVO: EncuentroId = "e2";

export function getEncuentro(id: EncuentroId = ENCUENTRO_ACTIVO): EncuentroConfig {
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
 * `pendientes_acreditacion` mantiene el patrón histórico sin sufijo "_encuentro_"
 * (la colección del 1er encuentro se llama `pendientes_acreditacion_1`).
 */
export function colName(base: CollectionBase, id: EncuentroId = ENCUENTRO_ACTIVO): string {
  const numero = ENCUENTROS[id].numero;
  if (base === "pendientes_acreditacion") {
    return `pendientes_acreditacion_${numero}`;
  }
  return `${base}_encuentro_${numero}`;
}

/** Campaign id para emails transaccionales, parametrizado por encuentro. */
export function emailCampaign(
  kind: "confirmacion" | "gracias-feedback",
  id: EncuentroId = ENCUENTRO_ACTIVO,
): string {
  return `${kind}-encuentro-${ENCUENTROS[id].numero}`;
}
