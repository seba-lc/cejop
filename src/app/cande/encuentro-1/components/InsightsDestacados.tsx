import type { DashboardData } from "@/types/encuentro1";
import { INTENDENTES } from "@/types/encuentro1";

type Props = { data: DashboardData };

type Insight = {
  emoji: string;
  title: string;
  body: string;
};

function buildInsights(data: DashboardData): Insight[] {
  const speakers = data.audio.speakers;
  const chahla = speakers["CHAHLA (SMT · PJ)"];
  const mansilla = speakers["MANSILLA (Aguilares · PJ)"];
  const molinuevo = speakers["MOLINUEVO (Concepción · UCR)"];
  const serra = speakers["SERRA (Monteros · PJ)"];

  const insights: Insight[] = [];

  if (molinuevo && serra && molinuevo.turns > serra.turns) {
    insights.push({
      emoji: "💡",
      title: "Molinuevo (UCR) tuvo más turnos que Serra (PJ)",
      body: `${molinuevo.turns} vs ${serra.turns}. La oposición se llevó más espacio que un oficialista.`,
    });
  }

  if (chahla && mansilla) {
    const ratio = chahla.speaking_time_s / mansilla.speaking_time_s;
    insights.push({
      emoji: "💡",
      title: `Chahla habló ${ratio.toFixed(1)}× más que Mansilla`,
      body: `${Math.round(chahla.speaking_time_s / 60)} min vs ${Math.round(
        mansilla.speaking_time_s / 60
      )} min. Asimetría fuerte de tiempo de palabra.`,
    });
  }

  if (chahla) {
    insights.push({
      emoji: "🎯",
      title: "Chahla dominó la escena",
      body: `${chahla.turns} turnos · ${chahla.ppm.toFixed(0)} ppm · ${Math.round(
        chahla.speaking_time_s / 60
      )} min. La intendenta capital tuvo el mayor share of voice.`,
    });
  }

  // Sesgo LLA
  const totalFb = data.feedback.origenes.reduce((a, o) => a + o.count, 0);
  const lla = data.feedback.origenes.find(
    (o) => o.label.toLowerCase() === "lla"
  );
  if (lla && totalFb > 0) {
    const pct = Math.round((lla.count / totalFb) * 100);
    if (pct >= 30) {
      insights.push({
        emoji: "🚨",
        title: `Sesgo LLA ${pct}% en feedback`,
        body: `${lla.count} de ${totalFb} respuestas vienen de LLA. Bandera para diversificar audiencia del próximo encuentro.`,
      });
    }
  }

  // Top tema próximo
  if (data.feedback.proximoTemas.length >= 2) {
    const top = data.feedback.proximoTemas.slice(0, 2);
    insights.push({
      emoji: "🎯",
      title: `Tema más pedido: ${top[0].label} + ${top[1].label}`,
      body: `${top[0].count} y ${top[1].count} menciones respectivamente. Empate técnico en el podio.`,
    });
  }

  // Tasa de respuesta
  if (data.encuestas.total > 0) {
    const tasa = (data.feedback.total / data.encuestas.total) * 100;
    insights.push({
      emoji: "📉",
      title: `Tasa de respuesta feedback: ${tasa.toFixed(1)}%`,
      body: `${data.feedback.total} de ${data.encuestas.total} inscriptos respondieron. Plan para subir esto en el 2do encuentro.`,
    });
  }

  // Validación: 4 intendentes presentes
  const allPresent = INTENDENTES.every((i) => speakers[i.key]);
  if (!allPresent) {
    insights.push({
      emoji: "⚠️",
      title: "Falta data de algún intendente",
      body: "Revisar el JSON de audio-metrics — uno de los 4 nombres no matchea.",
    });
  }

  return insights.slice(0, 5);
}

export default function InsightsDestacados({ data }: Props) {
  const insights = buildInsights(data);
  return (
    <section aria-label="Insights destacados" className="mb-10">
      <h2 className="text-lg sm:text-xl font-montserrat font-bold text-cejop-dark mb-3">
        Insights destacados
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {insights.map((ins, i) => (
          <article
            key={i}
            className="bg-white border border-cejop-blue-light/40 rounded-xl p-4 shadow-sm"
          >
            <div className="text-2xl mb-2" aria-hidden="true">
              {ins.emoji}
            </div>
            <h3 className="font-montserrat font-bold text-cejop-dark text-sm leading-snug">
              {ins.title}
            </h3>
            <p className="mt-1.5 text-sm text-cejop-dark/70 leading-relaxed">
              {ins.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
