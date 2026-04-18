"use client";

import Image from "next/image";
import { buildVitrioUrl } from "@/lib/vitrio";

/**
 * Crédito "Desarrollado por Vitrio" — estilo tomado del footer de
 * vitrio.tech: isotipo pequeño + texto en uppercase con tracking wide,
 * hover cambia al flame #FF6035.
 *
 * Props:
 *   - location: utm_medium para el tracking en GA de Vitrio.
 *   - theme: "dark" (claro sobre oscuro) / "light" (oscuro sobre claro).
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
      ? "text-white/35 group-hover:text-white/60"
      : "text-gray-500 group-hover:text-gray-700";
  const brandColor =
    theme === "dark"
      ? "text-white/70 group-hover:text-[#FF6035]"
      : "text-gray-800 group-hover:text-[#FF6035]";

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-2.5 transition-colors"
      aria-label="Desarrollado por Vitrio — vitrio.tech"
    >
      <span
        className={`font-encode text-[10px] font-medium tracking-[0.25em] uppercase ${labelColor} transition-colors`}
      >
        Desarrollado por
      </span>
      <span className="flex items-center gap-1.5">
        <Image
          src="/vitiro-logo.png"
          alt=""
          width={16}
          height={16}
          className="w-4 h-4 object-contain opacity-70 group-hover:opacity-100 transition-opacity"
        />
        <span
          className={`font-encode text-[11px] font-semibold tracking-[0.22em] uppercase ${brandColor} transition-colors`}
        >
          Vitrio
        </span>
      </span>
    </a>
  );
}
