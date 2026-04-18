/**
 * Normaliza un teléfono dejando solo dígitos y se queda con los
 * últimos 10. Esto absorbe las variaciones de formato que la gente
 * tipea: +54, 54, 0, prefijos, espacios, paréntesis, guiones.
 *
 * Ejemplos:
 *   "+54 9 381 303 0000"  →  "3813030000"
 *   "03813030000"          →  "3813030000"
 *   "54 381 303-0000"      →  "3813030000"
 *   "3813030000"           →  "3813030000"
 */
export function normalizePhone(raw: string | null | undefined): string {
  if (!raw) return "";
  const digits = String(raw).replace(/\D/g, "");
  return digits.slice(-10);
}
