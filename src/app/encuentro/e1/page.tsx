import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock, Users, MessageSquare, Mic2, ChevronRight } from "lucide-react";
import AudioPlayer from "@/components/encuentro/AudioPlayer";
import SpeakerTimeline from "@/components/encuentro/SpeakerTimeline";
import audioMetrics from "../../../../data/audio-e1/analysis/audio-metrics.json";
import textMetrics from "../../../../data/audio-e1/analysis/text-metrics.json";
import timelineData from "../../../../data/audio-e1/analysis/timeline.json";

/* ───────── metadata ───────── */
export const metadata: Metadata = {
  title: "Encuentro 1 — Mesa Panel de Intendentes | CEJOP Tucumán",
  description:
    "Escuchá el debate entre los intendentes de San Miguel de Tucumán, Concepción, Monteros y Aguilares. Educación, pymes y federalismo.",
};

/* ───────── tipos ───────── */
type SpeakerKey =
  | "CHAHLA (SMT · PJ)"
  | "MOLINUEVO (Concepción · UCR)"
  | "SERRA (Monteros · PJ)"
  | "MANSILLA (Aguilares · PJ)";

/* ───────── datos estáticos de speakers ───────── */
const SPEAKER_META: Record<
  SpeakerKey,
  { fullName: string; role: string; municipio: string; partido: string }
> = {
  "CHAHLA (SMT · PJ)": {
    fullName: "Rossana Chahla",
    role: "Intendenta",
    municipio: "San Miguel de Tucumán",
    partido: "PJ",
  },
  "MOLINUEVO (Concepción · UCR)": {
    fullName: "Alejandro Molinuevo",
    role: "Intendente",
    municipio: "Concepción",
    partido: "UCR",
  },
  "SERRA (Monteros · PJ)": {
    fullName: "Francisco Serra",
    role: "Intendente",
    municipio: "Monteros",
    partido: "PJ",
  },
  "MANSILLA (Aguilares · PJ)": {
    fullName: "Gimena Mansilla",
    role: "Intendenta",
    municipio: "Aguilares",
    partido: "PJ",
  },
};

const SPEAKER_ORDER: SpeakerKey[] = [
  "CHAHLA (SMT · PJ)",
  "MOLINUEVO (Concepción · UCR)",
  "SERRA (Monteros · PJ)",
  "MANSILLA (Aguilares · PJ)",
];

/* ───────── helpers ───────── */
function fmtMin(secs: number) {
  return (secs / 60).toFixed(1);
}

function fmtDuration(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return `${h}h ${m}m`;
}

const PARTIDO_BADGE: Record<string, string> = {
  PJ: "bg-blue-600/20 text-blue-300 border-blue-600/30",
  UCR: "bg-red-600/20 text-red-300 border-red-600/30",
  LLA: "bg-purple-600/20 text-purple-300 border-purple-600/30",
};

