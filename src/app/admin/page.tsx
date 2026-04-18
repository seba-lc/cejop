"use client";

import { useState, useEffect, useCallback, useMemo, Fragment } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Download,
  ChevronDown,
  ChevronUp,
  LogOut,
  Users,
  BarChart3,
  MapPin,
  TrendingUp,
  UserCheck,
  MessageSquare,
  ClipboardList,
  CalendarDays,
  CheckCircle2,
  Mail,
  AlertCircle,
  Send,
  UserPlus,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";

/* ── Constants ── */

const PRIORITY_LABELS: Record<string, string> = {
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

const CHART_BLUE = "#2C46BF";
const CHART_BLUE_LIGHT = "#4A6AE5";
const PIE_COLORS = [
  "#2C46BF",
  "#4A6AE5",
  "#7B93F0",
  "#1A1A2E",
  "#3D3D5C",
  "#6B7280",
  "#9CA3AF",
  "#D1D5DB",
];

const TABS = [
  { id: "panel", label: "Panel", icon: BarChart3 },
  { id: "confirmados", label: "Confirmados", icon: CheckCircle2 },
  { id: "acreditados", label: "Acreditados", icon: UserPlus },
  { id: "emails", label: "Emails", icon: Mail },
  { id: "prioridades", label: "Prioridades", icon: ClipboardList },
  { id: "dirigentes", label: "Dirigentes", icon: UserCheck },
  { id: "demografia", label: "Demografía", icon: MapPin },
  { id: "respuestas", label: "Respuestas", icon: MessageSquare },
] as const;

type TabId = (typeof TABS)[number]["id"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Encuesta = any;

type Stats = {
  totalRespuestas: number;
  topPrioridades: { id: string; count: number }[];
  localidades: { name: string; count: number }[];
};

/* ── Helpers ── */

function countField(
  encuestas: Encuesta[],
  path: string
): { name: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const enc of encuestas) {
    const keys = path.split(".");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let val: any = enc;
    for (const k of keys) val = val?.[k];
    const name = String(val || "").trim();
    if (name) {
      const normalized = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
      counts[normalized] = (counts[normalized] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .map(([name, count]) => ({ name, count }));
}

function buildTimeline(encuestas: Encuesta[]) {
  const byDate: Record<string, number> = {};
  for (const enc of encuestas) {
    if (enc.createdAt) {
      const date = new Date(enc.createdAt).toLocaleDateString("es-AR");
      byDate[date] = (byDate[date] || 0) + 1;
    }
  }
  return Object.entries(byDate)
    .map(([date, count]) => ({ date, count }))
    .reverse();
}

function buildAgeGroups(encuestas: Encuesta[]) {
  const groups: Record<string, number> = {
    "18-20": 0,
    "21-23": 0,
    "24-26": 0,
    "27-30": 0,
    "30+": 0,
  };
  for (const enc of encuestas) {
    const edad = Number(enc.personal?.edad);
    if (!edad) continue;
    if (edad <= 20) groups["18-20"]++;
    else if (edad <= 23) groups["21-23"]++;
    else if (edad <= 26) groups["24-26"]++;
    else if (edad <= 30) groups["27-30"]++;
    else groups["30+"]++;
  }
  return Object.entries(groups).map(([range, count]) => ({ range, count }));
}

/* ── Main Component ── */

export default function AdminDashboard() {
  const router = useRouter();
  const [encuestas, setEncuestas] = useState<Encuesta[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filteredCount, setFilteredCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [encuestasHabilitadas, setEncuestasHabilitadas] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("panel");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [localidad, setLocalidad] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const fetchEncuestas = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (localidad) params.set("localidad", localidad);
    if (desde) params.set("desde", desde);
    if (hasta) params.set("hasta", hasta);

    const res = await fetch(`/api/admin/encuestas?${params}`);
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const data = await res.json();
    setEncuestas(data.encuestas || []);
    setStats(data.stats || null);
    setFilteredCount(data.filteredCount || 0);
  }, [search, localidad, desde, hasta, router]);

  const fetchSettings = useCallback(async () => {
    const res = await fetch("/api/admin/settings");
    if (res.ok) {
      const data = await res.json();
      setEncuestasHabilitadas(data.encuestasHabilitadas);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchEncuestas(), fetchSettings()]).finally(() =>
      setLoading(false)
    );
  }, [fetchEncuestas, fetchSettings]);

  // Derived data
  const timeline = useMemo(() => buildTimeline(encuestas), [encuestas]);
  const ageGroups = useMemo(() => buildAgeGroups(encuestas), [encuestas]);

  const allPriorities = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const enc of encuestas) {
      if (Array.isArray(enc.prioridades)) {
        for (const p of enc.prioridades) {
          counts[p] = (counts[p] || 0) + 1;
        }
      }
    }
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([id, count]) => ({
        name: PRIORITY_LABELS[id] || id,
        count,
      }));
  }, [encuestas]);

  const dirigentesData = useMemo(() => {
    return {
      tucAdmira: countField(encuestas, "dirigentes.tucGustar.nombre").slice(0, 10),
      argAdmira: countField(encuestas, "dirigentes.argGustar.nombre").slice(0, 10),
      tucCuestiona: countField(encuestas, "dirigentes.tucDisgustar.nombre").slice(0, 10),
      argCuestiona: countField(encuestas, "dirigentes.argDisgustar.nombre").slice(0, 10),
    };
  }, [encuestas]);

  async function toggleEncuestas() {
    setToggling(true);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ encuestasHabilitadas: !encuestasHabilitadas }),
    });
    if (res.ok) setEncuestasHabilitadas(!encuestasHabilitadas);
    setToggling(false);
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  function exportCSV() {
    const headers = [
      "Nombre", "Email", "Teléfono", "Edad", "Localidad",
      "Prioridad 1", "Prioridad 2", "Prioridad 3",
      "Dirigente TUC (admira)", "Por qué",
      "Dirigente ARG (admira)", "Por qué",
      "Dirigente TUC (cuestiona)", "Por qué",
      "Dirigente ARG (cuestiona)", "Por qué",
      "Otra preocupación", "Fecha",
    ];

    const rows = encuestas.map((e: Encuesta) => [
      e.personal?.nombre || "", e.personal?.mail || "",
      e.personal?.telefono || "", e.personal?.edad || "",
      e.personal?.localidad || "",
      PRIORITY_LABELS[e.prioridades?.[0]] || e.prioridades?.[0] || "",
      PRIORITY_LABELS[e.prioridades?.[1]] || e.prioridades?.[1] || "",
      PRIORITY_LABELS[e.prioridades?.[2]] || e.prioridades?.[2] || "",
      e.dirigentes?.tucGustar?.nombre || "", e.dirigentes?.tucGustar?.porque || "",
      e.dirigentes?.argGustar?.nombre || "", e.dirigentes?.argGustar?.porque || "",
      e.dirigentes?.tucDisgustar?.nombre || "", e.dirigentes?.tucDisgustar?.porque || "",
      e.dirigentes?.argDisgustar?.nombre || "", e.dirigentes?.argDisgustar?.porque || "",
      e.otraPreocupacion || "",
      e.createdAt ? new Date(e.createdAt).toLocaleDateString("es-AR") : "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((cell: string) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `encuestas-cejop-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1129] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-cejop-blue border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 font-source text-sm">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1129]">
      {/* Header */}
      <header className="bg-[#141636] border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cejop-blue flex items-center justify-center">
              <span className="font-montserrat font-bold text-white text-sm">C</span>
            </div>
            <div>
              <h1 className="font-montserrat text-lg font-bold text-white">
                CEJOP Tucumán
              </h1>
              <p className="text-xs text-gray-400">Panel de administración</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <LogOut size={16} />
            Salir
          </button>
        </div>
      </header>

      {/* Tabs */}
      <nav className="bg-[#141636] border-b border-white/10 px-6 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? "border-cejop-blue text-white"
                    : "border-transparent text-gray-400 hover:text-gray-200"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === "panel" && (
          <TabPanel
            stats={stats}
            encuestasHabilitadas={encuestasHabilitadas}
            toggling={toggling}
            toggleEncuestas={toggleEncuestas}
            timeline={timeline}
            encuestas={encuestas}
          />
        )}
        {activeTab === "confirmados" && <TabConfirmados />}
        {activeTab === "acreditados" && <TabAsistentes />}
        {activeTab === "emails" && <TabEmailsLog />}
        {activeTab === "prioridades" && (
          <TabPrioridades
            allPriorities={allPriorities}
            encuestas={encuestas}
          />
        )}
        {activeTab === "dirigentes" && (
          <TabDirigentes data={dirigentesData} />
        )}
        {activeTab === "demografia" && (
          <TabDemografia
            ageGroups={ageGroups}
            localidades={stats?.localidades || []}
          />
        )}
        {activeTab === "respuestas" && (
          <TabRespuestas
            encuestas={encuestas}
            filteredCount={filteredCount}
            totalRespuestas={stats?.totalRespuestas || 0}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            search={search}
            setSearch={setSearch}
            localidad={localidad}
            setLocalidad={setLocalidad}
            desde={desde}
            setDesde={setDesde}
            hasta={hasta}
            setHasta={setHasta}
            exportCSV={exportCSV}
          />
        )}
      </div>
    </div>
  );
}

