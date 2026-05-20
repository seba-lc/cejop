import type { DashboardData } from "@/types/encuentro1";

type Props = { data: DashboardData };

function formatDuration(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// Sensor de temperatura: 4 subscores 0-10
function calcTemperatura(data: DashboardData) {
  const npsSubscore = (data.feedback.npsAvg / 10) * 10; // 0-10
  const recomendariaPct =
    data.feedback.total > 0
      ? (data.feedback.recomendaria.si / data.feedback.total) * 10
      : 0;
  const tasaRespuesta =
    data.encuestas.total > 0
      ? (data.feedback.total / data.encuestas.total) * 100
      : 0;
  const tasaSubscore = Math.min(10, tasaRespuesta / 5); // 50% de tasa = 10
  const pluralismoSubscore = (() => {
    const total = data.feedback.origenes.reduce((a, o) => a + o.count, 0);
    if (total === 0) return 0;
    const max = Math.max(...data.feedback.origenes.map((o) => o.count));
    const dominancia = max / total;
    return Math.max(0, 10 - dominancia * 10);
  })();
  const score =
    npsSubscore * 0.4 +
    recomendariaPct * 0.3 +
    tasaSubscore * 0.15 +
    pluralismoSubscore * 0.15;
  return {
    score: Math.round(score * 10) / 10,
    breakdown: [
      { label: "NPS", value: Math.round(npsSubscore * 10) / 10 },
      { label: "% recomendaría", value: Math.round(recomendariaPct * 10) / 10 },
      { label: "Tasa de respuesta", value: Math.round(tasaSubscore * 10) / 10 },
      { label: "Pluralismo", value: Math.round(pluralismoSubscore * 10) / 10 },
    ],
  };
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="bg-white border border-cejop-blue-light/40 rounded-xl p-4 sm:p-5 shadow-sm">
      <div className="text-xs font-encode uppercase tracking-wide text-cejop-dark/60">
        {label}
      </div>
      <div className="mt-1 text-2xl sm:text-3xl font-montserrat font-bold text-cejop-dark tabular-nums">
        {value}
      </div>
      {hint && (
        <div className="mt-1 text-xs text-cejop-dark/60">{hint}</div>
      )}
    </div>
  );
}

export default function HeaderMetricas({ data }: Props) {
  const temp = calcTemperatura(data);
  const tasa =
    data.encuestas.total > 0
      ? Math.round((data.feedback.total / data.encuestas.total) * 1000) / 10
      : 0;
  const recomPct =
    data.feedback.total > 0
      ? Math.round(
          (data.feedback.recomendaria.si / data.feedback.total) * 100
        )
      : 0;

  return (
    <section aria-label="Métricas del encuentro" className="mb-10">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <MetricCard label="Inscriptos" value={String(data.encuestas.total)} />
        <MetricCard label="Asistentes" value="72" hint="69% de inscriptos" />
        <MetricCard
          label="Feedback"
          value={String(data.feedback.total)}
          hint={`${tasa}% tasa`}
        />
        <MetricCard label="NPS" value={data.feedback.npsAvg.toFixed(2)} />
        <MetricCard label="Recomendaría" value={`${recomPct}%`} />
        <MetricCard
          label="Grabado"
          value={formatDuration(data.audio.duration_seconds)}
        />
      </div>

      <div className="mt-4 bg-gradient-to-br from-cejop-blue to-cejop-blue-variant rounded-xl p-5 sm:p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="text-xs font-encode uppercase tracking-wide text-white/70">
              Sensor de temperatura del evento
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-montserrat font-bold tabular-nums">
                {temp.score.toFixed(1)}
              </span>
              <span className="text-white/70 text-lg">/10</span>
            </div>
          </div>
          <details className="group">
            <summary className="cursor-pointer text-sm font-encode uppercase tracking-wide text-white/80 hover:text-white list-none">
              Ver breakdown ▾
            </summary>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {temp.breakdown.map((b) => (
                <div
                  key={b.label}
                  className="flex justify-between bg-white/10 rounded-lg px-3 py-2"
                >
                  <span className="text-white/80">{b.label}</span>
                  <span className="font-bold tabular-nums">
                    {b.value.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </details>
        </div>
      </div>
    </section>
  );
}
