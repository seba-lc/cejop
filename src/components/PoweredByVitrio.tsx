"use client";

import { buildVitrioUrl } from "@/lib/vitrio";

/**
 * Crédito "Desarrollado por Vitrio" con UTM tagging.
 *
 * Props:
 *   - location: identifica dónde aparece el link (landing-footer,
 *     acreditacion, encuesta, feedback, etc). Se pasa como utm_medium.
 *   - theme: "dark" para fondos oscuros, "light" para fondos claros.
 *
 * TODO: reemplazar el texto "Vitrio" por el logo oficial cuando Seba lo
 * comparta. Dejar el mismo <a> y swapear el contenido por <Image>.
 */
export default function PoweredByVitrio({
  location,
  theme = "dark",
}: {
  location: string;
  theme?: "dark" | "light";
}) {
  const url = buildVitrioUrl(location);
  const labelColor =
    theme === "dark"
      ? "text-white/40 group-hover:text-white/70"
      : "text-gray-500 group-hover:text-gray-900";
  const brandColor =
    theme === "dark"
      ? "text-white/60 group-hover:text-white"
      : "text-gray-700 group-hover:text-cejop-dark";

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-1.5 font-source text-[11px] tracking-wide transition-colors"
      aria-label="Desarrollado por Vitrio"
    >
      <span className={`${labelColor} transition-colors`}>
        Desarrollado por
      </span>
      <span
        className={`${brandColor} font-semibold tracking-[0.12em] uppercase transition-colors`}
      >
        Vitrio
      </span>
    </a>
  );
}
