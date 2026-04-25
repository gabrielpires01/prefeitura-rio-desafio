import { HandHeart, BadgeDollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { AlertBadge } from "@/components/shared/alert-badge";
import type { AssistenciaSocial } from "@/types";

interface AssistenciaCardProps {
  assistencia: AssistenciaSocial;
}

export function AssistenciaCard({ assistencia }: AssistenciaCardProps) {
  const hasAlerts = assistencia.alertas.length > 0;

  return (
    <div
      className={cn(
        "bg-card border rounded-xl p-5",
        hasAlerts ? "border-violet-200 dark:border-violet-900" : "border-border"
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center",
            hasAlerts
              ? "bg-violet-100 dark:bg-violet-950/40"
              : "bg-emerald-100 dark:bg-emerald-950/40"
          )}
        >
          <HandHeart
            className={cn(
              "w-4 h-4",
              hasAlerts ? "text-violet-500" : "text-emerald-500"
            )}
            aria-hidden="true"
          />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Assistência Social</h3>
          <p
            className={cn(
              "text-xs",
              hasAlerts ? "text-violet-500" : "text-emerald-500"
            )}
          >
            {hasAlerts
              ? `${assistencia.alertas.length} alerta${assistencia.alertas.length > 1 ? "s" : ""}`
              : "Sem alertas"}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-muted-foreground text-xs">
            <BadgeDollarSign className="w-3.5 h-3.5" aria-hidden="true" />
            CadÚnico
          </span>
          <span
            className={cn(
              "text-xs font-medium",
              assistencia.cad_unico
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-500"
            )}
          >
            {assistencia.cad_unico ? "Cadastrado" : "Não cadastrado"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">Benefício ativo</span>
          <span
            className={cn(
              "text-xs font-medium",
              assistencia.beneficio_ativo
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-500"
            )}
          >
            {assistencia.beneficio_ativo ? "Sim" : "Não"}
          </span>
        </div>
      </div>

      {assistencia.alertas.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {assistencia.alertas.map((a) => (
            <AlertBadge key={a} alert={a} />
          ))}
        </div>
      )}
    </div>
  );
}
