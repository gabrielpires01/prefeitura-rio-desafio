"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { getChild, reviewChild } from "@/lib/api";
import { calcAge, formatDate, labelAlert, cn } from "@/lib/utils";
import {
  Heart, BookOpen, HandHeart, ArrowLeft, CheckCircle2,
  AlertTriangle, Loader2, Info, CalendarDays, Syringe,
  GraduationCap, BadgeDollarSign, User,
} from "lucide-react";
import type { Child } from "@/types";

function AlertBadge({ alert }: { alert: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-xs font-medium">
      <AlertTriangle className="w-3 h-3" />
      {labelAlert(alert)}
    </span>
  );
}

function NoDataCard({ area }: { area: string }) {
  return (
    <div className="bg-card border border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3 min-h-[140px]">
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
        <Info className="w-4 h-4 text-muted-foreground/60" />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">Sem dados em {area}</p>
        <p className="text-xs text-muted-foreground/60 mt-0.5">
          Esta criança não possui registros nesta área
        </p>
      </div>
    </div>
  );
}

function SaudeCard({ saude }: { saude: NonNullable<Child["saude"]> }) {
  const hasAlerts = saude.alertas.length > 0;
  return (
    <div className={cn("bg-card border rounded-xl p-5", hasAlerts ? "border-red-200 dark:border-red-900" : "border-border")}>
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", hasAlerts ? "bg-red-100 dark:bg-red-950/40" : "bg-emerald-100 dark:bg-emerald-950/40")}>
          <Heart className={cn("w-4 h-4", hasAlerts ? "text-red-500" : "text-emerald-500")} />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Saúde</h3>
          <p className={cn("text-xs", hasAlerts ? "text-red-500" : "text-emerald-500")}>
            {hasAlerts ? `${saude.alertas.length} alerta${saude.alertas.length > 1 ? "s" : ""}` : "Sem alertas"}
          </p>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-muted-foreground text-xs">
            <CalendarDays className="w-3.5 h-3.5" />
            Última consulta
          </span>
          <span className="font-medium text-xs">{formatDate(saude.ultima_consulta ?? null)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-muted-foreground text-xs">
            <Syringe className="w-3.5 h-3.5" />
            Vacinas em dia
          </span>
          <span className={cn("text-xs font-medium", saude.vacinas_em_dia ? "text-emerald-600 dark:text-emerald-400" : "text-red-500")}>
            {saude.vacinas_em_dia ? "Sim" : "Não"}
          </span>
        </div>
      </div>

      {saude.alertas.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {saude.alertas.map((a) => <AlertBadge key={a} alert={a} />)}
        </div>
      )}
    </div>
  );
}

function EducacaoCard({ educacao }: { educacao: NonNullable<Child["educacao"]> }) {
  const hasAlerts = educacao.alertas.length > 0;
  return (
    <div className={cn("bg-card border rounded-xl p-5", hasAlerts ? "border-amber-200 dark:border-amber-900" : "border-border")}>
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", hasAlerts ? "bg-amber-100 dark:bg-amber-950/40" : "bg-emerald-100 dark:bg-emerald-950/40")}>
          <BookOpen className={cn("w-4 h-4", hasAlerts ? "text-amber-500" : "text-emerald-500")} />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Educação</h3>
          <p className={cn("text-xs", hasAlerts ? "text-amber-500" : "text-emerald-500")}>
            {hasAlerts ? `${educacao.alertas.length} alerta${educacao.alertas.length > 1 ? "s" : ""}` : "Sem alertas"}
          </p>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-start justify-between gap-2">
          <span className="flex items-center gap-2 text-muted-foreground text-xs shrink-0">
            <GraduationCap className="w-3.5 h-3.5" />
            Escola
          </span>
          <span className="font-medium text-xs text-right">
            {educacao.escola ?? <span className="text-muted-foreground">Não informada</span>}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">Frequência</span>
          {educacao.frequencia_percent !== null ? (
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    educacao.frequencia_percent >= 75 ? "bg-emerald-500" : "bg-red-500"
                  )}
                  style={{ width: `${educacao.frequencia_percent}%` }}
                />
              </div>
              <span className={cn(
                "text-xs font-semibold tabular-nums",
                educacao.frequencia_percent >= 75 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
              )}>
                {educacao.frequencia_percent}%
              </span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </div>
      </div>

      {educacao.alertas.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {educacao.alertas.map((a) => <AlertBadge key={a} alert={a} />)}
        </div>
      )}
    </div>
  );
}

