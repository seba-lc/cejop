"use client";

import Image from "next/image";
import { buildVitrioUrl } from "@/lib/vitrio";

/**
 * Crédito discreto "Desarrollado por Vitrio" con UTM tagging.
 * Sin hover — es un crédito de pie, no un CTA.
 */
export default function PoweredByVitrio({
  location,
  theme = "dark",
}: {
  location: string;
  theme?: "dark" | "light";
}) {
  const url = buildVitrioUrl(location);

  const textColor = theme === "dark" ? "text-white/30" : "text-gray-400";

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5"
      aria-label="Desarrollado por Vitrio"
    >
      <span className={`font-source text-[11px] ${textColor}`}>
        Desarrollado por
      </span>
      <Image
        src="/vitrio-v2.png"
        alt="Vitrio"
        width={44}
        height={14}
        className="h-3.5 w-auto object-contain opacity-50"
      />
    </a>
  );
}
