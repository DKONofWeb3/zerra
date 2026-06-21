import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface PerformancePoint {
  month: string;
  value: number;
}

interface PerformanceChartProps {
  data: PerformancePoint[];
}

/**
 * "Performance Over Time" chart on the analytics overview tab.
 * Reference: ana.jpg left chart, red/coral line with soft area fill.
 */
export function PerformanceChart({ data }: PerformanceChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 4, left: -28, bottom: 0 }}>
        <defs>
          <linearGradient id="perf-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(232 80 80)" stopOpacity={0.32} />
            <stop offset="100%" stopColor="rgb(232 80 80)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "rgb(110 115 128)", fontSize: 11 }}
          dy={8}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "rgb(110 115 128)", fontSize: 11 }}
          tickFormatter={(v) => `$${v}k`}
          width={50}
        />
        <Tooltip
          contentStyle={{
            background: "rgb(8 10 16)",
            border: "1px solid rgb(28 32 44)",
            borderRadius: 10,
            fontSize: 12,
          }}
          labelStyle={{ color: "rgb(158 162 175)" }}
          itemStyle={{ color: "rgb(245 245 247)" }}
          formatter={(value: number) => [`$${value}k`, "Value"]}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="rgb(232 100 90)"
          strokeWidth={2}
          fill="url(#perf-area)"
          dot={false}
          activeDot={{ r: 4, fill: "#fff", stroke: "rgb(232 80 80)", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
