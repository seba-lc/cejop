import type { DashboardData } from "@/types/encuentro1";
import { INTENDENTES } from "@/types/encuentro1";
import SeekButton from "./SeekButton";

type Props = { data: DashboardData };

function initials(nombre: string): string {
  return nombre
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function partidoColor(partido: string): string {
  switch (partido) {
    case "PJ":
      return "bg-blue-100 text-blue-800";
    case "UCR":
      return "bg-amber-100 text-amber-800";
    case "LLA":
      return "bg-violet-100 text-violet-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function dominantSentiment(
  s?: { positive: number; neutral: number; negative: number }
) {
  if (!s) return { emoji: "🤖", label: "ML pending", pct: null as number | null };
  const total = s.positive + s.neutral + s.negative;
  if (total === 0)
    return { emoji: "🤖", label: "ML pending", pct: null as number | null };
  const pos = s.positive / total;
  const neg = s.negative / total;
  const neu = s.neutral / total;
  if (pos >= neu && pos >= neg)
    return { emoji: "😀", label: "positivo", pct: Math.round(pos * 100) };
  if (neg >= pos && neg >= neu)
    return { emoji: "😠", label: "negativo", pct: Math.round(neg * 100) };
  return { emoji: "😐", label: "neutral", pct: Math.round(neu * 100) };
}

export default function IntendentesGrid({ data }: Props) {
  return (
    <section aria-label="Tarjetas por intendente" className="mb-10">
      <h2 className="text-lg sm:text-xl font-montserrat font-bold text-cejop-dark mb-3">
        Por intendente
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {INTENDENTES.map((intendente) => {
          const m = data.audio.speakers[intendente.key];
          const color = data.timeline.speaker_colors[intendente.key] || "#888";
          const sentiment = dominantSentiment(
            data.text.sentiment_by_speaker[intendente.key]
          );
          const quotes = data.text.quotes_destacadas
            .filter((q) => q.speaker === intendente.key)
            .slice(0, 3);
          const keywords = (
            data.text.keywords_by_speaker[intendente.key] || []
          ).slice(0, 5);

          return (
            <article
              key={intendente.key}
              className="bg-white border border-cejop-blue-light/40 rounded-xl p-5 shadow-sm"
            >
              <header className="flex items-start gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-montserrat font-bold text-sm shrink-0"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                >
                  {initials(intendente.nombre)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-montserrat font-bold text-cejop-dark">
                    {intendente.nombre}
                  </h3>
                  <p className="text-sm text-cejop-dark/60">
                    {intendente.municipio}
                  </p>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold ${partidoColor(
                      intendente.partido
                    )}`}
                  >
                    {intendente.partido}
                  </span>
                </div>
              </header>

              <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="bg-cejop-bg rounded-lg py-2">
                  <dt className="text-[10px] font-encode uppercase tracking-wide text-cejop-dark/60">
                    Tiempo
                  </dt>
                  <dd className="text-base font-bold text-cejop-dark tabular-nums">
                    {m ? `${Math.round(m.speaking_time_s / 60)} min` : "—"}
                  </dd>
                </div>
                <div className="bg-cejop-bg rounded-lg py-2">
                  <dt className="text-[10px] font-encode uppercase tracking-wide text-cejop-dark/60">
                    Turnos
                  </dt>
                  <dd className="text-base font-bold text-cejop-dark tabular-nums">
                    {m ? m.turns : "—"}
                  </dd>
                </div>
                <div className="bg-cejop-bg rounded-lg py-2">
                  <dt className="text-[10px] font-encode uppercase tracking-wide text-cejop-dark/60">
                    PPM
                  </dt>
                  <dd className="text-base font-bold text-cejop-dark tabular-nums">
                    {m ? m.ppm.toFixed(0) : "—"}
                  </dd>
                </div>
              </dl>

              <div className="mt-3 flex items-center gap-2 text-sm">
                <span className="text-xl" aria-hidden="true">
                  {sentiment.emoji}
                </span>
                <span className="text-cejop-dark/70">
                  Sentiment: <strong>{sentiment.label}</strong>
                  {sentiment.pct !== null && (
                    <span className="text-cejop-dark/50"> · {sentiment.pct}%</span>
                  )}
                </span>
              </div>

              {keywords.length > 0 && (
                <div className="mt-3">
                  <div className="text-[10px] font-encode uppercase tracking-wide text-cejop-dark/60 mb-1">
                    Keywords top 5
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {keywords.map((k) => (
                      <span
                        key={k.word}
                        className="px-2 py-0.5 bg-cejop-blue-light/40 text-cejop-dark text-xs rounded"
                      >
                        {k.word}
                        <span className="text-cejop-dark/50 ml-1 tabular-nums">
                          {k.count}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {quotes.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="text-[10px] font-encode uppercase tracking-wide text-cejop-dark/60">
                    Frases destacadas
                  </div>
                  {quotes.map((q) => (
                    <blockquote
                      key={q.timestamp}
                      className="border-l-2 border-cejop-blue/40 pl-3 py-1"
                    >
                      <p className="text-sm text-cejop-dark italic leading-snug">
                        &ldquo;{q.text}&rdquo;
                      </p>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-[11px] text-cejop-dark/60">
                          {q.topic}
                        </span>
                        <SeekButton timestamp={q.timestamp} />
                      </div>
                    </blockquote>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
