#!/usr/bin/env python3
"""
Corre diarización standalone con pyannote 3.1 sobre el audio del panel,
y mergea con la transcripción ya generada por whisperX.

Prerequisito: aceptar condiciones en:
  - https://huggingface.co/pyannote/speaker-diarization-3.1
  - https://huggingface.co/pyannote/segmentation-3.0

Uso:
    export HF_TOKEN=$(cat ~/.config/hf_token)
    export SSL_CERT_FILE=$(python -c "import certifi;print(certifi.where())")
    python tools/run-diarization.py

Output: data/audio-e1/transcripcion/panel-intendentes-2026-04-18-diarized.md
"""
import os
import re
import subprocess
from pathlib import Path

from pyannote.audio import Pipeline
import torch
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
AUDIO_M4A = ROOT / "data/audio-e1/panel-intendentes-2026-04-18.m4a"
AUDIO_WAV = ROOT / "data/audio-e1/panel-intendentes-2026-04-18.wav"
LOG_V2    = ROOT / "data/audio-e1/transcripcion/whisperx.log"
OUT_DIR   = ROOT / "data/audio-e1/transcripcion"
OUT_MD    = OUT_DIR / "panel-intendentes-2026-04-18-diarized.md"
RTTM      = OUT_DIR / "panel-intendentes-2026-04-18.rttm"

def ensure_wav():
    if AUDIO_WAV.exists():
        print(f"WAV ya existe: {AUDIO_WAV}")
        return
    print(f"Convirtiendo m4a → wav (16kHz, mono)…")
    subprocess.run([
        "ffmpeg", "-y", "-i", str(AUDIO_M4A),
        "-ar", "16000", "-ac", "1", str(AUDIO_WAV)
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print("OK")

def run_diarization(min_s=5, max_s=10):
    print("Cargando pipeline pyannote/speaker-diarization-3.1…")
    pipeline = Pipeline.from_pretrained(
        "pyannote/speaker-diarization-3.1",
        token=os.environ["HF_TOKEN"]
    )
    # MPS en M1 no soportado estable por pyannote → CPU
    pipeline.to(torch.device("cpu"))
    print("Cargando WAV con soundfile (bypass torchcodec)…")
    data, sr = sf.read(str(AUDIO_WAV), dtype="float32")
    waveform = torch.from_numpy(data).unsqueeze(0)
    print(f"WAV: shape={waveform.shape}, sr={sr}")
    print("Corriendo diarización…")
    dia = pipeline({"waveform": waveform, "sample_rate": sr},
                   min_speakers=min_s, max_speakers=max_s)
    # pyannote 4.x devuelve DiarizeOutput; 3.x devolvía Annotation directo.
    annotation = getattr(dia, "speaker_diarization", dia)
    with open(RTTM, "w") as f:
        annotation.write_rttm(f)
    print(f"RTTM: {RTTM}")
    segs = []
    for turn, _, speaker in annotation.itertracks(yield_label=True):
        segs.append((turn.start, turn.end, speaker))
    return segs

def parse_transcript():
    pat = re.compile(r"^Transcript:\s*\[(\d+\.\d+)\s*-->\s*(\d+\.\d+)\]\s+(.*)$")
    segs = []
    for line in LOG_V2.read_text().splitlines():
        m = pat.match(line)
        if m:
            segs.append((float(m.group(1)), float(m.group(2)), m.group(3).strip()))
    return segs

def speaker_for(start, end, dia_segs):
    """Para un segmento de texto, retorna el speaker con mayor overlap."""
    best_spk = None
    best_overlap = 0
    for s, e, spk in dia_segs:
        overlap = max(0, min(end, e) - max(start, s))
        if overlap > best_overlap:
            best_overlap = overlap
            best_spk = spk
    return best_spk or "?"

def fmt_t(s):
    h = int(s // 3600); m = int((s % 3600) // 60); sec = int(s % 60)
    return f"{h:02d}:{m:02d}:{sec:02d}"

def main():
    ensure_wav()
    dia_segs = run_diarization()
    tr_segs = parse_transcript()
    print(f"Segmentos transcripción: {len(tr_segs)}")
    print(f"Turnos diarización: {len(dia_segs)}")

    lines = ["# Panel Intendentes CEJOP — 18/04/2026 (diarizado)\n",
             f"Transcripción whisperX large-v3 + diarización pyannote 3.1",
             f"Segmentos: {len(tr_segs)} · Turnos: {len(dia_segs)}\n",
             "---\n"]
    prev_spk = None
    for a, b, t in tr_segs:
        spk = speaker_for(a, b, dia_segs)
        if spk != prev_spk:
            lines.append(f"\n### {spk} — [{fmt_t(a)}]\n")
            prev_spk = spk
        lines.append(f"**[{fmt_t(a)}–{fmt_t(b)}]** {t}\n")
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(f"OK: {OUT_MD}")

if __name__ == "__main__":
    main()
