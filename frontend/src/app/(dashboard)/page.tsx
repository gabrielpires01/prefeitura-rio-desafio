"use client";
import { useQuery } from "@tanstack/react-query";
import { getSummary } from "@/lib/api";
import { Users, Heart, BookOpen, HandHeart, CheckCircle2, AlertTriangle, Database } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import type { Summary } from "@/types";

const AREA_COLORS = {
  saude: "#ef4444",
  educacao: "#f59e0b",
  assistencia: "#8b5cf6",
};

function StatCard({
  label, value, sub, icon: Icon, iconColor, iconBg,
}: {
  label: string;
  value: number;
  sub?: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 flex flex-col gap-3">
      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", iconBg)}>
        <Icon className={cn("w-4 h-4", iconColor)} />
      </div>
      <div>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{label}</p>
      </div>
    </div>
  );
}

function DashboardContent({ summary }: { summary: Summary }) {
  const totalAlerts =
    summary.com_alertas_saude +
    summary.com_alertas_educacao +
    summary.com_alertas_assistencia_social;

  const chartData = [
    { area: "Saúde", alertas: summary.com_alertas_saude, fill: AREA_COLORS.saude },
    { area: "Educação", alertas: summary.com_alertas_educacao, fill: AREA_COLORS.educacao },
    { area: "Assist. Social", alertas: summary.com_alertas_assistencia_social, fill: AREA_COLORS.assistencia },
  ];

  const cards = [
    {
      label: "Total de Crianças",
      value: summary.total_criancas,
      icon: Users,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
    {
      label: "Alertas de Saúde",
      value: summary.com_alertas_saude,
      icon: Heart,
      iconColor: "text-red-500",
      iconBg: "bg-red-50 dark:bg-red-950/30",
    },
    {
      label: "Alertas de Educação",
      value: summary.com_alertas_educacao,
      icon: BookOpen,
      iconColor: "text-amber-500",
      iconBg: "bg-amber-50 dark:bg-amber-950/30",
    },
    {
      label: "Alertas Assist. Social",
      value: summary.com_alertas_assistencia_social,
      icon: HandHeart,
      iconColor: "text-violet-500",
      iconBg: "bg-violet-50 dark:bg-violet-950/30",
    },
    {
      label: "Revisadas",
      value: summary.revisadas,
      sub: `de ${summary.total_criancas} crianças`,
      icon: CheckCircle2,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      label: "Sem Dados em Nenhuma Área",
      value: summary.sem_dados,
      icon: Database,
      iconColor: "text-slate-400",
      iconBg: "bg-slate-100 dark:bg-slate-800/50",
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Visão geral do acompanhamento social</p>
      </div>

      {totalAlerts > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              {totalAlerts} {totalAlerts === 1 ? "criança necessita" : "crianças necessitam"} de atenção
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
              Casos com alertas ativos aguardando revisão técnica
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {cards.map((c) => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="text-sm font-semibold mb-5">Alertas por Área</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="area" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
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
              formatter={(v) => { const n = Number(v); return [`${n} criança${n !== 1 ? "s" : ""}`, "Alertas"]; }}
            />
            <Bar dataKey="alertas" radius={[6, 6, 0, 0]} maxBarSize={80}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse max-w-5xl">
      <div className="h-7 bg-muted rounded w-40" />
      <div className="h-14 bg-muted rounded-xl" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl border border-border h-28" />
        ))}
      </div>
      <div className="bg-card rounded-xl border border-border h-72" />
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ["summary"], queryFn: getSummary });
  if (isLoading) return <Skeleton />;
  if (!data) return null;
  return <DashboardContent summary={data} />;
}
