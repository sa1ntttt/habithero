import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

interface Props {
  data: { day: string; count: number }[];
}

export function WeeklyBarChart({ data }: Props) {
  const max = data.reduce((m, d) => (d.count > m ? d.count : m), 0);

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 16, right: 0, left: -24, bottom: 0 }}
        >
          <defs>
            <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#A78BFA" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
            <linearGradient id="barFillDim" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#6366F1" stopOpacity={0.5} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.06)"
            vertical={false}
          />
          <XAxis
            dataKey="day"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#71717A" }}
          />
          <YAxis
            allowDecimals={false}
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#71717A" }}
            width={40}
          />
          <Tooltip
            cursor={{ fill: "rgba(139,92,246,0.08)" }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "#1A1A24",
              color: "rgba(255,255,255,0.95)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
              fontSize: 12,
            }}
            labelStyle={{ color: "#A1A1AA" }}
            itemStyle={{ color: "rgba(255,255,255,0.95)" }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={d.count === max && max > 0 ? "url(#barFill)" : "url(#barFillDim)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
