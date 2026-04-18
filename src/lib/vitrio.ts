/**
 * URL base y builder de links a Vitrio con UTM tagging.
 * Permite a Vitrio ver desde qué ubicación del sitio CEJOP viene el tráfico.
 */

export const VITRIO_URL = "https://vitrio.ar";

export function buildVitrioUrl(location: string): string {
  const params = new URLSearchParams({
    utm_source: "cejoptucuman",
    utm_medium: location,
    utm_campaign: "powered-by",
  });
  return `${VITRIO_URL}?${params.toString()}`;
}
