"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const AREA_COLORS = {
  saude: "#ef4444",
  educacao: "#f59e0b",
  assistencia: "#8b5cf6",
};

interface AlertsBarChartProps {
  saude: number;
  educacao: number;
  assistencia: number;
}

export function AlertsBarChart({ saude, educacao, assistencia }: AlertsBarChartProps) {
  const data = [
    { area: "Saúde", alertas: saude, fill: AREA_COLORS.saude },
    { area: "Educação", alertas: educacao, fill: AREA_COLORS.educacao },
    { area: "Assist. Social", alertas: assistencia, fill: AREA_COLORS.assistencia },
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h2 className="text-sm font-semibold mb-5">Alertas por Área</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="hsl(var(--border))"
          />
          <XAxis
            dataKey="area"
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--muted))", radius: 6 }}
            contentStyle={{
              borderRadius: "10px",
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
              color: "hsl(var(--foreground))",
              fontSize: "13px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            }}
            itemStyle={{ color: "hsl(var(--foreground))" }}
            formatter={(v) => {
              const n = Number(v);
              return [`${n} criança${n !== 1 ? "s" : ""}`, "Alertas"];
            }}
          />
          <Bar dataKey="alertas" radius={[6, 6, 0, 0]} maxBarSize={80}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
