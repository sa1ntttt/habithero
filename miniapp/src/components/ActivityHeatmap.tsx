interface Props {
  // Map: 'YYYY-MM-DD' -> count
  counts: Record<string, number>;
  weeks?: number; // default 13 weeks (~ 90 days)
}

// Dark-theme emerald scale (0 = empty surface, 4 = brightest)
const LEVEL_BG = [
  "rgba(255,255,255,0.05)",
  "rgba(16,185,129,0.22)",
  "rgba(16,185,129,0.45)",
  "rgba(16,185,129,0.7)",
  "#10B981",
];

function levelFor(count: number, max: number): number {
  if (count <= 0) return 0;
  const ratio = max > 0 ? count / max : 0;
  if (ratio < 0.25) return 1;
  if (ratio < 0.5) return 2;
  if (ratio < 0.75) return 3;
  return 4;
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function ActivityHeatmap({ counts, weeks = 13 }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start: Monday of (today - weeks*7 days)
  const start = new Date(today);
  start.setDate(start.getDate() - weeks * 7);
  const weekday = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - weekday);

  const cols: { date: Date; count: number }[][] = [];
  const cursor = new Date(start);
  let max = 1;
  for (const c of Object.values(counts)) if (c > max) max = c;

  while (cursor <= today) {
    const col: { date: Date; count: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const dateCopy = new Date(cursor);
      const iso = isoDate(dateCopy);
      const future = dateCopy > today;
      col.push({ date: dateCopy, count: future ? -1 : counts[iso] ?? 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
    cols.push(col);
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-[3px]">
        {cols.map((col, i) => (
          <div key={i} className="flex flex-col gap-[3px]">
            {col.map((cell, j) => {
              const empty = cell.count < 0;
              const lvl = empty ? 0 : levelFor(cell.count, max);
              return (
                <div
                  key={j}
                  title={!empty ? `${isoDate(cell.date)} — ${cell.count}` : ""}
                  className="h-3 w-3 rounded-[3px]"
                  style={{
                    background: empty ? "transparent" : LEVEL_BG[lvl],
                    border:
                      empty || lvl > 0
                        ? "none"
                        : "1px solid rgba(255,255,255,0.04)",
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// Exported for the Stats legend
export const HEATMAP_LEVEL_BG = LEVEL_BG;
