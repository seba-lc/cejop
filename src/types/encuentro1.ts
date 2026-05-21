export type SpeakerKey = string;

export type Segment = {
  start: number;
  end: number;
  speaker: SpeakerKey;
  text: string;
};

export type Timeline = {
  duration_s: number;
  speaker_colors: Record<SpeakerKey, string>;
  segments: Segment[];
};

export type SpeakerMetrics = {
  speaking_time_s: number;
  turns: number;
  words: number;
  ppm: number;
  pitch_mean_hz: number | null;
  pitch_std_hz: number | null;
  energy_mean: number | null;
};

export type AudioMetrics = {
  duration_seconds: number;
  pending_applause_detection?: boolean;
  pending_laughter_detection?: boolean;
  pending_pitch_analysis?: boolean;
  pending_long_pauses?: boolean;
  claps: { time: number }[];
  laughs: { time: number }[];
  long_pauses: { start: number; end: number }[];
  speakers: Record<SpeakerKey, SpeakerMetrics>;
};

export type KeywordCount = { word: string; count: number };

export type Quote = {
  speaker: SpeakerKey;
  timestamp: number;
  text: string;
  tier: 1 | 2 | 3;
  topic: string;
};

export type Mentions = {
  politicos: Record<string, number>;
  empresas: Record<string, number>;
  instituciones: Record<string, number>;
  municipios: Record<string, number>;
  temas: Record<string, number>;
};

export type TextMetrics = {
  pending_sentiment_ml?: boolean;
  pending_topic_modeling?: boolean;
  sentiment_by_speaker: Record<SpeakerKey, { positive: number; neutral: number; negative: number }>;
  sentiment_timeline: { timestamp: number; sentiment: number }[];
  keywords_by_speaker: Record<SpeakerKey, KeywordCount[]>;
  mentions: Mentions;
  quotes_destacadas: Quote[];
};

export type EncuestasStats = {
  total: number;
  edades: { bucket: string; count: number }[];
  topDirigentesTuc: { name: string; count: number }[];
  topDirigentesNac: { name: string; count: number }[];
  prioridadesRanking: { id: string; label: string; count: number }[];
};

export type FeedbackStats = {
  total: number;
  npsAvg: number;
  npsScore: number;
  promoters: number;
  passives: number;
  detractors: number;
  npsDistribution: { score: number; count: number }[];
  recomendaria: { si: number; talvez: number; no: number };
  proximoTemas: { id: string; label: string; count: number }[];
  origenes: { label: string; count: number }[];
  npsPorOrigen: { label: string; avg: number; n: number }[];
  quotesTeLlevas: { mail: string; text: string }[];
};

export type AudioPeaks = {
  channels: number;
  length: number;
  duration_s: number;
  peaks: number[];
};

export type DashboardData = {
  timeline: Timeline;
  audio: AudioMetrics;
  text: TextMetrics;
  encuestas: EncuestasStats;
  feedback: FeedbackStats;
  audioUrl: string;
  audioPeaks: AudioPeaks | null;
  source: { mongo: "live" | "mock"; analysis: "live" | "mock" };
};

export const INTENDENTES: { key: SpeakerKey; nombre: string; municipio: string; partido: string }[] = [
  { key: "MANSILLA (Aguilares · PJ)", nombre: "Mansilla", municipio: "Aguilares", partido: "PJ" },
  { key: "SERRA (Monteros · PJ)", nombre: "Serra", municipio: "Monteros", partido: "PJ" },
  { key: "MOLINUEVO (Concepción · UCR)", nombre: "Molinuevo", municipio: "Concepción", partido: "UCR" },
  { key: "CHAHLA (SMT · PJ)", nombre: "Chahla", municipio: "San Miguel de Tucumán", partido: "PJ" },
];
