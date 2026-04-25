import { Heart, CalendarDays, Syringe } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { AlertBadge } from "@/components/shared/alert-badge";
import type { Saude } from "@/types";

interface SaudeCardProps {
  saude: Saude;
}

export function SaudeCard({ saude }: SaudeCardProps) {
  const hasAlerts = saude.alertas.length > 0;

  return (
    <div
      className={cn(
        "bg-card border rounded-xl p-5",
        hasAlerts ? "border-red-200 dark:border-red-900" : "border-border"
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center",
            hasAlerts
              ? "bg-red-100 dark:bg-red-950/40"
              : "bg-emerald-100 dark:bg-emerald-950/40"
          )}
        >
          <Heart
            className={cn("w-4 h-4", hasAlerts ? "text-red-500" : "text-emerald-500")}
            aria-hidden="true"
          />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Saúde</h3>
          <p className={cn("text-xs", hasAlerts ? "text-red-500" : "text-emerald-500")}>
            {hasAlerts
              ? `${saude.alertas.length} alerta${saude.alertas.length > 1 ? "s" : ""}`
              : "Sem alertas"}
          </p>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-muted-foreground text-xs">
            <CalendarDays className="w-3.5 h-3.5" aria-hidden="true" />
            Última consulta
          </span>
          <span className="font-medium text-xs">
            {formatDate(saude.ultima_consulta ?? null)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-muted-foreground text-xs">
            <Syringe className="w-3.5 h-3.5" aria-hidden="true" />
            Vacinas em dia
          </span>
          <span
            className={cn(
              "text-xs font-medium",
              saude.vacinas_em_dia
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-500"
            )}
          >
            {saude.vacinas_em_dia ? "Sim" : "Não"}
          </span>
        </div>
      </div>

      {saude.alertas.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {saude.alertas.map((a) => (
            <AlertBadge key={a} alert={a} />
          ))}
        </div>
      )}
    </div>
  );
}
