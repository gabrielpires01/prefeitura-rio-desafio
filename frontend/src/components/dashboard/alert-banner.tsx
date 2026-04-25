import { AlertTriangle } from "lucide-react";

interface AlertBannerProps {
  totalAlerts: number;
}

export function AlertBanner({ totalAlerts }: AlertBannerProps) {
  if (totalAlerts === 0) return null;

  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
      <AlertTriangle
        className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
        aria-hidden="true"
      />
      <div>
        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
          {totalAlerts}{" "}
          {totalAlerts === 1 ? "criança necessita" : "crianças necessitam"} de
          atenção
        </p>
        <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
          Casos com alertas ativos aguardando revisão técnica
        </p>
      </div>
    </div>
  );
}
