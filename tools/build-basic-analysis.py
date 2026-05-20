#!/usr/bin/env python3
"""Análisis básico (sin modelos ML): PPM, duración por speaker, menciones, keywords por frecuencia.
Genera audio-metrics.json (parcial) y text-metrics.json (parcial) con schema completo
y flags 'pending_*' para lo que requiere modelos pesados (emotion, sentiment, applause detection).
"""
import json
import re
from pathlib import Path
from collections import Counter

ROOT = Path(__file__).resolve().parent.parent
TL_JSON = ROOT / "data/audio-e1/analysis/timeline.json"
AUDIO_OUT = ROOT / "data/audio-e1/analysis/audio-metrics.json"
TEXT_OUT = ROOT / "data/audio-e1/analysis/text-metrics.json"

timeline = json.loads(TL_JSON.read_text())
segments = timeline["segments"]

# Stopwords español básicas para keywords
STOP = set("de la el en y a los las que del se por un una con no para es al le lo su como más pero sus si ya o este esta estos estas todo todos todas mi mis me te tu tus nos yo tú él ella nosotros nosotras ustedes ellos ellas muy muy ha he has hay hemos han haya donde cuando porque también entre sobre sin ser están estaban estamos era eran fue fueron hoy acá ahí allá acá aquí hace creo bueno bien dice dicen algo alguien nada nadie todo cada poco mucho algunos algunas".split())

# Por speaker
speakers = {}
all_text = []
for seg in segments:
    spk = seg["speaker"]
    dur = seg["end"] - seg["start"]
    text = seg["text"]
    words = re.findall(r"\b[a-záéíóúñü]+\b", text.lower())
    if spk not in speakers:
        speakers[spk] = {"speaking_time_s": 0, "turns": 0, "words": 0, "text": [], "kwords": []}
    speakers[spk]["speaking_time_s"] += dur
    speakers[spk]["words"] += len(words)
    speakers[spk]["text"].append(text)
    speakers[spk]["kwords"].extend([w for w in words if len(w) > 3 and w not in STOP])
    all_text.append(text)

# Calcular turnos (cambios de speaker)
prev = None
for seg in segments:
    if seg["speaker"] != prev:
        speakers[seg["speaker"]]["turns"] += 1
    prev = seg["speaker"]

# audio-metrics.json (parcial)
audio_metrics = {
    "duration_seconds": timeline["duration_s"],
    "pending_applause_detection": True,
    "pending_laughter_detection": True,
    "pending_pitch_analysis": True,
    "pending_long_pauses": True,
    "claps": [],
    "laughs": [],
    "long_pauses": [],
    "speakers": {}
}
for spk, data in speakers.items():
    ppm = (data["words"] / data["speaking_time_s"] * 60) if data["speaking_time_s"] > 0 else 0
    audio_metrics["speakers"][spk] = {
        "speaking_time_s": round(data["speaking_time_s"], 1),
        "turns": data["turns"],
        "words": data["words"],
        "ppm": round(ppm, 1),
        "pitch_mean_hz": None,
        "pitch_std_hz": None,
        "energy_mean": None,
    }

# text-metrics.json (parcial)
# Menciones de interés
MENTIONS = {
    "politicos": ["milei", "jaldo", "kicillof", "massa", "kirchner", "catalán", "bregman", "villarruel", "menem", "sturzenegger", "bullrich", "ferreira", "chahla", "mansilla", "serra", "molinuevo", "medina"],
    "empresas": ["topper", "alpargatas", "budeguer", "balcanes", "jaguar", "mostaza", "bachea"],
    "instituciones": ["unt", "ubá", "bloomberg", "corte nacional", "pjn", "ansés", "anses", "denosa", "fonavit", "usp", "uti"],
    "municipios": ["aguilares", "monteros", "concepción", "san miguel"],
    "temas": ["pyme", "pymes", "industria", "importación", "importaciones", "textil", "zafra", "coparticipación", "pacto fiscal", "autonomía", "legislatura", "presupuesto", "mérito", "idoneidad", "educación", "salud", "celular", "universidad", "discapacidad", "acople", "peronismo", "peronista", "libertad"]
}