/* ───────── página ───────── */
export default function EncuentroE1Page() {
  const audioSrc =
    process.env.NEXT_PUBLIC_AUDIO_E1_URL ?? "/audio/e1.mp3";

  const colors = timelineData.speaker_colors as Record<string, string>;
  const speakers = audioMetrics.speakers as Record<
    string,
    { speaking_time_s: number; turns: number; words: number; ppm: number }
  >;

  // Max ppm entre los 4 intendentes — para la barra comparativa
  const maxPpm = Math.max(
    ...SPEAKER_ORDER.map((k) => speakers[k]?.ppm ?? 0)
  );

  // Total tiempo hablado (todos los speakers)
  const totalSpeakingTime = Object.values(speakers).reduce(
    (acc, s) => acc + s.speaking_time_s,
    0
  );

  // Keywords top-3 por speaker
  const keywordsBySpeaker = textMetrics.keywords_by_speaker as Record<
    string,
    { word: string; count: number }[]
  >;

  // Quotes tier 1 y tier 2
  const tier1 = textMetrics.quotes_destacadas.filter((q) => q.tier === 1);
  const tier2 = textMetrics.quotes_destacadas.filter((q) => q.tier === 2);

  // Temas ordenados por menciones
  const temas = Object.entries(textMetrics.mentions.temas)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 12);

  // Municipios mencionados
  const municipios = Object.entries(textMetrics.mentions.municipios).sort(
    ([, a], [, b]) => b - a
  );

  return (
    <div className="min-h-screen bg-cejop-dark text-white">
      {/* ── Navbar mínimo ── */}
      <nav className="sticky top-0 z-50 bg-cejop-dark/80 backdrop-blur-md border-b border-white/10">
        <div className="section-container h-14 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Volver</span>
          </Link>

          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-bold text-white/40 uppercase tracking-widest"
              style={{ fontFamily: "var(--font-encode-var)" }}
            >
              Encuentro 1
            </span>
            <span className="text-white/20">·</span>
            <span className="text-white/60 text-xs">18 abr 2026</span>
          </div>

          <Link
            href="/encuestas_ev1"
            className="text-xs font-semibold text-cejop-blue hover:text-cejop-blue-secondary transition-colors hidden sm:block"
          >
            Tu opinión →
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="section-pad border-b border-white/10">
        <div className="section-container">
          {/* Badge */}
          <div className="mb-6">
            <span
              className="inline-flex items-center gap-2 bg-cejop-blue/15 border border-cejop-blue/30 text-cejop-blue-light px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ fontFamily: "var(--font-encode-var)" }}
            >
              <Mic2 size={12} />
              Primer encuentro · 18 de abril de 2026
            </span>
          </div>

          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-4"
            style={{ fontFamily: "var(--font-montserrat-var)" }}
          >
            Mesa Panel
            <br />
            <span className="text-cejop-blue">de Intendentes</span>
          </h1>

          <p className="text-white/60 text-base md:text-lg max-w-2xl leading-relaxed mb-8">
            Cuatro intendentes de Tucumán debatieron sobre educación, desarrollo económico
            y federalismo ante jóvenes universitarios.
          </p>

          {/* Stats rápidas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-8">
            {[
              {
                icon: <Clock size={16} />,
                label: "Duración",
                value: fmtDuration(audioMetrics.duration_seconds),
              },
              {
                icon: <Users size={16} />,
                label: "Intendentes",
                value: "4",
              },
              {
                icon: <MessageSquare size={16} />,
                label: "Palabras",
                value: Object.values(speakers)
                  .reduce((a, s) => a + s.words, 0)
                  .toLocaleString("es-AR"),
              },
              {
                icon: <Mic2 size={16} />,
                label: "Turnos de palabra",
                value: String(
                  SPEAKER_ORDER.reduce(
                    (a, k) => a + (speakers[k]?.turns ?? 0),
                    0
                  )
                ),
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/5 border border-white/10 rounded-xl p-4"
              >
                <div className="text-white/40 mb-2">{stat.icon}</div>
                <p
                  className="text-xl sm:text-2xl font-black"
                  style={{ fontFamily: "var(--font-montserrat-var)" }}
                >
                  {stat.value}
                </p>
                <p className="text-white/40 text-xs mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Chips de intendentes */}
          <div className="flex flex-wrap gap-2">
            {SPEAKER_ORDER.map((key) => {
              const meta = SPEAKER_META[key];
              const color = colors[key];
              return (
                <div
                  key={key}
                  className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5"
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-white/80 text-xs font-medium">
                    {meta.fullName}
                  </span>
                  <span className="text-white/30 text-xs">·</span>
                  <span className="text-white/40 text-xs">{meta.municipio}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Audio Player ── */}
      <section className="section-pad border-b border-white/10">
        <div className="section-container max-w-3xl">
          <h2
            className="text-xl md:text-2xl font-bold mb-6"
            style={{ fontFamily: "var(--font-montserrat-var)" }}
          >
            Escuchá el encuentro
          </h2>
          <AudioPlayer
            src={audioSrc}
            title="Panel de Intendentes — CEJOP Tucumán"
            duration={audioMetrics.duration_seconds}
          />
        </div>
      </section>

      {/* ── Timeline de participación ── */}
      <section className="section-pad border-b border-white/10">
        <div className="section-container">
          <div className="mb-6">
            <h2
              className="text-xl md:text-2xl font-bold mb-1"
              style={{ fontFamily: "var(--font-montserrat-var)" }}
            >
              ¿Quién habló cuándo?
            </h2>
            <p className="text-white/40 text-sm">
              {timelineData.segments.length} segmentos · hacé click para ir al momento
            </p>
          </div>
          <SpeakerTimeline
            segments={timelineData.segments}
            duration={timelineData.duration_s}
            speakerColors={colors}
          />
        </div>
      </section>

      {/* ── Stats por orador ── */}
      <section className="section-pad border-b border-white/10">
        <div className="section-container">
          <div className="mb-6">
            <h2
              className="text-xl md:text-2xl font-bold mb-1"
              style={{ fontFamily: "var(--font-montserrat-var)" }}
            >
              Participación por intendente
            </h2>
            <p className="text-white/40 text-sm">
              Tiempo de palabra, velocidad y temas propios
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {SPEAKER_ORDER.map((key) => {
              const meta = SPEAKER_META[key];
              const stats = speakers[key];
              const color = colors[key];
              const keywords = (keywordsBySpeaker[key] ?? []).slice(0, 3);
              const pct = totalSpeakingTime > 0
                ? Math.round((stats.speaking_time_s / totalSpeakingTime) * 100)
                : 0;
              const ppmPct = maxPpm > 0 ? (stats.ppm / maxPpm) * 100 : 0;

              return (
                <div
                  key={key}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/8 transition-colors"
                  style={{ borderTopColor: color, borderTopWidth: "3px" }}
                >
                  {/* Nombre */}
                  <div className="mb-4">
                    <p
                      className="font-black text-lg leading-tight"
                      style={{
                        fontFamily: "var(--font-montserrat-var)",
                        color: color,
                      }}
                    >
                      {meta.fullName}
                    </p>
                    <p className="text-white/50 text-xs mt-1">
                      {meta.role} · {meta.municipio}
                    </p>
                    <span
                      className={`inline-block mt-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${PARTIDO_BADGE[meta.partido] ?? ""}`}
                      style={{ fontFamily: "var(--font-encode-var)" }}
                    >
                      {meta.partido}
                    </span>
                  </div>

                  {/* Métricas */}
                  <div className="space-y-3 mb-4">
                    {/* Tiempo */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/50">Tiempo de palabra</span>
                        <span className="text-white font-semibold tabular-nums">
                          {fmtMin(stats.speaking_time_s)} min
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                      <p className="text-white/25 text-[10px] mt-0.5 text-right">{pct}% del total</p>
                    </div>

                    {/* Velocidad */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/50">Velocidad</span>
                        <span className="text-white font-semibold tabular-nums">
                          {stats.ppm} ppm
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${ppmPct}%`, backgroundColor: color, opacity: 0.7 }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Stats numericas */}
                  <div className="flex gap-4 mb-4 pt-3 border-t border-white/10">
                    <div>
                      <p className="text-white font-bold text-lg tabular-nums"
                        style={{ fontFamily: "var(--font-montserrat-var)" }}>
                        {stats.words.toLocaleString("es-AR")}
                      </p>
                      <p className="text-white/40 text-[10px]">palabras</p>
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg tabular-nums"
                        style={{ fontFamily: "var(--font-montserrat-var)" }}>
                        {stats.turns}
                      </p>
                      <p className="text-white/40 text-[10px]">turnos</p>
                    </div>
                  </div>

                  {/* Keywords */}
                  {keywords.length > 0 && (
                    <div>
                      <p className="text-white/30 text-[10px] uppercase tracking-wider mb-2"
                        style={{ fontFamily: "var(--font-encode-var)" }}>
                        Sus palabras
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {keywords.map((kw) => (
                          <span
                            key={kw.word}
                            className="text-[11px] px-2 py-0.5 rounded-full bg-white/8 text-white/60 border border-white/10"
                          >
                            {kw.word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Insight destacado */}
          <div className="mt-6 bg-cejop-blue/10 border border-cejop-blue/20 rounded-2xl p-5 flex gap-4 items-start">
            <div className="w-1 bg-cejop-blue rounded-full flex-shrink-0 self-stretch" />
            <div>
              <p
                className="text-white font-bold text-sm mb-1"
                style={{ fontFamily: "var(--font-montserrat-var)" }}
              >
                Dato del encuentro
              </p>
              <p className="text-white/60 text-sm leading-relaxed">
                Rossana Chahla habló{" "}
                <strong className="text-white">2.5 veces más que Gimena Mansilla</strong>{" "}
                — 24.4 minutos vs 10 minutos — y fue la más veloz del panel con{" "}
                <strong className="text-white">157 palabras por minuto</strong>{" "}
                (40% más rápida que Molinuevo).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Frases del encuentro ── */}
      <section className="section-pad border-b border-white/10">
        <div className="section-container">
          <div className="mb-6">
            <h2
              className="text-xl md:text-2xl font-bold mb-1"
              style={{ fontFamily: "var(--font-montserrat-var)" }}
            >
              Frases del encuentro
            </h2>
            <p className="text-white/40 text-sm">
              Las ideas más fuertes de la mesa
            </p>
          </div>

          {/* Tier 1 — grid principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {tier1.map((q, i) => {
              const shortKey = SPEAKER_ORDER.find(
                (k) => k.startsWith(q.speaker.split(" ")[0])
              );
              const color = shortKey ? colors[shortKey] : "#6B7280";
              const meta = shortKey ? SPEAKER_META[shortKey] : null;

              return (
                <div
                  key={i}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/8 transition-colors"
                  style={{ borderLeftColor: color, borderLeftWidth: "3px" }}
                >
                  <p
                    className="text-white font-semibold text-base leading-snug mb-4"
                    style={{ fontFamily: "var(--font-montserrat-var)" }}
                  >
                    "{q.text}"
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-white/60 text-xs">
                        {meta?.fullName ?? q.speaker.split(" (")[0]}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white/40"
                      style={{ fontFamily: "var(--font-encode-var)" }}>
                      {q.topic}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tier 2 — más compacto */}
          {tier2.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tier2.map((q, i) => {
                const shortKey = SPEAKER_ORDER.find(
                  (k) => k.startsWith(q.speaker.split(" ")[0])
                );
                const color = shortKey ? colors[shortKey] : "#6B7280";
                const meta = shortKey ? SPEAKER_META[shortKey] : null;

                return (
                  <div
                    key={i}
                    className="bg-white/3 border border-white/8 rounded-xl p-4 flex gap-3 items-start"
                  >
                    <div
                      className="w-1 rounded-full flex-shrink-0 self-stretch mt-0.5"
                      style={{ backgroundColor: color }}
                    />
                    <div className="min-w-0">
                      <p className="text-white/70 text-sm leading-snug mb-2">"{q.text}"</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white/40 text-[11px]">
                          {meta?.fullName ?? q.speaker.split(" (")[0]}
                        </span>
                        <span className="text-[10px] text-white/30 px-1.5 py-0.5 rounded bg-white/5"
                          style={{ fontFamily: "var(--font-encode-var)" }}>
                          {q.topic}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Temas del debate ── */}
      <section className="section-pad border-b border-white/10">
        <div className="section-container">
          <div className="mb-6">
            <h2
              className="text-xl md:text-2xl font-bold mb-1"
              style={{ fontFamily: "var(--font-montserrat-var)" }}
            >
              De qué se habló
            </h2>
            <p className="text-white/40 text-sm">
              Temas y lugares más mencionados en el debate
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Temas */}
            <div>
              <p
                className="text-white/30 text-[10px] uppercase tracking-widest mb-3"
                style={{ fontFamily: "var(--font-encode-var)" }}
              >
                Temas
              </p>
              <div className="flex flex-wrap gap-2">
                {temas.map(([tema, count]) => {
                  const maxCount = temas[0][1] as number;
                  const scale =
                    0.75 + 0.5 * ((count as number) / (maxCount as number));
                  return (
                    <span
                      key={tema}
                      className="px-3 py-1.5 rounded-full bg-white/8 border border-white/10 text-white/70 font-medium"
                      style={{
                        fontSize: `${scale * 13}px`,
                      }}
                    >
                      {tema}
                      <span className="text-white/25 text-[10px] ml-1.5 tabular-nums">
                        {count}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Municipios */}
            <div>
              <p
                className="text-white/30 text-[10px] uppercase tracking-widest mb-3"
                style={{ fontFamily: "var(--font-encode-var)" }}
              >
                Municipios mencionados
              </p>
              <div className="space-y-2.5">
                {municipios.map(([muni, count]) => {
                  const maxCount = municipios[0][1] as number;
                  const pct = Math.round(
                    ((count as number) / (maxCount as number)) * 100
                  );
                  return (
                    <div key={muni}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/70 capitalize">{muni}</span>
                        <span className="text-white/40 tabular-nums">
                          {count} {(count as number) === 1 ? "vez" : "veces"}
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cejop-blue rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section-pad">
        <div className="section-container text-center max-w-2xl mx-auto">
          <p
            className="text-white/30 text-xs uppercase tracking-widest mb-4"
            style={{ fontFamily: "var(--font-encode-var)" }}
          >
            Próximos encuentros
          </p>
          <h2
            className="text-2xl md:text-3xl font-black mb-4"
            style={{ fontFamily: "var(--font-montserrat-var)" }}
          >
            ¿Vas a estar en el{" "}
            <span className="text-cejop-blue">Encuentro 2</span>?
          </h2>
          <p className="text-white/50 text-sm leading-relaxed mb-8">
            El programa continúa. 30 lugares, formación real con dirigentes reales.
            Sin costo.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/encuestas_ev1"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-colors border border-white/15"
            >
              Dejar mi opinión del encuentro
            </Link>
            <Link
              href="/#formulario"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-cejop-blue hover:bg-cejop-blue-secondary text-white text-sm font-semibold transition-colors"
            >
              Inscribirme al programa
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer mínimo ── */}
      <div className="border-t border-white/10 py-6 text-center">
        <p className="text-white/20 text-xs">
          CEJOP Tucumán · Análisis automático del encuentro del 18 de abril de 2026
        </p>
      </div>
    </div>
  );
}
