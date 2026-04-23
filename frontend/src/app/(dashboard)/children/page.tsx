"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { getChildren } from "@/lib/api";
import { calcAge, cn } from "@/lib/utils";
import {
  AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight,
  Heart, BookOpen, HandHeart, Filter, Minus,
} from "lucide-react";
import type { Child } from "@/types";

const BAIRROS = ["Rocinha", "Maré", "Jacarezinho", "Complexo do Alemão", "Mangueira"];

function countAlerts(c: Child) {
  return (
    (c.saude?.alertas.length ?? 0) +
    (c.educacao?.alertas.length ?? 0) +
    (c.assistencia_social?.alertas.length ?? 0)
  );
}

function AreaDot({
  present, hasAlert, Icon,
}: {
  present: boolean;
  hasAlert: boolean;
  Icon: React.ElementType;
}) {
  if (!present) return <Icon className="w-3.5 h-3.5 text-muted-foreground/30" />;
  if (hasAlert) return <Icon className="w-3.5 h-3.5 text-red-500" />;
  return <Icon className="w-3.5 h-3.5 text-emerald-500" />;
}

function ChildCard({ child }: { child: Child }) {
  const alerts = countAlerts(child);
  const age = calcAge(child.data_nascimento);

  return (
    <Link
      href={`/children/${child.id}`}
      className="block bg-card border border-border rounded-xl p-4 hover:border-primary/40 hover:shadow-sm transition-all group"
    >
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
            {child.nome}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {age} {age === 1 ? "ano" : "anos"} · {child.bairro}
          </p>
        </div>
        <div className="shrink-0">
          {alerts > 0 ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-xs font-semibold">
              <AlertTriangle className="w-3 h-3" />
              {alerts}
            </span>
          ) : (
            <span className="inline-flex px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
              OK
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <AreaDot
            present={!!child.saude}
            hasAlert={(child.saude?.alertas.length ?? 0) > 0}
            Icon={Heart}
          />
          Saúde
        </span>
        <span className="flex items-center gap-1">
          <AreaDot
            present={!!child.educacao}
            hasAlert={(child.educacao?.alertas.length ?? 0) > 0}
            Icon={BookOpen}
          />
          Educ.
        </span>
        <span className="flex items-center gap-1">
          <AreaDot
            present={!!child.assistencia_social}
            hasAlert={(child.assistencia_social?.alertas.length ?? 0) > 0}
            Icon={HandHeart}
          />
          Assist.
        </span>
        {child.revisado && (
          <span className="flex items-center gap-1 ml-auto text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Revisado
          </span>
        )}
      </div>
    </Link>
  );
}

type Toggle = true | false | undefined;
function cycleToggle(v: Toggle): Toggle {
  if (v === undefined) return true;
  if (v === true) return false;
  return undefined;
}
function toggleLabel(v: Toggle, yes: string, no: string): string {
  if (v === true) return yes;
  if (v === false) return no;
  return "Todos";
}

export default function ChildrenPage() {
  const [bairro, setBairro] = useState("");
  const [comAlertas, setComAlertas] = useState<Toggle>(undefined);
  const [revisado, setRevisado] = useState<Toggle>(undefined);
  const [page, setPage] = useState(1);

  const params = {
    bairro: bairro || undefined,
    com_alertas: comAlertas,
    revisado,
    page,
    page_size: 12,
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["children", params],
    queryFn: () => getChildren(params),
  });

  const resetPage = () => setPage(1);

  return (
    <div className="space-y-4 max-w-5xl">
      <div>
        <h1 className="font-display text-2xl font-bold">Crianças</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {data ? `${data.total} registro${data.total !== 1 ? "s" : ""} encontrado${data.total !== 1 ? "s" : ""}` : "Carregando..."}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3 text-xs font-medium text-muted-foreground">
          <Filter className="w-3.5 h-3.5" />
          Filtros
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Bairro */}
          <select
            value={bairro}
            onChange={(e) => { setBairro(e.target.value); resetPage(); }}
            className={cn(
              "px-3 py-1.5 rounded-lg border text-sm bg-background",
              "focus:outline-none focus:ring-2 focus:ring-ring",
              bairro ? "border-primary text-primary font-medium" : "border-border"
            )}
          >
            <option value="">Todos os bairros</option>
            {BAIRROS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          {/* Com alertas toggle */}
          <button
            onClick={() => { setComAlertas(cycleToggle(comAlertas)); resetPage(); }}
            className={cn(
              "px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors",
              comAlertas === true && "bg-red-100 dark:bg-red-950/40 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400",
              comAlertas === false && "bg-emerald-100 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400",
              comAlertas === undefined && "bg-background border-border text-foreground"
            )}
          >
            {toggleLabel(comAlertas, "Com alertas", "Sem alertas")}
          </button>

          {/* Revisado toggle */}
          <button
            onClick={() => { setRevisado(cycleToggle(revisado)); resetPage(); }}
            className={cn(
              "px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors",
              revisado === true && "bg-emerald-100 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400",
              revisado === false && "bg-amber-100 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400",
              revisado === undefined && "bg-background border-border text-foreground"
            )}
          >
            {toggleLabel(revisado, "Revisados", "Não revisados")}
          </button>

          {(bairro || comAlertas !== undefined || revisado !== undefined) && (
            <button
              onClick={() => { setBairro(""); setComAlertas(undefined); setRevisado(undefined); resetPage(); }}
              className="px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl h-28 animate-pulse" />
          ))}
        </div>
      ) : data?.children.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Minus className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Nenhuma criança encontrada</p>
          <p className="text-sm mt-1">Tente ajustar os filtros</p>
        </div>
      ) : (
        <div className={cn("grid sm:grid-cols-2 lg:grid-cols-3 gap-3", isFetching && "opacity-70 transition-opacity")}>
          {data?.children.map((child) => (
            <ChildCard key={child.id} child={child} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.total_pages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Página {data.page} de {data.total_pages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-border disabled:opacity-40 hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
              disabled={page === data.total_pages}
              className="p-2 rounded-lg border border-border disabled:opacity-40 hover:bg-muted transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
