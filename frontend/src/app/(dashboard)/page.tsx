"use client";
import { useQuery } from "@tanstack/react-query";
import { getChildren, getSummary } from "@/lib/api";
import {
    Users,
    Heart,
    BookOpen,
    HandHeart,
    CheckCircle2,
    Database,
} from "lucide-react";
import type { Summary } from "@/types";
import dynamic from "next/dynamic";
import { StatCard } from "@/components/shared/stat-card";
import { AlertBanner } from "@/components/dashboard/alert-banner";
import { AlertsBarChart } from "@/components/dashboard/alerts-bar-chart";
import { Skeleton } from "@/components/ui/skeleton";

const MapComponent = dynamic(() => import("@/components/map"), {
    ssr: false,
    loading: () => (
        <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
            Carregando mapa...
        </div>
    ),
});

const STAT_CARDS = (summary: Summary) => [
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

function DashboardContent({ summary }: { summary: Summary }) {
    const totalAlerts =
        summary.com_alertas_saude +
        summary.com_alertas_educacao +
        summary.com_alertas_assistencia_social;

    const params = {
        bairro: undefined,
        com_alertas: undefined,
        revisado: undefined,
    };

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ["children", params],
        queryFn: () => getChildren(params),
    });

    return (
        <div className="space-y-6 max-w-5xl">
            <div>
                <h1 className="font-display text-2xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Visão geral do acompanhamento social
                </p>
            </div>

            <AlertBanner totalAlerts={totalAlerts} />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {STAT_CARDS(summary).map((card) => (
                    <StatCard key={card.label} {...card} />
                ))}
            </div>

            <AlertsBarChart
                saude={summary.com_alertas_saude}
                educacao={summary.com_alertas_educacao}
                assistencia={summary.com_alertas_assistencia_social}
            />

            {isLoading || isFetching ? (
                <Skeleton className="h-72 rounded-xl" />
            ) : (
                <div className="bg-card rounded-xl border border-border p-5 h-100 flex justify-center flex-col">
                    <h2 className="text-sm font-semibold mb-5">
                        Mapa de Calor de Vulnerabilidade
                    </h2>
                    <div
                        style={{
                            marginTop: "2rem",
                            width: "100%",
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                            overflow: "hidden",
                        }}
                    >
                        <MapComponent data={data?.children || []} />
                    </div>
                </div>
            )}
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6 max-w-5xl">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-14 rounded-xl" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 rounded-xl" />
                ))}
            </div>
            <Skeleton className="h-72 rounded-xl" />
        </div>
    );
}

export default function DashboardPage() {
    const { data, isLoading } = useQuery({
        queryKey: ["summary"],
        queryFn: getSummary,
    });

    if (isLoading) return <DashboardSkeleton />;
    if (!data) return null;
    return <DashboardContent summary={data} />;
}
