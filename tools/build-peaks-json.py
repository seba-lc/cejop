"""Genera peaks.json para wavesurfer (waveform pre-rendereada).

Lee data/audio-e1/panel-intendentes-2026-04-18.mp3 y produce
data/audio-e1/analysis/peaks.json con N peaks normalizados [-1, 1].

Wavesurfer espera un array de floats (mono) o un array de arrays (stereo).
Usamos mono porque el audio final también es mono.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
AUDIO_SRC = ROOT / "data" / "audio-e1" / "panel-intendentes-2026-04-18.mp3"
OUT = ROOT / "data" / "audio-e1" / "analysis" / "peaks.json"

# Cantidad de peaks: 4000 da ~1 peak cada ~1.8s en un audio de 2h.
# Es la resolución típica que usa wavesurfer al renderizar 64px de alto.
NUM_PEAKS = 4000


def main() -> int:
    if not AUDIO_SRC.exists():
        print(f"ERROR: no existe {AUDIO_SRC}", file=sys.stderr)
        return 1

    data, sr = sf.read(str(AUDIO_SRC), dtype="float32", always_2d=False)
    if data.ndim > 1:
        data = data.mean(axis=1)

    total_samples = data.shape[0]
    duration_s = total_samples / sr
    samples_per_peak = max(1, total_samples // NUM_PEAKS)

    peaks: list[float] = []
    for i in range(NUM_PEAKS):
        start = i * samples_per_peak
        end = start + samples_per_peak
        chunk = data[start:end]
        if chunk.size == 0:
            peaks.append(0.0)
            continue
        peaks.append(float(np.max(np.abs(chunk))))

    arr = np.array(peaks, dtype=np.float32)
    peak_max = float(arr.max()) if arr.size else 1.0
    if peak_max > 0:
        arr = arr / peak_max
    rounded = [round(float(p), 4) for p in arr.tolist()]

    payload = {
        "version": 1,
        "channels": 1,
        "sample_rate": int(sr),
        "samples_per_peak": int(samples_per_peak),
        "length": len(rounded),
        "duration_s": round(duration_s, 3),
        "peaks": rounded,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, separators=(",", ":")), encoding="utf-8")
    size_kb = OUT.stat().st_size / 1024
    print(
        f"OK: {OUT} · {len(rounded)} peaks · "
        f"{duration_s:.1f}s · {size_kb:.1f} KB"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