function AssistenciaCard({ assistencia }: { assistencia: NonNullable<Child["assistencia_social"]> }) {
  const hasAlerts = assistencia.alertas.length > 0;
  return (
    <div className={cn("bg-card border rounded-xl p-5", hasAlerts ? "border-violet-200 dark:border-violet-900" : "border-border")}>
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", hasAlerts ? "bg-violet-100 dark:bg-violet-950/40" : "bg-emerald-100 dark:bg-emerald-950/40")}>
          <HandHeart className={cn("w-4 h-4", hasAlerts ? "text-violet-500" : "text-emerald-500")} />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Assistência Social</h3>
          <p className={cn("text-xs", hasAlerts ? "text-violet-500" : "text-emerald-500")}>
            {hasAlerts ? `${assistencia.alertas.length} alerta${assistencia.alertas.length > 1 ? "s" : ""}` : "Sem alertas"}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-muted-foreground text-xs">
            <BadgeDollarSign className="w-3.5 h-3.5" />
            CadÚnico
          </span>
          <span className={cn("text-xs font-medium", assistencia.cad_unico ? "text-emerald-600 dark:text-emerald-400" : "text-red-500")}>
            {assistencia.cad_unico ? "Cadastrado" : "Não cadastrado"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">Benefício ativo</span>
          <span className={cn("text-xs font-medium", assistencia.beneficio_ativo ? "text-emerald-600 dark:text-emerald-400" : "text-amber-500")}>
            {assistencia.beneficio_ativo ? "Sim" : "Não"}
          </span>
        </div>
      </div>

      {assistencia.alertas.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {assistencia.alertas.map((a) => <AlertBadge key={a} alert={a} />)}
        </div>
      )}
    </div>
  );
}

export default function ChildDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [reviewed, setReviewed] = useState(false);

  const { data: child, isLoading } = useQuery({
    queryKey: ["child", id],
    queryFn: () => getChild(id),
  });

  const mutation = useMutation({
    mutationFn: () => reviewChild(id),
    onSuccess: () => {
      setReviewed(true);
      qc.invalidateQueries({ queryKey: ["children"] });
      qc.invalidateQueries({ queryKey: ["summary"] });
      qc.invalidateQueries({ queryKey: ["child", id] });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-6 animate-pulse">
        <div className="h-6 bg-muted rounded w-32" />
        <div className="h-24 bg-card border border-border rounded-xl" />
        <div className="grid sm:grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-40 bg-card border border-border rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!child) return <p className="text-muted-foreground">Criança não encontrada.</p>;

  const age = calcAge(child.data_nascimento);
  const isReviewed = child.revisado || reviewed;

  return (
    <div className="max-w-3xl space-y-5">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>

      {/* Header card */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold">{child.nome}</h1>
              <p className="text-muted-foreground text-sm">
                {age} {age === 1 ? "ano" : "anos"} · {child.bairro}
              </p>
              <p className="text-muted-foreground text-xs mt-0.5">
                Responsável: {child.responsavel}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {isReviewed ? (
              <div className="flex flex-col items-end gap-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Revisado
                </span>
                {child.revisado_por && (
                  <p className="text-xs text-muted-foreground text-right">
                    por {child.revisado_por}
                    {child.revisado_em && (
                      <><br />{formatDate(child.revisado_em)}</>
                    )}
                  </p>
                )}
              </div>
            ) : (
              <button
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all active:scale-[0.98]",
                  "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                )}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Marcar como revisado
                  </>
                )}
              </button>
            )}

            {mutation.isError && (
              <p className="text-xs text-destructive">Erro ao salvar. Tente novamente.</p>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border flex items-center gap-4 text-xs text-muted-foreground">
          <span>Nascimento: {formatDate(child.data_nascimento)}</span>
          <span>ID: {child.id}</span>
        </div>
      </div>

      {/* Area cards */}
      <div className="grid sm:grid-cols-3 gap-3">
        {child.saude ? <SaudeCard saude={child.saude} /> : <NoDataCard area="Saúde" />}
        {child.educacao ? <EducacaoCard educacao={child.educacao} /> : <NoDataCard area="Educação" />}
        {child.assistencia_social ? (
          <AssistenciaCard assistencia={child.assistencia_social} />
        ) : (
          <NoDataCard area="Assistência Social" />
        )}
      </div>
    </div>
  );
}
