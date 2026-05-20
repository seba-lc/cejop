"use client";

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { EncuestasStats, FeedbackStats } from "@/types/encuentro1";

type Props = {
  encuestas: EncuestasStats;
  feedback: FeedbackStats;
};

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
      <div className="text-amber-700 font-bold mb-1">Sin datos en Mongo</div>
      <p className="text-sm text-amber-700/80">{message}</p>
      <p className="mt-2 text-[11px] text-amber-700/60">
        En dev: revisar <code>MONGODB_DB_SUFFIX</code> en{" "}
        <code>.env.local</code> (los datos viven en{" "}
        <code>cejop_production</code>).
      </p>
    </div>
  );
}

const PIE_COLORS = [
  "#2C46BF",
  "#5267C9",
  "#B7BFE7",
  "#1A1A2E",
  "#94A3B8",
  "#EF4444",
  "#10B981",
  "#F59E0B",
];

const ORIGEN_COLORS: Record<string, string> = {
  LLA: "#7C3AED",
  PJ: "#2C46BF",
  UCR: "#F59E0B",
  Independiente: "#10B981",
  Otro: "#94A3B8",
};

function Section({
  title,
  children,
  badge,
}: {
  title: string;
  children: React.ReactNode;
  badge?: string;
}) {
  return (
    <div className="bg-white border border-cejop-blue-light/40 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-montserrat font-bold text-sm text-cejop-dark">
          {title}
        </h3>
        {badge && (
          <span className="text-[10px] font-encode uppercase tracking-wide bg-cejop-bg text-cejop-dark/60 px-2 py-0.5 rounded">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

export default function ChartsEncuestas({
  encuestas,
  feedback,
}: Props) {
  return (
    <section aria-label="Gráficos de encuestas" className="mb-10">
      <h2 className="text-lg sm:text-xl font-montserrat font-bold text-cejop-dark mb-3">
        Encuestas
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Columna izquierda: pre-evento */}
        <div className="space-y-4">
          <h3 className="text-sm font-encode uppercase tracking-wide text-cejop-dark/70">
            Pre-evento (n = {encuestas.total})
          </h3>

          {encuestas.total === 0 ? (
            <EmptyState message="No hay respuestas de encuestas pre-evento cargadas." />
          ) : (
          <>

          <Section title="Distribución por edad">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={encuestas.edades}
                  dataKey="count"
                  nameKey="bucket"
                  outerRadius={75}
                  label={({ payload }: { payload?: { bucket: string; count: number } }) =>
                    payload ? `${payload.bucket}: ${payload.count}` : ""
                  }
                >
                  {encuestas.edades.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Section>

          <Section title="Top 10 dirigentes tucumanos valorados">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={encuestas.topDirigentesTuc}
                layout="vertical"
                margin={{ left: 10, right: 20 }}
              >
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={140}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip />
                <Bar dataKey="count" fill="#2C46BF" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Section>

          <Section title="Top 10 dirigentes nacionales valorados">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={encuestas.topDirigentesNac}
                layout="vertical"
                margin={{ left: 10, right: 20 }}
              >
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={140}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip />
                <Bar dataKey="count" fill="#5267C9" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Section>

          <Section title="Ranking 16 prioridades">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={encuestas.prioridadesRanking}
                margin={{ bottom: 60 }}
              >
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2C46BF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Section>
          </>
          )}
        </div>

        {/* Columna derecha: post-evento */}
        <div className="space-y-4">
          <h3 className="text-sm font-encode uppercase tracking-wide text-cejop-dark/70">
            Post-evento (n = {feedback.total})
          </h3>

          {feedback.total === 0 ? (
            <EmptyState message="Todavía no llegaron respuestas de feedback post-evento." />
          ) : (
          <>

          <Section title="Histograma NPS (1-10)">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={feedback.npsDistribution}>
                <XAxis dataKey="score" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {feedback.npsDistribution.map((d) => (
                    <Cell
                      key={d.score}
                      fill={
                        d.score >= 9
                          ? "#10B981"
                          : d.score >= 7
                          ? "#F59E0B"
                          : "#EF4444"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <div className="text-emerald-600 font-bold tabular-nums">
                  {feedback.promoters}
                </div>
                <div className="text-cejop-dark/60">Promoters</div>
              </div>
              <div>
                <div className="text-amber-600 font-bold tabular-nums">
                  {feedback.passives}
                </div>
                <div className="text-cejop-dark/60">Passives</div>
              </div>
              <div>
                <div className="text-rose-600 font-bold tabular-nums">
                  {feedback.detractors}
                </div>
                <div className="text-cejop-dark/60">Detractors</div>
              </div>
            </div>
          </Section>

          <Section title="Próximos temas pedidos">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={feedback.proximoTemas}
                layout="vertical"
                margin={{ left: 10, right: 20 }}
              >
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={150}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip />
                <Bar dataKey="count" fill="#2C46BF" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Section>

          <Section title="Origen político">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={feedback.origenes}
                  dataKey="count"
                  nameKey="label"
                  outerRadius={80}
                  label={({ payload }: { payload?: { label: string; count: number } }) =>
                    payload ? `${payload.label}: ${payload.count}` : ""
                  }
                >
                  {feedback.origenes.map((o, i) => (
                    <Cell
                      key={i}
                      fill={ORIGEN_COLORS[o.label] || PIE_COLORS[i]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Section>

          <Section title="NPS promedio por origen político">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={feedback.npsPorOrigen}>
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value, _name, item) => {
                    const n = (item?.payload as { n?: number } | undefined)?.n ?? 0;
                    return [`${value} (n=${n})`, "NPS"];
                  }}
                />
                <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
                  {feedback.npsPorOrigen.map((o, i) => (
                    <Cell
                      key={i}
                      fill={ORIGEN_COLORS[o.label] || PIE_COLORS[i]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="mt-2 text-[11px] text-cejop-dark/50">
              Tamaños muestrales pequeños (n &lt; 10 en varias categorías).
              Lectura cualitativa.
            </p>
          </Section>

          <Section title="Qué te llevás del encuentro">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {feedback.quotesTeLlevas.map((q, i) => (
                <blockquote
                  key={i}
                  className="bg-cejop-bg rounded-lg p-3 border-l-2 border-cejop-blue/50"
                >
                  <p className="text-sm text-cejop-dark italic leading-snug">
                    &ldquo;{q.text}&rdquo;
                  </p>
                  <footer className="mt-1 text-[10px] text-cejop-dark/50">
                    {q.mail}
                  </footer>
                </blockquote>
              ))}
            </div>
          </Section>
          </>
          )}
        </div>
      </div>
    </section>
  );
}
