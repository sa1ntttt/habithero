interface Props {
  // Map: 'YYYY-MM-DD' -> count
  counts: Record<string, number>;
  weeks?: number; // default 13 weeks (~ 90 days)
}

function colorClass(count: number, max: number): string {
  if (count === 0) return "bg-tg-secondary-bg";
  const ratio = max > 0 ? count / max : 0;
  if (ratio < 0.25) return "bg-emerald-200";
  if (ratio < 0.5) return "bg-emerald-400";
  if (ratio < 0.75) return "bg-emerald-500";
  return "bg-emerald-600";
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
  // Align to Monday
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
            {col.map((cell, j) => (
              <div
                key={j}
                title={cell.count >= 0 ? `${isoDate(cell.date)} — ${cell.count}` : ""}
                className={`h-3 w-3 rounded-[3px] ${
                  cell.count < 0 ? "opacity-0" : colorClass(cell.count, max)
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
