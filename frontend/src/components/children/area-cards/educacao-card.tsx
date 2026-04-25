import { BookOpen, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { AlertBadge } from "@/components/shared/alert-badge";
import type { Educacao } from "@/types";

interface EducacaoCardProps {
  educacao: Educacao;
}

export function EducacaoCard({ educacao }: EducacaoCardProps) {
  const hasAlerts = educacao.alertas.length > 0;

  return (
    <div
      className={cn(
        "bg-card border rounded-xl p-5",
        hasAlerts ? "border-amber-200 dark:border-amber-900" : "border-border"
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center",
            hasAlerts
              ? "bg-amber-100 dark:bg-amber-950/40"
              : "bg-emerald-100 dark:bg-emerald-950/40"
          )}
        >
          <BookOpen
            className={cn("w-4 h-4", hasAlerts ? "text-amber-500" : "text-emerald-500")}
            aria-hidden="true"
          />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Educação</h3>
          <p className={cn("text-xs", hasAlerts ? "text-amber-500" : "text-emerald-500")}>
            {hasAlerts
              ? `${educacao.alertas.length} alerta${educacao.alertas.length > 1 ? "s" : ""}`
              : "Sem alertas"}
          </p>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-start justify-between gap-2">
          <span className="flex items-center gap-2 text-muted-foreground text-xs shrink-0">
            <GraduationCap className="w-3.5 h-3.5" aria-hidden="true" />
            Escola
          </span>
          <span className="font-medium text-xs text-right">
            {educacao.escola ?? (
              <span className="text-muted-foreground">Não informada</span>
            )}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">Frequência</span>
          {educacao.frequencia_percent !== null ? (
            <div className="flex items-center gap-2">
              <div
                className="w-20 h-1.5 rounded-full bg-muted overflow-hidden"
                role="progressbar"
                aria-valuenow={educacao.frequencia_percent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    educacao.frequencia_percent >= 75 ? "bg-emerald-500" : "bg-red-500"
                  )}
                  style={{ width: `${educacao.frequencia_percent}%` }}
                />
              </div>
              <span
                className={cn(
                  "text-xs font-semibold tabular-nums",
                  educacao.frequencia_percent >= 75
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-500"
                )}
              >
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
          {educacao.alertas.map((a) => (
            <AlertBadge key={a} alert={a} />
          ))}
        </div>
      )}
    </div>
  );
}
