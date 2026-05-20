#!/usr/bin/env python3
"""Parse whisperx log to generate .txt / .srt / .md transcripts."""
import re
import sys
from pathlib import Path

log_path = Path(sys.argv[1])
out_dir = log_path.parent
base = "panel-intendentes-2026-04-18"

segments = []
pattern = re.compile(r"^Transcript:\s*\[(\d+\.\d+)\s*-->\s*(\d+\.\d+)\]\s+(.*)$")
for line in log_path.read_text().splitlines():
    m = pattern.match(line)
    if m:
        segments.append((float(m.group(1)), float(m.group(2)), m.group(3).strip()))

def fmt_t(s, srt=False):
    h = int(s // 3600); m = int((s % 3600) // 60); sec = s % 60
    if srt:
        ms = int((sec - int(sec)) * 1000)
        return f"{h:02d}:{m:02d}:{int(sec):02d},{ms:03d}"
    return f"{h:02d}:{m:02d}:{int(sec):02d}"

# .txt plano
(out_dir / f"{base}.txt").write_text("\n".join(s[2] for s in segments) + "\n", encoding="utf-8")

# .srt
srt_lines = []
for i, (a, b, t) in enumerate(segments, 1):
    srt_lines += [str(i), f"{fmt_t(a, True)} --> {fmt_t(b, True)}", t, ""]
(out_dir / f"{base}.srt").write_text("\n".join(srt_lines), encoding="utf-8")

# .md navegable con timestamps
md = ["# Panel Intendentes CEJOP — 18/04/2026\n",
      "Transcripción cruda (whisperX large-v3, sin diarización por fallo SSL en alignment)\n",
      f"Total segmentos: {len(segments)} · duración cubierta: {fmt_t(segments[-1][1])}\n\n---\n"]
for a, b, t in segments:
    md.append(f"**[{fmt_t(a)} – {fmt_t(b)}]** {t}\n")
(out_dir / f"{base}.md").write_text("\n".join(md), encoding="utf-8")

print(f"OK: {len(segments)} segmentos → {base}.txt, .srt, .md")
print(f"Duración cubierta: {fmt_t(segments[-1][1])}")
