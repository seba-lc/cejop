#!/usr/bin/env python3
"""Parsea el archivo diarized final → timeline.json con segmentos [{start, end, speaker, text}]."""
import re
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IN_MD = ROOT / "data/audio-e1/transcripcion/panel-intendentes-2026-04-18-final.md"
OUT_JSON = ROOT / "data/audio-e1/analysis/timeline.json"
OUT_JSON.parent.mkdir(parents=True, exist_ok=True)

HDR = re.compile(r"^###\s+(.+?)\s*—\s*\[(\d{2}):(\d{2}):(\d{2})\]")
SEG = re.compile(r"^\*\*\[(\d{2}):(\d{2}):(\d{2})–(\d{2}):(\d{2}):(\d{2})\]\*\*\s+(.*)$")

def hms_to_s(h, m, s):
    return int(h) * 3600 + int(m) * 60 + int(s)

segments = []
current_speaker = "?"
for line in IN_MD.read_text().splitlines():
    m = HDR.match(line.strip())
    if m:
        current_speaker = m.group(1).strip()
        continue
    m = SEG.match(line.strip())
    if m:
        start = hms_to_s(m.group(1), m.group(2), m.group(3))
        end = hms_to_s(m.group(4), m.group(5), m.group(6))
        text = m.group(7).strip()
        segments.append({
            "start": start,
            "end": end,
            "speaker": current_speaker,
            "text": text
        })

# Metadatos speaker color sugerido (para que Simona use en UI)
speaker_colors = {
    "MANSILLA (Aguilares · PJ)": "#10B981",
    "SERRA (Monteros · PJ)":     "#EF4444",
    "MOLINUEVO (Concepción · UCR)": "#F59E0B",
    "CHAHLA (SMT · PJ)":         "#2C46BF",
    "Moderador":                 "#6B7280",
    "Ramiro Coromina (público · UNT)": "#A855F7",
    "Matías Rodríguez (público)":      "#EC4899",
    "Enzo Ferreira (público · LLA)":   "#14B8A6",
    "(voz breve)":               "#9CA3AF",
    "?":                         "#D1D5DB",
}

out = {
    "duration_s": segments[-1]["end"] if segments else 0,
    "speaker_colors": speaker_colors,
    "segments": segments,
}
OUT_JSON.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"OK: {len(segments)} segmentos → {OUT_JSON}")
print(f"duración: {out['duration_s']}s ({out['duration_s']//60}m{out['duration_s']%60}s)")
