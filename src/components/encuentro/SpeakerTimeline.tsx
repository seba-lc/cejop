"use client";

import { useState, useCallback } from "react";

interface Segment {
  start: number;
  end: number;
  speaker: string;
  text: string;
}

interface SpeakerTimelineProps {
  segments: Segment[];
  duration: number;
  speakerColors: Record<string, string>;
}

const MAIN_SPEAKERS = [
  "CHAHLA (SMT · PJ)",
  "MOLINUEVO (Concepción · UCR)",
  "SERRA (Monteros · PJ)",
  "MANSILLA (Aguilares · PJ)",
];

const SHORT_LABELS: Record<string, string> = {
  "CHAHLA (SMT · PJ)": "Chahla",
  "MOLINUEVO (Concepción · UCR)": "Molinuevo",
  "SERRA (Monteros · PJ)": "Serra",
  "MANSILLA (Aguilares · PJ)": "Mansilla",
};

function formatTime(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export default function SpeakerTimeline({ segments, duration, speakerColors }: SpeakerTimelineProps) {
  const [active, setActive] = useState<{
    speaker: string;
    text: string;
    time: string;
  } | null>(null);

  const handleClick = useCallback((start: number) => {
    window.dispatchEvent(new CustomEvent("cejop-seek", { detail: { seconds: start } }));
    document.getElementById("audio-player")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  // Time markers (minutes)
  const markers = [0, 15, 30, 45, 60, 77];

  return (
    <div>
      {/* Barra principal */}
      <div className="relative h-8 md:h-10 rounded-xl overflow-hidden bg-white/10">
        {segments.map((seg, i) => {
          const left = (seg.start / duration) * 100;
          const width = Math.max(((seg.end - seg.start) / duration) * 100, 0.12);
          const color = speakerColors[seg.speaker] ?? "#4B5563";

          return (
            <div
              key={i}
              className="absolute top-0 h-full cursor-pointer hover:brightness-125 transition-[filter]"
              style={{ left: `${left}%`, width: `${width}%`, backgroundColor: color }}
              onClick={() => handleClick(seg.start)}
              onMouseEnter={() =>
                setActive({
                  speaker: SHORT_LABELS[seg.speaker] ?? seg.speaker.split(" (")[0],
                  text: seg.text.slice(0, 90) + (seg.text.length > 90 ? "…" : ""),
                  time: formatTime(seg.start),
                })
              }
              onMouseLeave={() => setActive(null)}
            />
          );
        })}
      </div>

      {/* Marcadores de tiempo */}
      <div className="flex justify-between mt-1.5 px-0.5">
        {markers.map((min) => (
          <span key={min} className="text-white/30 text-[10px] tabular-nums">{min}′</span>
        ))}
      </div>

      {/* Tooltip hover */}
      {active && (
        <div className="mt-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: speakerColors[Object.keys(SHORT_LABELS).find(k => SHORT_LABELS[k] === active.speaker) ?? ""] ?? "#6B7280" }}
            />
            <span className="text-white font-semibold">{active.speaker}</span>
            <span className="text-white/40 ml-auto tabular-nums">{active.time}</span>
          </div>
          <p className="text-white/60 leading-relaxed">{active.text}</p>
          <p className="text-cejop-blue mt-1.5 text-[10px]">Hacé click en el segmento para ir al audio</p>
        </div>
      )}

      {/* Leyenda */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4">
        {MAIN_SPEAKERS.map((speaker) => (
          <div key={speaker} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ backgroundColor: speakerColors[speaker] }}
            />
            <span className="text-white/50 text-xs">{SHORT_LABELS[speaker]}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-purple-500 flex-shrink-0" />
          <span className="text-white/50 text-xs">Público / Moderador</span>
        </div>
      </div>
    </div>
  );
}
