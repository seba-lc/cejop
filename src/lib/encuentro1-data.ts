import { promises as fs } from "fs";
import path from "path";
import { getDb } from "@/lib/mongodb";
import type {
  AudioMetrics,
  DashboardData,
  EncuestasStats,
  FeedbackStats,
  TextMetrics,
  Timeline,
} from "@/types/encuentro1";

const ANALYSIS_DIR = path.join(process.cwd(), "data", "audio-e1", "analysis");

async function readJson<T>(filename: string): Promise<T> {
  const raw = await fs.readFile(path.join(ANALYSIS_DIR, filename), "utf-8");
  return JSON.parse(raw) as T;
}

const PRIORIDAD_LABELS: Record<string, string> = {
  salud: "Salud pública",
  educacion: "Educación",
  seguridad: "Seguridad",
  medioambiente: "Medio ambiente",
  economia: "Desarrollo económico",
  tecnologia: "Tecnología",
  cultura: "Cultura",
  participacion: "Participación ciudadana",
  ddhh: "Derechos humanos",
  inclusion: "Inclusión social",
  vulnerabilidad: "Sectores vulnerables",
  corrupcion: "Transparencia",
  empleo: "Empleo joven",
  infraestructura: "Infraestructura",
  vivienda: "Vivienda digna",
  justicia: "Justicia",
};

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