/* ── Card Component ── */

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-[#1a1d3d] border border-white/10 rounded-2xl p-6 ${className}`}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-montserrat text-xl font-bold text-white mb-6">
      {children}
    </h2>
  );
}

/* ── Tab: Panel ── */

function TabPanel({
  stats,
  encuestasHabilitadas,
  toggling,
  toggleEncuestas,
  timeline,
  encuestas,
}: {
  stats: Stats | null;
  encuestasHabilitadas: boolean;
  toggling: boolean;
  toggleEncuestas: () => void;
  timeline: { date: string; count: number }[];
  encuestas: Encuesta[];
}) {
  const lastWeekCount = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return encuestas.filter(
      (e) => e.createdAt && new Date(e.createdAt) >= weekAgo
    ).length;
  }, [encuestas]);

  return (
    <div className="space-y-6">
      {/* Toggle + stats row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Toggle */}
        <Card className="lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400 font-medium">Encuestas</span>
            <button
              onClick={toggleEncuestas}
              disabled={toggling}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                encuestasHabilitadas ? "bg-green-500" : "bg-gray-600"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  encuestasHabilitadas ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          <p className="text-2xl font-bold text-white font-montserrat">
            {encuestasHabilitadas ? "Activas" : "Pausadas"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {encuestasHabilitadas
              ? "Aceptando respuestas"
              : "No se aceptan respuestas"}
          </p>
        </Card>

        {/* Total */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Users size={16} className="text-cejop-blue" />
            <span className="text-sm text-gray-400 font-medium">
              Total respuestas
            </span>
          </div>
          <p className="text-3xl font-bold text-white font-montserrat">
            {stats?.totalRespuestas || 0}
          </p>
        </Card>

        {/* This week */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-green-400" />
            <span className="text-sm text-gray-400 font-medium">
              Últimos 7 días
            </span>
          </div>
          <p className="text-3xl font-bold text-white font-montserrat">
            {lastWeekCount}
          </p>
        </Card>

        {/* Top priority */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={16} className="text-yellow-400" />
            <span className="text-sm text-gray-400 font-medium">
              Prioridad #1
            </span>
          </div>
          <p className="text-xl font-bold text-white font-montserrat">
            {stats?.topPrioridades?.[0]
              ? PRIORITY_LABELS[stats.topPrioridades[0].id] || stats.topPrioridades[0].id
              : "—"}
          </p>
          {stats?.topPrioridades?.[0] && (
            <p className="text-xs text-gray-500 mt-1">
              {stats.topPrioridades[0].count} menciones
            </p>
          )}
        </Card>
      </div>

      {/* Timeline chart */}
      {timeline.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays size={16} className="text-cejop-blue" />
            <h3 className="font-montserrat font-semibold text-white">
              Respuestas por día
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline}>
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_BLUE} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={CHART_BLUE} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  axisLine={{ stroke: "#ffffff10" }}
                />
                <YAxis
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  axisLine={{ stroke: "#ffffff10" }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#1a1d3d",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "white",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={CHART_BLUE}
                  fill="url(#blueGrad)"
                  strokeWidth={2}
                  name="Respuestas"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Quick top 5 prioridades + localidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-montserrat font-semibold text-white mb-4">
            Top 5 prioridades
          </h3>
          <div className="space-y-3">
            {stats?.topPrioridades?.slice(0, 5).map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-cejop-blue w-5">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-300">
                      {PRIORITY_LABELS[p.id] || p.id}
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {p.count}
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cejop-blue rounded-full transition-all"
                      style={{
                        width: `${
                          (p.count / (stats?.totalRespuestas || 1)) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-montserrat font-semibold text-white mb-4">
            Distribución por localidad
          </h3>
          <div className="space-y-3">
            {stats?.localidades?.slice(0, 5).map((l, i) => (
              <div key={l.name} className="flex items-center gap-3">
                <span className="text-xs font-bold text-cejop-blue w-5">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-300">{l.name}</span>
                    <span className="text-sm font-semibold text-white">
                      {l.count}
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cejop-blue rounded-full transition-all"
                      style={{
                        width: `${
                          (l.count / (stats?.totalRespuestas || 1)) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ── Tab: Prioridades ── */

function TabPrioridades({
  allPriorities,
  encuestas,
}: {
  allPriorities: { name: string; count: number }[];
  encuestas: Encuesta[];
}) {
  const profundidadByTopic = useMemo(() => {
    const byTopic: Record<string, string[]> = {};
    for (const enc of encuestas) {
      if (enc.profundidad) {
        for (const [topic, answer] of Object.entries(enc.profundidad)) {
          if (answer) {
            if (!byTopic[topic]) byTopic[topic] = [];
            byTopic[topic].push(answer as string);
          }
        }
      }
    }
    return byTopic;
  }, [encuestas]);

  const [openTopic, setOpenTopic] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <SectionTitle>Prioridades seleccionadas</SectionTitle>

      <Card>
        <div className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={allPriorities} layout="vertical" margin={{ left: 140 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis
                type="number"
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                axisLine={{ stroke: "#ffffff10" }}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "#D1D5DB", fontSize: 13 }}
                axisLine={{ stroke: "#ffffff10" }}
                width={140}
              />
              <Tooltip
                contentStyle={{
                  background: "#1a1d3d",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "white",
                }}
              />
              <Bar
                dataKey="count"
                fill={CHART_BLUE}
                radius={[0, 6, 6, 0]}
                name="Menciones"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Depth responses */}
      {Object.keys(profundidadByTopic).length > 0 && (
        <div>
          <h3 className="font-montserrat font-semibold text-white mb-4">
            Respuestas de profundidad
          </h3>
          <div className="space-y-2">
            {Object.entries(profundidadByTopic).map(([topic, answers]) => (
              <Card key={topic} className="!p-0 overflow-hidden">
                <button
                  onClick={() =>
                    setOpenTopic(openTopic === topic ? null : topic)
                  }
                  className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-white">
                      {PRIORITY_LABELS[topic] || topic}
                    </span>
                    <span className="text-xs bg-cejop-blue/20 text-cejop-blue px-2 py-0.5 rounded-full">
                      {answers.length} respuesta{answers.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {openTopic === topic ? (
                    <ChevronUp size={16} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-400" />
                  )}
                </button>
                {openTopic === topic && (
                  <div className="border-t border-white/10 p-4 space-y-3">
                    {answers.map((answer, i) => (
                      <p
                        key={i}
                        className="text-sm text-gray-300 pl-4 border-l-2 border-cejop-blue/30"
                      >
                        {answer}
                      </p>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Tab: Dirigentes ── */

function TabDirigentes({
  data,
}: {
  data: {
    tucAdmira: { name: string; count: number }[];
    argAdmira: { name: string; count: number }[];
    tucCuestiona: { name: string; count: number }[];
    argCuestiona: { name: string; count: number }[];
  };
}) {
  return (
    <div className="space-y-6">
      <SectionTitle>Dirigentes mencionados</SectionTitle>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DirigenteChart
          title="Tucumán — Admiran"
          data={data.tucAdmira}
          color="#22C55E"
        />
        <DirigenteChart
          title="Argentina — Admiran"
          data={data.argAdmira}
          color="#22C55E"
        />
        <DirigenteChart
          title="Tucumán — Cuestionan"
          data={data.tucCuestiona}
          color="#EF4444"
        />
        <DirigenteChart
          title="Argentina — Cuestionan"
          data={data.argCuestiona}
          color="#EF4444"
        />
      </div>
    </div>
  );
}

function DirigenteChart({
  title,
  data,
  color,
}: {
  title: string;
  data: { name: string; count: number }[];
  color: string;
}) {
  if (data.length === 0) {
    return (
      <Card>
        <h3 className="font-montserrat font-semibold text-white mb-4">
          {title}
        </h3>
        <p className="text-gray-500 text-sm">Sin datos</p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="font-montserrat font-semibold text-white mb-4">
        {title}
      </h3>
      <div className="space-y-2.5">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-500 w-5">
              {i + 1}
            </span>
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-300">{d.name}</span>
                <span className="text-sm font-semibold text-white">
                  {d.count}
                </span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(d.count / data[0].count) * 100}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ── Tab: Demografía ── */

function TabDemografia({
  ageGroups,
  localidades,
}: {
  ageGroups: { range: string; count: number }[];
  localidades: { name: string; count: number }[];
}) {
  return (
    <div className="space-y-6">
      <SectionTitle>Demografía</SectionTitle>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Age chart */}
        <Card>
          <h3 className="font-montserrat font-semibold text-white mb-4">
            Distribución por edad
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageGroups}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis
                  dataKey="range"
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  axisLine={{ stroke: "#ffffff10" }}
                />
                <YAxis
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  axisLine={{ stroke: "#ffffff10" }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#1a1d3d",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "white",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill={CHART_BLUE_LIGHT}
                  radius={[6, 6, 0, 0]}
                  name="Personas"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Locality pie */}
        <Card>
          <h3 className="font-montserrat font-semibold text-white mb-4">
            Localidades
          </h3>
          {localidades.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="h-56 w-56 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={localidades.slice(0, 8)}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      stroke="none"
                    >
                      {localidades.slice(0, 8).map((_, i) => (
                        <Cell
                          key={i}
                          fill={PIE_COLORS[i % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#1a1d3d",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        color: "white",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 flex-1">
                {localidades.slice(0, 8).map((l, i) => (
                  <div key={l.name} className="flex items-center gap-2 text-sm">
                    <div
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{
                        backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                      }}
                    />
                    <span className="text-gray-300 truncate">{l.name}</span>
                    <span className="text-white font-semibold ml-auto">
                      {l.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Sin datos</p>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ── Tab: Respuestas ── */

function TabRespuestas({
  encuestas,
  filteredCount,
  totalRespuestas,
  expandedId,
  setExpandedId,
  search,
  setSearch,
  localidad,
  setLocalidad,
  desde,
  setDesde,
  hasta,
  setHasta,
  exportCSV,
}: {
  encuestas: Encuesta[];
  filteredCount: number;
  totalRespuestas: number;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  search: string;
  setSearch: (v: string) => void;
  localidad: string;
  setLocalidad: (v: string) => void;
  desde: string;
  setDesde: (v: string) => void;
  hasta: string;
  setHasta: (v: string) => void;
  exportCSV: () => void;
}) {
  return (
    <div className="space-y-6">
      <SectionTitle>Respuestas individuales</SectionTitle>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2 relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cejop-blue transition-colors"
            />
          </div>
          <input
            type="text"
            placeholder="Localidad..."
            value={localidad}
            onChange={(e) => setLocalidad(e.target.value)}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cejop-blue transition-colors"
          />
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-cejop-blue transition-colors"
          />
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-cejop-blue transition-colors"
          />
        </div>
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-400">
            {filteredCount} resultado{filteredCount !== 1 ? "s" : ""}
            {filteredCount !== totalRespuestas
              ? ` de ${totalRespuestas}`
              : ""}
          </p>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-cejop-blue text-white text-sm font-medium rounded-lg hover:bg-cejop-blue/90 transition-colors"
          >
            <Download size={16} />
            Exportar CSV
          </button>
        </div>
      </Card>

      {/* Table */}
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-3 font-semibold text-gray-400 text-xs uppercase tracking-wider">
                  Nombre
                </th>
                <th className="text-left px-6 py-3 font-semibold text-gray-400 text-xs uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left px-6 py-3 font-semibold text-gray-400 text-xs uppercase tracking-wider hidden md:table-cell">
                  Localidad
                </th>
                <th className="text-left px-6 py-3 font-semibold text-gray-400 text-xs uppercase tracking-wider hidden md:table-cell">
                  Edad
                </th>
                <th className="text-left px-6 py-3 font-semibold text-gray-400 text-xs uppercase tracking-wider hidden lg:table-cell">
                  Fecha
                </th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {encuestas.map((enc: Encuesta) => (
                <EncuestaRow
                  key={enc._id}
                  enc={enc}
                  isExpanded={expandedId === enc._id}
                  onToggle={() =>
                    setExpandedId(expandedId === enc._id ? null : enc._id)
                  }
                />
              ))}
              {encuestas.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-gray-500"
                  >
                    No hay encuestas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ── Table rows ── */

function EncuestaRow({
  enc,
  isExpanded,
  onToggle,
}: {
  enc: Encuesta;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
        onClick={onToggle}
      >
        <td className="px-6 py-4 font-medium text-white">
          {enc.personal?.nombre}
        </td>
        <td className="px-6 py-4 text-gray-400">{enc.personal?.mail}</td>
        <td className="px-6 py-4 text-gray-400 hidden md:table-cell">
          {enc.personal?.localidad}
        </td>
        <td className="px-6 py-4 text-gray-400 hidden md:table-cell">
          {enc.personal?.edad}
        </td>
        <td className="px-6 py-4 text-gray-400 hidden lg:table-cell">
          {enc.createdAt
            ? new Date(enc.createdAt).toLocaleDateString("es-AR")
            : "-"}
        </td>
        <td className="px-4 py-4">
          {isExpanded ? (
            <ChevronUp size={16} className="text-gray-500" />
          ) : (
            <ChevronDown size={16} className="text-gray-500" />
          )}
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-white/[0.02]">
          <td colSpan={6} className="px-6 py-6">
            <EncuestaDetail enc={enc} />
          </td>
        </tr>
      )}
    </>
  );
}

function EncuestaDetail({ enc }: { enc: Encuesta }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
      <div>
        <h4 className="font-montserrat font-semibold text-white mb-3">
          Datos personales
        </h4>
        <dl className="space-y-1.5">
          <DetailRow label="Teléfono" value={enc.personal?.telefono} />
          <DetailRow label="Edad" value={enc.personal?.edad} />
          <DetailRow label="Localidad" value={enc.personal?.localidad} />
        </dl>
      </div>

      <div>
        <h4 className="font-montserrat font-semibold text-white mb-3">
          Prioridades
        </h4>
        <ol className="list-decimal list-inside space-y-1">
          {enc.prioridades?.map((p: string, i: number) => (
            <li key={i} className="text-gray-300">
              {PRIORITY_LABELS[p] || p}
            </li>
          ))}
        </ol>
        {enc.profundidad &&
          Object.keys(enc.profundidad).length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="font-medium text-gray-400">Profundidad:</p>
              {Object.entries(enc.profundidad).map(([topic, answer]) => (
                <div key={topic}>
                  <p className="text-xs text-gray-500">
                    {PRIORITY_LABELS[topic] || topic}
                  </p>
                  <p className="text-gray-300">{answer as string}</p>
                </div>
              ))}
            </div>
          )}
      </div>

      <div>
        <h4 className="font-montserrat font-semibold text-white mb-3">
          Dirigentes
        </h4>
        <div className="space-y-3">
          <DirigenteItem label="Tucumán (admira)" data={enc.dirigentes?.tucGustar} />
          <DirigenteItem label="Argentina (admira)" data={enc.dirigentes?.argGustar} />
          <DirigenteItem label="Tucumán (cuestiona)" data={enc.dirigentes?.tucDisgustar} />
          <DirigenteItem label="Argentina (cuestiona)" data={enc.dirigentes?.argDisgustar} />
        </div>
      </div>

      {enc.otraPreocupacion && (
        <div>
          <h4 className="font-montserrat font-semibold text-white mb-3">
            Otra preocupación
          </h4>
          <p className="text-gray-300">{enc.otraPreocupacion}</p>
        </div>
      )}
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | number | undefined;
}) {
  if (!value) return null;
  return (
    <div className="flex gap-2">
      <dt className="text-gray-500 min-w-[80px]">{label}:</dt>
      <dd className="text-gray-300">{value}</dd>
    </div>
  );
}

function DirigenteItem({
  label,
  data,
}: {
  label: string;
  data: { nombre?: string; porque?: string } | undefined;
}) {
  if (!data?.nombre) return null;
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-gray-300">
        {data.nombre}
        {data.porque && (
          <span className="text-gray-500"> — {data.porque}</span>
        )}
      </p>
    </div>
  );
}

/* ── Tab: Confirmados ── */

type ConfirmacionItem = {
  id: string;
  mail: string;
  nombre: string;
  telefono: string;
  edad: number | null;
  localidad: string;
  createdAt: string | null;
  confirmado: boolean;
  confirmadoAt: string | null;
};

type ConfirmacionFilter = "all" | "confirmed" | "unconfirmed";

function TabConfirmados() {
  const [items, setItems] = useState<ConfirmacionItem[]>([]);
  const [totalInscriptos, setTotalInscriptos] = useState(0);
  const [totalConfirmados, setTotalConfirmados] = useState(0);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ConfirmacionFilter>("all");
  const [loading, setLoading] = useState(true);
  const [updatingMail, setUpdatingMail] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filter !== "all") params.set("filter", filter);

    const res = await fetch(`/api/admin/confirmaciones?${params}`);
    if (!res.ok) return;
    const data = await res.json();
    setItems(data.items || []);
    setTotalInscriptos(data.stats?.totalInscriptos || 0);
    setTotalConfirmados(data.stats?.totalConfirmados || 0);
  }, [search, filter]);

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  async function toggleConfirmacion(mail: string, next: boolean) {
    setUpdatingMail(mail);
    // Optimistic update
    setItems((prev) =>
      prev.map((it) =>
        it.mail === mail ? { ...it, confirmado: next } : it
      )
    );
    setTotalConfirmados((prev) => prev + (next ? 1 : -1));

    const res = await fetch("/api/admin/confirmaciones", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mail, confirmado: next }),
    });

    if (!res.ok) {
      // Revert
      setItems((prev) =>
        prev.map((it) =>
          it.mail === mail ? { ...it, confirmado: !next } : it
        )
      );
      setTotalConfirmados((prev) => prev - (next ? 1 : -1));
    }
    setUpdatingMail(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-cejop-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const disponibles = totalInscriptos - totalConfirmados;

  return (
    <div className="space-y-6">
      <SectionTitle>Confirmados — Primer encuentro</SectionTitle>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Users size={16} className="text-cejop-blue" />
            <span className="text-sm text-gray-400 font-medium">
              Inscriptos
            </span>
          </div>
          <p className="text-3xl font-bold text-white font-montserrat">
            {totalInscriptos}
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={16} className="text-green-400" />
            <span className="text-sm text-gray-400 font-medium">
              Confirmados
            </span>
          </div>
          <p className="text-3xl font-bold text-white font-montserrat">
            {totalConfirmados}
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList size={16} className="text-yellow-400" />
            <span className="text-sm text-gray-400 font-medium">
              Sin confirmar
            </span>
          </div>
          <p className="text-3xl font-bold text-white font-montserrat">
            {disponibles}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-center">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              placeholder="Buscar por nombre, email o localidad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cejop-blue transition-colors"
            />
          </div>
          <div className="flex gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
            {(
              [
                { id: "all", label: "Todos" },
                { id: "confirmed", label: "Confirmados" },
                { id: "unconfirmed", label: "Sin confirmar" },
              ] as { id: ConfirmacionFilter; label: string }[]
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  filter === f.id
                    ? "bg-cejop-blue text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* List */}
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-4 sm:px-6 py-3 font-semibold text-gray-400 text-xs uppercase tracking-wider">
                  Nombre
                </th>
                <th className="text-left px-6 py-3 font-semibold text-gray-400 text-xs uppercase tracking-wider hidden md:table-cell">
                  Email
                </th>
                <th className="text-left px-6 py-3 font-semibold text-gray-400 text-xs uppercase tracking-wider hidden md:table-cell">
                  Localidad
                </th>
                <th className="text-left px-6 py-3 font-semibold text-gray-400 text-xs uppercase tracking-wider hidden md:table-cell">
                  Teléfono
                </th>
                <th className="text-right px-4 sm:px-6 py-3 font-semibold text-gray-400 text-xs uppercase tracking-wider">
                  <span className="hidden sm:inline">Confirmado</span>
                  <span className="sm:hidden">OK</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr
                  key={it.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-white">
                    <div>{it.nombre || "—"}</div>
                    {/* Subtitle solo mobile con email + localidad */}
                    <div className="md:hidden text-xs text-gray-500 font-normal mt-0.5 truncate">
                      {it.mail}
                    </div>
                    {it.localidad && (
                      <div className="md:hidden text-[11px] text-gray-500 font-normal mt-0.5">
                        {it.localidad}
                        {it.telefono && ` · ${it.telefono}`}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-400 hidden md:table-cell">
                    {it.mail}
                  </td>
                  <td className="px-6 py-4 text-gray-400 hidden md:table-cell">
                    {it.localidad || "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-400 hidden md:table-cell">
                    {it.telefono || "—"}
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-right align-top">
                    <button
                      onClick={() => toggleConfirmacion(it.mail, !it.confirmado)}
                      disabled={updatingMail === it.mail}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        it.confirmado ? "bg-green-500" : "bg-gray-600"
                      } ${updatingMail === it.mail ? "opacity-60" : ""}`}
                      aria-label={
                        it.confirmado
                          ? "Quitar confirmación"
                          : "Confirmar participación"
                      }
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          it.confirmado ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">
                    {search || filter !== "all"
                      ? "No hay resultados con esos filtros"
                      : "No hay inscriptos todavía"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ── Tab: Emails (log de envíos) ── */

type EmailLogItem = {
  id: string;
  mail: string;
  campaign: string;
  campaignLabel: string;
  status: "sent" | "failed";
  resendId: string | null;
  error: string | null;
  sentAt: string | null;
  nombre: string;
};

type EmailLogCounts = {
  total: number;
  sent: number;
  failed: number;
  byCampaign: Record<string, { sent: number; failed: number; label: string }>;
};

type EmailStatusFilter = "all" | "sent" | "failed";

function TabEmailsLog() {
  const [items, setItems] = useState<EmailLogItem[]>([]);
  const [counts, setCounts] = useState<EmailLogCounts | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<EmailStatusFilter>("all");
  const [campaign, setCampaign] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [testMail, setTestMail] = useState("");
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] =
    useState<{ ok: boolean; message: string } | null>(null);

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status !== "all") params.set("status", status);
    if (campaign) params.set("campaign", campaign);

    const res = await fetch(`/api/admin/emails-log?${params}`);
    if (!res.ok) return;
    const data = await res.json();
    setItems(data.items || []);
    setCounts(data.counts || null);
  }, [search, status, campaign]);

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  async function sendTest() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testMail.trim())) {
      setTestResult({
        ok: false,
        message: "Ingresá un email válido",
      });
      return;
    }
    setTestSending(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mail: testMail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTestResult({
          ok: false,
          message: data.error || "Error al enviar",
        });
      } else {
        setTestResult({
          ok: true,
          message: `Test enviado a ${testMail.trim()} · ${data.timestamp}`,
        });
      }
    } catch {
      setTestResult({
        ok: false,
        message: "No se pudo conectar con el servidor",
      });
    } finally {
      setTestSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-cejop-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const campaigns = counts ? Object.entries(counts.byCampaign) : [];

  return (
    <div className="space-y-6">
      <SectionTitle>Emails enviados</SectionTitle>

      {/* Test de conectividad */}
      <Card>
        <div className="flex items-start gap-3 mb-4">
          <div>
            <h3 className="font-montserrat font-semibold text-white text-sm">
              Test del sistema de emails
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Mandá un email de ping a cualquier dirección para verificar
              que Resend, el dominio y los templates están OK. No afecta
              las estadísticas ni se guarda como envío real.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
          <input
            type="email"
            placeholder="tu@email.com"
            value={testMail}
            onChange={(e) => setTestMail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !testSending) sendTest();
            }}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cejop-blue transition-colors"
          />
          <button
            onClick={sendTest}
            disabled={testSending}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 bg-cejop-blue text-white text-sm font-semibold rounded-lg transition-colors ${
              testSending ? "opacity-60" : "hover:bg-cejop-blue/90"
            }`}
          >
            <Send size={14} />
            {testSending ? "Enviando..." : "Enviar test"}
          </button>
        </div>
        {testResult && (
          <p
            className={`text-xs mt-3 ${
              testResult.ok ? "text-green-400" : "text-red-400"
            }`}
          >
            {testResult.message}
          </p>
        )}
      </Card>

      {/* Counts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Mail size={16} className="text-cejop-blue" />
            <span className="text-sm text-gray-400 font-medium">Total</span>
          </div>
          <p className="text-3xl font-bold text-white font-montserrat">
            {counts?.total || 0}
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={16} className="text-green-400" />
            <span className="text-sm text-gray-400 font-medium">Enviados</span>
          </div>
          <p className="text-3xl font-bold text-white font-montserrat">
            {counts?.sent || 0}
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={16} className="text-red-400" />
            <span className="text-sm text-gray-400 font-medium">Fallidos</span>
          </div>
          <p className="text-3xl font-bold text-white font-montserrat">
            {counts?.failed || 0}
          </p>
        </Card>
      </div>

      {/* Campaign breakdown */}
      {campaigns.length > 0 && (
        <Card>
          <h3 className="font-montserrat font-semibold text-white mb-4">
            Por campaña
          </h3>
          <div className="space-y-2">
            {campaigns.map(([id, data]) => (
              <div
                key={id}
                className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-white">
                    {data.label}
                  </p>
                  <p className="text-xs text-gray-500 font-mono">{id}</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-green-400">{data.sent} enviados</span>
                  {data.failed > 0 && (
                    <span className="text-red-400">
                      {data.failed} fallidos
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              placeholder="Buscar por email o nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cejop-blue transition-colors"
            />
          </div>
          <select
            value={campaign}
            onChange={(e) => setCampaign(e.target.value)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-cejop-blue transition-colors"
          >
            <option value="">Todas las campañas</option>
            {campaigns.map(([id, data]) => (
              <option key={id} value={id}>
                {data.label}
              </option>
            ))}
          </select>
          <div className="flex gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
            {(
              [
                { id: "all", label: "Todos" },
                { id: "sent", label: "Enviados" },
                { id: "failed", label: "Fallidos" },
              ] as { id: EmailStatusFilter; label: string }[]
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => setStatus(f.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  status === f.id
                    ? "bg-cejop-blue text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-3 font-semibold text-gray-400 text-xs uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left px-6 py-3 font-semibold text-gray-400 text-xs uppercase tracking-wider hidden md:table-cell">
                  Campaña
                </th>
                <th className="text-left px-6 py-3 font-semibold text-gray-400 text-xs uppercase tracking-wider hidden lg:table-cell">
                  Fecha
                </th>
                <th className="text-right px-6 py-3 font-semibold text-gray-400 text-xs uppercase tracking-wider">
                  Estado
                </th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                const expanded = expandedId === it.id;
                const hasDetail = !!(it.error || it.resendId || it.nombre);
                return (
                  <Fragment key={it.id}>
                    <tr
                      className={`border-b border-white/5 transition-colors ${
                        hasDetail
                          ? "hover:bg-white/5 cursor-pointer"
                          : ""
                      }`}
                      onClick={() =>
                        hasDetail &&
                        setExpandedId(expanded ? null : it.id)
                      }
                    >
                      <td className="px-4 sm:px-6 py-3 font-medium text-white">
                        <div className="truncate">{it.mail}</div>
                        {/* Mobile-only badge de campaña + fecha corta */}
                        <div className="md:hidden flex items-center gap-2 mt-1 flex-wrap">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-cejop-blue/20 text-cejop-blue">
                            {it.campaignLabel}
                          </span>
                          {it.sentAt && (
                            <span className="text-[10px] text-gray-500">
                              {new Date(it.sentAt).toLocaleDateString("es-AR", {
                                day: "2-digit",
                                month: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-gray-400 hidden md:table-cell">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-cejop-blue/20 text-cejop-blue">
                          {it.campaignLabel}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-400 hidden lg:table-cell">
                        {it.sentAt
                          ? new Date(it.sentAt).toLocaleString("es-AR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-right align-top">
                        {it.status === "sent" ? (
                          <span className="text-green-400 text-xs font-semibold">
                            Enviado
                          </span>
                        ) : (
                          <span className="text-red-400 text-xs font-semibold">
                            Falló
                          </span>
                        )}
                      </td>
                      <td className="px-2 sm:px-4 py-3 align-top">
                        {hasDetail &&
                          (expanded ? (
                            <ChevronUp size={14} className="text-gray-500" />
                          ) : (
                            <ChevronDown size={14} className="text-gray-500" />
                          ))}
                      </td>
                    </tr>
                    {expanded && hasDetail && (
                      <tr className="bg-white/[0.02] border-b border-white/5">
                        <td colSpan={5} className="px-6 py-4">
                          <dl className="space-y-1.5 text-xs">
                            {it.nombre && (
                              <div className="flex gap-2">
                                <dt className="text-gray-500 min-w-[90px]">
                                  Nombre:
                                </dt>
                                <dd className="text-gray-300">{it.nombre}</dd>
                              </div>
                            )}
                            {it.resendId && (
                              <div className="flex gap-2">
                                <dt className="text-gray-500 min-w-[90px]">
                                  Resend ID:
                                </dt>
                                <dd className="text-gray-300 font-mono">
                                  {it.resendId}
                                </dd>
                              </div>
                            )}
                            {it.error && (
                              <div className="flex gap-2">
                                <dt className="text-red-400 min-w-[90px]">
                                  Error:
                                </dt>
                                <dd className="text-red-300">{it.error}</dd>
                              </div>
                            )}
                          </dl>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">
                    {search || status !== "all" || campaign
                      ? "No hay resultados con esos filtros"
                      : "Todavía no se enviaron emails"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ── Tab: Asistentes acreditados ── */

type AsistenteItem = {
  id: string;
  mail: string;
  nombre: string;
  telefono: string;
  tipo: "confirmado" | "inscripto_no_confirmado" | "walk_in";
  inscripto: boolean;
  confirmado: boolean;
  createdAt: string | null;
};

type AsistenteTipoFilter =
  | "all"
  | "confirmado"
  | "inscripto_no_confirmado"
  | "walk_in";

type AsistenteCounts = {
  total: number;
  confirmado: number;
  inscripto_no_confirmado: number;
  walk_in: number;
};

function TabAsistentes() {
  const [items, setItems] = useState<AsistenteItem[]>([]);
  const [counts, setCounts] = useState<AsistenteCounts | null>(null);
  const [search, setSearch] = useState("");
  const [tipo, setTipo] = useState<AsistenteTipoFilter>("all");
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (tipo !== "all") params.set("tipo", tipo);

    const res = await fetch(`/api/admin/asistentes?${params}`);
    if (!res.ok) return;
    const data = await res.json();
    setItems(data.items || []);
    setCounts(data.counts || null);
  }, [search, tipo]);

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  // Auto-refresh cada 10s (útil durante el evento para ver el flujo en vivo)
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => {
      fetchData();
    }, 10000);
    return () => clearInterval(id);
  }, [autoRefresh, fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-cejop-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  function exportCSV() {
    const headers = [
      "Nombre",
      "Email",
      "Teléfono",
      "Tipo",
      "Inscripto previo",
      "Confirmado previo",
      "Acreditado",
    ];
    const rows = items.map((it) => [
      it.nombre,
      it.mail,
      it.telefono,
      it.tipo === "confirmado"
        ? "Confirmado"
        : it.tipo === "inscripto_no_confirmado"
          ? "Inscripto"
          : "Walk-in",
      it.inscripto ? "Sí" : "No",
      it.confirmado ? "Sí" : "No",
      it.createdAt ? new Date(it.createdAt).toLocaleString("es-AR") : "",
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `acreditados-cejop-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <SectionTitle>Acreditados — Primer encuentro</SectionTitle>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Users size={16} className="text-cejop-blue" />
            <span className="text-sm text-gray-400 font-medium">Total</span>
          </div>
          <p className="text-3xl font-bold text-white font-montserrat">
            {counts?.total || 0}
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={16} className="text-green-400" />
            <span className="text-sm text-gray-400 font-medium">
              Confirmados
            </span>
          </div>
          <p className="text-3xl font-bold text-white font-montserrat">
            {counts?.confirmado || 0}
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList size={16} className="text-blue-300" />
            <span className="text-sm text-gray-400 font-medium">
              Inscriptos
            </span>
          </div>
          <p className="text-3xl font-bold text-white font-montserrat">
            {counts?.inscripto_no_confirmado || 0}
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <UserPlus size={16} className="text-purple-300" />
            <span className="text-sm text-gray-400 font-medium">Walk-ins</span>
          </div>
          <p className="text-3xl font-bold text-white font-montserrat">
            {counts?.walk_in || 0}
          </p>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cejop-blue transition-colors"
            />
          </div>
          <div className="flex gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
            {(
              [
                { id: "all", label: "Todos" },
                { id: "confirmado", label: "Confirm." },
                { id: "inscripto_no_confirmado", label: "Inscript." },
                { id: "walk_in", label: "Walk-in" },
              ] as { id: AsistenteTipoFilter; label: string }[]
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => setTipo(f.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  tipo === f.id
                    ? "bg-cejop-blue text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setAutoRefresh((v) => !v)}
              className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-xs font-medium transition-colors ${
                autoRefresh
                  ? "border-green-500/30 bg-green-500/10 text-green-300"
                  : "border-white/10 bg-white/5 text-gray-400 hover:text-white"
              }`}
              title="Actualiza la lista cada 10s automáticamente"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  autoRefresh ? "bg-green-400 animate-pulse" : "bg-gray-500"
                }`}
              />
              Live
            </button>
            <button
              onClick={exportCSV}
              disabled={items.length === 0}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                items.length === 0
                  ? "bg-white/5 text-gray-600 cursor-not-allowed"
                  : "bg-cejop-blue text-white hover:bg-cejop-blue/90"
              }`}
            >
              <Download size={14} />
              CSV
            </button>
          </div>
        </div>
      </Card>

      {/* List */}
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-4 sm:px-6 py-3 font-semibold text-gray-400 text-xs uppercase tracking-wider">
                  Nombre
                </th>
                <th className="text-left px-6 py-3 font-semibold text-gray-400 text-xs uppercase tracking-wider hidden md:table-cell">
                  Email
                </th>
                <th className="text-left px-6 py-3 font-semibold text-gray-400 text-xs uppercase tracking-wider hidden md:table-cell">
                  Teléfono
                </th>
                <th className="text-left px-4 sm:px-6 py-3 font-semibold text-gray-400 text-xs uppercase tracking-wider">
                  Tipo
                </th>
                <th className="text-right px-4 sm:px-6 py-3 font-semibold text-gray-400 text-xs uppercase tracking-wider hidden sm:table-cell">
                  Hora
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr
                  key={it.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-white">
                    <div>{it.nombre || "—"}</div>
                    <div className="md:hidden text-xs text-gray-500 font-normal mt-0.5 truncate">
                      {it.mail}
                    </div>
                    {it.telefono && (
                      <div className="md:hidden text-[11px] text-gray-500 font-normal mt-0.5">
                        {it.telefono}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-400 hidden md:table-cell">
                    {it.mail}
                  </td>
                  <td className="px-6 py-4 text-gray-400 hidden md:table-cell">
                    {it.telefono || "—"}
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${
                        it.tipo === "walk_in"
                          ? "bg-purple-500/20 text-purple-300"
                          : it.tipo === "confirmado"
                            ? "bg-green-500/20 text-green-300"
                            : "bg-blue-500/20 text-blue-300"
                      }`}
                    >
                      {it.tipo === "walk_in"
                        ? "Walk-in"
                        : it.tipo === "confirmado"
                          ? "Confirmado"
                          : "Inscripto"}
                    </span>
                    {/* En mobile ponemos la hora debajo del badge */}
                    <div className="sm:hidden text-[11px] text-gray-500 mt-1">
                      {it.createdAt
                        ? new Date(it.createdAt).toLocaleTimeString("es-AR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-400 hidden sm:table-cell whitespace-nowrap">
                    {it.createdAt
                      ? new Date(it.createdAt).toLocaleString("es-AR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">
                    {search || tipo !== "all"
                      ? "No hay resultados con esos filtros"
                      : "Todavía no hay acreditados"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
