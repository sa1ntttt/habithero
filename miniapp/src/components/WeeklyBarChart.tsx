import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface Props {
  data: { day: string; count: number }[];
}

export function WeeklyBarChart({ data }: Props) {
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
          <XAxis dataKey="day" fontSize={12} tick={{ fill: "var(--tg-hint-color, #888)" }} />
          <YAxis
            allowDecimals={false}
            fontSize={12}
            tick={{ fill: "var(--tg-hint-color, #888)" }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "none",
              background: "var(--tg-bg-color, #fff)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
            }}
          />
          <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