function normalizeName(raw: string | undefined | null): string {
  if (!raw) return "";
  const trimmed = raw.trim().replace(/\s+/g, " ");
  return trimmed
    .toLowerCase()
    .split(" ")
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function normalizeOrigen(raw: string | undefined | null): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  const low = trimmed.toLowerCase();
  if (
    low === "lla" ||
    low.includes("libertad avanza") ||
    low.includes("juventud lla") ||
    low.includes("juventudes lla")
  ) {
    return "LLA";
  }
  return trimmed
    .toLowerCase()
    .split(" ")
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function ageBucket(edad: unknown): string | null {
  const n = typeof edad === "number" ? edad : parseInt(String(edad), 10);
  if (!Number.isFinite(n)) return null;
  if (n >= 18 && n <= 22) return "18-22";
  if (n >= 23 && n <= 26) return "23-26";
  if (n >= 27 && n <= 30) return "27-30";
  if (n > 30) return "30+";
  return null;
}

function topN<T>(
  arr: T[],
  n: number,
  selector: (t: T) => string
): { name: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const item of arr) {
    const key = selector(item);
    if (!key) continue;
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .map(([name, count]) => ({ name, count }));
}

const EMPTY_ENCUESTAS: EncuestasStats = {
  total: 0,
  edades: [],
  topDirigentesTuc: [],
  topDirigentesNac: [],
  prioridadesRanking: [],
};

const EMPTY_FEEDBACK: FeedbackStats = {
  total: 0,
  npsAvg: 0,
  npsScore: 0,
  promoters: 0,
  passives: 0,
  detractors: 0,
  npsDistribution: Array.from({ length: 10 }, (_, i) => ({
    score: i + 1,
    count: 0,
  })),
  recomendaria: { si: 0, talvez: 0, no: 0 },
  proximoTemas: [],
  origenes: [],
  npsPorOrigen: [],
  quotesTeLlevas: [],
};

type EncuestaDoc = {
  personal?: { edad?: number; mail?: string };
  dirigentes?: {
    tucGustar?: { nombre?: string };
    argGustar?: { nombre?: string };
  };
  prioridades?: string[];
};

type FeedbackDoc = {
  mail?: string;
  nps?: number;
  teLlevas?: string;
  proximoTemas?: string[];
  recomendaria?: "si" | "talvez" | "no";
  origenPolitico?: string;
  encuentro?: string;
};

async function loadEncuestasStats(): Promise<EncuestasStats> {
  try {
    const db = await getDb();
    const docs = await db
      .collection<EncuestaDoc>("encuestas")
      .find({})
      .toArray();

    if (docs.length === 0) return EMPTY_ENCUESTAS;

    // Ages
    const ageBuckets = ["18-22", "23-26", "27-30", "30+"] as const;
    const ageCounts: Record<string, number> = Object.fromEntries(
      ageBuckets.map((b) => [b, 0])
    );
    for (const d of docs) {
      const b = ageBucket(d.personal?.edad);
      if (b) ageCounts[b]++;
    }
    const edades = ageBuckets.map((b) => ({ bucket: b, count: ageCounts[b] }));

    // Top dirigentes (gusta)
    const topDirigentesTuc = topN(docs, 10, (d) =>
      normalizeName(d.dirigentes?.tucGustar?.nombre)
    );
    const topDirigentesNac = topN(docs, 10, (d) =>
      normalizeName(d.dirigentes?.argGustar?.nombre)
    );

    // Prioridades (16 total)
    const prioridadesCounts: Record<string, number> = {};
    for (const d of docs) {
      if (Array.isArray(d.prioridades)) {
        for (const p of d.prioridades) {
          prioridadesCounts[p] = (prioridadesCounts[p] || 0) + 1;
        }
      }
    }
    const prioridadesRanking = Object.entries(prioridadesCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([id, count]) => ({
        id,
        label: PRIORIDAD_LABELS[id] || id,
        count,
      }));

    return {
      total: docs.length,
      edades,
      topDirigentesTuc,
      topDirigentesNac,
      prioridadesRanking,
    };
  } catch (error) {
    console.error("loadEncuestasStats error:", error);
    return EMPTY_ENCUESTAS;
  }
}

async function loadFeedbackStats(): Promise<FeedbackStats> {
  try {
    const db = await getDb();
    const docs = await db
      .collection<FeedbackDoc>("feedback_encuentro_1")
      .find({ $or: [{ encuentro: "e1" }, { encuentro: { $exists: false } }] })
      .toArray();

    if (docs.length === 0) return EMPTY_FEEDBACK;

    const total = docs.length;
    const npsValues = docs
      .map((d) => d.nps)
      .filter((n): n is number => typeof n === "number");
    const npsAvg =
      npsValues.length > 0
        ? Math.round(
            (npsValues.reduce((a, b) => a + b, 0) / npsValues.length) * 100
          ) / 100
        : 0;
    const promoters = npsValues.filter((n) => n >= 9).length;
    const passives = npsValues.filter((n) => n >= 7 && n <= 8).length;
    const detractors = npsValues.filter((n) => n <= 6).length;
    const npsScore =
      npsValues.length > 0
        ? Math.round(((promoters - detractors) / npsValues.length) * 100)
        : 0;

    const npsDistribution = Array.from({ length: 10 }, (_, i) => ({
      score: i + 1,
      count: npsValues.filter((n) => n === i + 1).length,
    }));

    const recomendaria = {
      si: docs.filter((d) => d.recomendaria === "si").length,
      talvez: docs.filter((d) => d.recomendaria === "talvez").length,
      no: docs.filter((d) => d.recomendaria === "no").length,
    };

    // Próximos temas
    const topicCounts: Record<string, number> = {};
    for (const d of docs) {
      if (Array.isArray(d.proximoTemas)) {
        for (const t of d.proximoTemas) {
          topicCounts[t] = (topicCounts[t] || 0) + 1;
        }
      }
    }
    const proximoTemas = Object.entries(topicCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([id, count]) => ({
        id,
        label: TOPIC_LABELS[id] || id,
        count,
      }));

    // Orígenes (con normalización LLA)
    const origenAggregates: Record<
      string,
      { count: number; npsSum: number; npsN: number }
    > = {};
    for (const d of docs) {
      const o = normalizeOrigen(d.origenPolitico);
      if (!o) continue;
      if (!origenAggregates[o]) {
        origenAggregates[o] = { count: 0, npsSum: 0, npsN: 0 };
      }
      origenAggregates[o].count++;
      if (typeof d.nps === "number") {
        origenAggregates[o].npsSum += d.nps;
        origenAggregates[o].npsN++;
      }
    }
    const origenes = Object.entries(origenAggregates)
      .sort(([, a], [, b]) => b.count - a.count)
      .map(([label, agg]) => ({ label, count: agg.count }));
    const npsPorOrigen = Object.entries(origenAggregates)
      .filter(([, agg]) => agg.npsN > 0)
      .sort(([, a], [, b]) => b.count - a.count)
      .map(([label, agg]) => ({
        label,
        avg: Math.round((agg.npsSum / agg.npsN) * 100) / 100,
        n: agg.npsN,
      }));

    // Quotes "te llevas" (anonimizar mail)
    const quotesTeLlevas = docs
      .filter((d) => d.teLlevas && d.teLlevas.trim().length > 5)
      .slice(0, 12)
      .map((d) => {
        const mail = d.mail || "";
        const masked = mail
          ? mail.slice(0, 3) + "***@" + (mail.split("@")[1] || "")
          : "anónimo";
        return { mail: masked, text: d.teLlevas!.trim() };
      });

    return {
      total,
      npsAvg,
      npsScore,
      promoters,
      passives,
      detractors,
      npsDistribution,
      recomendaria,
      proximoTemas,
      origenes,
      npsPorOrigen,
      quotesTeLlevas,
    };
  } catch (error) {
    console.error("loadFeedbackStats error:", error);
    return EMPTY_FEEDBACK;
  }
}

export async function loadDashboardData(): Promise<DashboardData> {
  const [timeline, audio, text, encuestas, feedback] = await Promise.all([
    readJson<Timeline>("timeline.json"),
    readJson<AudioMetrics>("audio-metrics.json"),
    readJson<TextMetrics>("text-metrics.json"),
    loadEncuestasStats(),
    loadFeedbackStats(),
  ]);

  const audioUrl = process.env.NEXT_PUBLIC_AUDIO_E1_URL || "/audio/e1.mp3";
  const mongoStatus: "live" | "mock" =
    encuestas.total > 0 || feedback.total > 0 ? "live" : "mock";

  return {
    timeline,
    audio,
    text,
    encuestas,
    feedback,
    audioUrl,
    source: { mongo: mongoStatus, analysis: "live" },
  };
}