all_low = " ".join(all_text).lower()
mentions = {cat: {} for cat in MENTIONS}
for cat, terms in MENTIONS.items():
    for t in terms:
        count = len(re.findall(r"\b" + re.escape(t) + r"\b", all_low))
        if count > 0:
            mentions[cat][t] = count
    mentions[cat] = dict(sorted(mentions[cat].items(), key=lambda x: -x[1]))

keywords_by_speaker = {}
for spk, data in speakers.items():
    c = Counter(data["kwords"])
    keywords_by_speaker[spk] = [{"word": w, "count": n} for w, n in c.most_common(15)]

# Quotes destacadas (manual por timestamp - cargadas desde post-mortem cuali)
quotes_destacadas = [
    {"speaker": "CHAHLA (SMT · PJ)", "timestamp": 3593, "text": "San Miguel de Tucumán ha pasado por todos los partidos políticos y nadie ha hecho nada", "tier": 1, "topic": "autocrítica política"},
    {"speaker": "CHAHLA (SMT · PJ)", "timestamp": 3709, "text": "Un Estado eficiente e inteligente que contenga a todos los ciudadanos", "tier": 1, "topic": "gestión"},
    {"speaker": "CHAHLA (SMT · PJ)", "timestamp": 3553, "text": "Que vuelva el mérito claro", "tier": 1, "topic": "meritocracia"},
    {"speaker": "SERRA (Monteros · PJ)", "timestamp": 2279, "text": "Me siento orgullosamente peronista", "tier": 1, "topic": "identidad política"},
    {"speaker": "SERRA (Monteros · PJ)", "timestamp": 2413, "text": "En Argentina han cerrado más de 200.000 pymes. Y esto es dato, no es relato", "tier": 1, "topic": "economía"},
    {"speaker": "SERRA (Monteros · PJ)", "timestamp": 4584, "text": "Siempre ganamos por acople, siempre contra el oficialismo. Ahora somos oficiales, pero siempre por acople", "tier": 1, "topic": "trayectoria política"},
    {"speaker": "MOLINUEVO (Concepción · UCR)", "timestamp": 2235, "text": "La pyme es la gran esperanza que tenemos para salir adelante como país", "tier": 1, "topic": "economía"},
    {"speaker": "MOLINUEVO (Concepción · UCR)", "timestamp": 3740, "text": "Un presidente que se animó a tomar una medida antipopular que en un futuro puede traer beneficios concretos", "tier": 2, "topic": "Milei"},
    {"speaker": "MANSILLA (Aguilares · PJ)", "timestamp": 1529, "text": "Es medio difícil competir con una zapatilla que entra de China de 15 mil pesos", "tier": 1, "topic": "Topper/importaciones"},
    {"speaker": "MANSILLA (Aguilares · PJ)", "timestamp": 1380, "text": "El objetivo es que el niño se haga independiente: que sepa manejar su plata, cocinarse, comprarse ropa", "tier": 2, "topic": "Pujo Monay / discapacidad"},
]

text_metrics = {
    "pending_sentiment_ml": True,
    "pending_topic_modeling": True,
    "sentiment_by_speaker": {},
    "sentiment_timeline": [],
    "keywords_by_speaker": keywords_by_speaker,
    "mentions": mentions,
    "quotes_destacadas": quotes_destacadas,
}

AUDIO_OUT.write_text(json.dumps(audio_metrics, ensure_ascii=False, indent=2))
TEXT_OUT.write_text(json.dumps(text_metrics, ensure_ascii=False, indent=2))
print(f"OK: {AUDIO_OUT.name}, {TEXT_OUT.name}")
print(f"\nSpeakers con PPM:")
for spk, d in audio_metrics["speakers"].items():
    if d["speaking_time_s"] > 30:
        print(f"  {spk[:40]:<40} {d['speaking_time_s']:>6.0f}s {d['turns']:>3} turnos {d['ppm']:>6.1f} ppm")
