import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

const FEEDBACK_COLLECTION = "feedback_encuentro_1";

const TOPIC_LABELS: Record<string, string> = {
  interior: "Ministerio del Interior",
  economia: "Economía",
  judicial: "Poder Judicial",
  legislativo: "Poder Legislativo",
  urbanizacion: "Urbanización y política social",
  medios: "Medios y opinión pública",
  juventudes: "Juventudes y trabajo",
  empresas: "Empresas y producción",
};

type FeedbackDoc = {
  mail: string;
  nps: number;
  teLlevas: string;
  mejorarias: string;
  proximoTemas: string[];
  proximoOtro: string;
  recomendaria: "si" | "talvez" | "no";
  origenPolitico: string;
  createdAt: Date | string;
};

export async function GET() {
  try {
    const db = await getDb();
    const docs = await db
      .collection<FeedbackDoc>(FEEDBACK_COLLECTION)
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Normalize
    const items = docs.map((d) => ({
      id: String((d as unknown as { _id: unknown })._id),
      mail: d.mail,
      nps: d.nps,
      teLlevas: d.teLlevas || "",
      mejorarias: d.mejorarias || "",
      proximoTemas: Array.isArray(d.proximoTemas) ? d.proximoTemas : [],
      proximoOtro: d.proximoOtro || "",
      recomendaria: d.recomendaria,
      origenPolitico: d.origenPolitico || "",
      createdAt: d.createdAt,
    }));

    const total = items.length;

    // NPS average + buckets (Promoter 9-10, Passive 7-8, Detractor <=6)
    const npsValues = items.map((i) => i.nps).filter((n) => typeof n === "number");
    const npsAvg =
      npsValues.length > 0
        ? npsValues.reduce((a, b) => a + b, 0) / npsValues.length
        : 0;
    const promoters = npsValues.filter((n) => n >= 9).length;
    const passives = npsValues.filter((n) => n >= 7 && n <= 8).length;
    const detractors = npsValues.filter((n) => n <= 6).length;
    const npsScore =
      npsValues.length > 0
        ? Math.round(((promoters - detractors) / npsValues.length) * 100)
        : 0;

    // NPS distribution (1-10)
    const npsDistribution = Array.from({ length: 10 }, (_, i) => ({
      score: i + 1,
      count: npsValues.filter((n) => n === i + 1).length,
    }));

    // Recomienda
    const recomendaria = {
      si: items.filter((i) => i.recomendaria === "si").length,
      talvez: items.filter((i) => i.recomendaria === "talvez").length,
      no: items.filter((i) => i.recomendaria === "no").length,
    };

    // Próximos temas
    const topicCounts: Record<string, number> = {};
    for (const it of items) {
      for (const t of it.proximoTemas) {
        topicCounts[t] = (topicCounts[t] || 0) + 1;
      }
    }
    const proximoTemas = Object.entries(topicCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([id, count]) => ({
        id,
        label: TOPIC_LABELS[id] || id,
        count,
      }));

    // Orígenes políticos (agrupados y normalizados: trim + lowercase para match)
    const origenCounts: Record<string, { label: string; count: number }> = {};
    for (const it of items) {
      const raw = (it.origenPolitico || "").trim();
      if (!raw) continue;
      const normalized = raw.toLowerCase();
      if (!origenCounts[normalized]) {
        origenCounts[normalized] = { label: raw, count: 0 };
      }
      origenCounts[normalized].count++;
    }
    const origenes = Object.values(origenCounts).sort(
      (a, b) => b.count - a.count
    );

    return NextResponse.json({
      items,
      stats: {
        total,
        npsAvg: Math.round(npsAvg * 10) / 10,
        npsScore,
        promoters,
        passives,
        detractors,
        npsDistribution,
        recomendaria,
        proximoTemas,
        origenes,
      },
    });
  } catch (error) {
    console.error("Error GET /api/admin/feedback:", error);
    return NextResponse.json(
      { error: "Error al obtener feedback" },
      { status: 500 }
    );
  }
}
