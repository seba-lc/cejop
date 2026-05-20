import type { DashboardData } from "@/types/encuentro1";

type Props = { data: DashboardData };

const CATEGORIES: {
  key: keyof DashboardData["text"]["mentions"];
  label: string;
  color: string;
}[] = [
  { key: "politicos", label: "Políticos", color: "bg-rose-100 text-rose-800 border-rose-200" },
  { key: "empresas", label: "Empresas", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { key: "instituciones", label: "Instituciones", color: "bg-amber-100 text-amber-800 border-amber-200" },
  { key: "municipios", label: "Municipios", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { key: "temas", label: "Temas", color: "bg-violet-100 text-violet-800 border-violet-200" },
];

const DOBLE_BORDE = new Set(["milei"]);

function sizeFor(count: number, max: number): string {
  const ratio = count / max;
  if (ratio >= 0.7) return "text-2xl sm:text-3xl";
  if (ratio >= 0.4) return "text-xl sm:text-2xl";
  if (ratio >= 0.2) return "text-base sm:text-lg";
  return "text-sm";
}

export default function NubeMenciones({ data }: Props) {
  const allEntries = CATEGORIES.flatMap((cat) => {
    const dict = data.text.mentions[cat.key] || {};
    return Object.entries(dict).map(([word, count]) => ({
      cat: cat.label,
      color: cat.color,
      word,
      count: count as number,
    }));
  });
  if (allEntries.length === 0) return null;

  const max = Math.max(...allEntries.map((e) => e.count));

  return (
    <section aria-label="Menciones y redes" className="mb-10">
      <h2 className="text-lg sm:text-xl font-montserrat font-bold text-cejop-dark mb-3">
        Menciones
      </h2>

      <div className="bg-white border border-cejop-blue-light/40 rounded-xl p-5 shadow-sm">
        {CATEGORIES.map((cat) => {
          const dict = data.text.mentions[cat.key] || {};
          const entries = Object.entries(dict).sort(
            ([, a], [, b]) => (b as number) - (a as number)
          );
          if (entries.length === 0) return null;
          return (
            <div key={cat.key} className="mb-4 last:mb-0">
              <div className="text-[11px] font-encode uppercase tracking-wide text-cejop-dark/60 mb-2">
                {cat.label}
              </div>
              <div className="flex flex-wrap gap-2 items-baseline">
                {entries.map(([word, count]) => {
                  const isDouble = DOBLE_BORDE.has(word.toLowerCase());
                  return (
                    <span
                      key={word}
                      className={`px-2.5 py-1 rounded-md font-montserrat font-semibold capitalize ${
                        cat.color
                      } ${sizeFor(count as number, max)} ${
                        isDouble ? "border-4 border-double" : "border"
                      }`}
                      title={`${count} mención${
                        (count as number) === 1 ? "" : "es"
                      }`}
                    >
                      {word}{" "}
                      <span className="text-xs opacity-60 tabular-nums">
                        {count as number}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
