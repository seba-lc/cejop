import { loadDashboardData } from "@/lib/encuentro1-data";
import HeaderMetricas from "./components/HeaderMetricas";
import InsightsDestacados from "./components/InsightsDestacados";
import AudioNavegable from "./components/AudioNavegable";
import IntendentesGrid from "./components/IntendentesGrid";
import ChartsEncuestas from "./components/ChartsEncuestas";
import NubeMenciones from "./components/NubeMenciones";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Encuentro 1 — Panel intendentes | CEJOP",
  robots: { index: false, follow: false },
};

export default async function EncuentroUnoPage() {
  const data = await loadDashboardData();

  return (
    <main className="min-h-screen bg-cejop-bg">
      <header className="bg-cejop-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <p className="text-xs font-encode uppercase tracking-widest text-cejop-blue-light">
            CEJOP · Dashboard interno
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-montserrat font-bold">
            Encuentro 1 — Panel intendentes
          </h1>
          <p className="mt-1 text-sm text-white/70">
            18 de abril de 2026 · Mansilla, Serra, Molinuevo, Chahla
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-encode uppercase tracking-wide">
            <span
              className={`px-2 py-1 rounded ${
                data.source.analysis === "live"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-amber-500/20 text-amber-300"
              }`}
            >
              Análisis: {data.source.analysis}
            </span>
            <span
              className={`px-2 py-1 rounded ${
                data.source.mongo === "live"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-rose-500/20 text-rose-300"
              }`}
            >
              Mongo:{" "}
              {data.source.mongo === "live"
                ? `live (encuestas ${data.encuestas.total} · feedback ${data.feedback.total})`
                : "sin datos"}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <HeaderMetricas data={data} />
        <InsightsDestacados data={data} />
        <AudioNavegable
          audioUrl={data.audioUrl}
          timeline={data.timeline}
          audio={data.audio}
        />
        <IntendentesGrid data={data} />
        <ChartsEncuestas
          encuestas={data.encuestas}
          feedback={data.feedback}
        />
        <NubeMenciones data={data} />
      </div>
    </main>
  );
}
