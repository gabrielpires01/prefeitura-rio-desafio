import { Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type Toggle = true | false | undefined;

export function cycleToggle(v: Toggle): Toggle {
  if (v === undefined) return true;
  if (v === true) return false;
  return undefined;
}

function toggleLabel(v: Toggle, yes: string, no: string): string {
  if (v === true) return yes;
  if (v === false) return no;
  return "Todos";
}

const BAIRROS = [
  "Rocinha",
  "Maré",
  "Jacarezinho",
  "Complexo do Alemão",
  "Mangueira",
];

interface ChildFiltersProps {
  bairro: string;
  comAlertas: Toggle;
  revisado: Toggle;
  onBairroChange: (value: string) => void;
  onComAlertasChange: (value: Toggle) => void;
  onRevisadoChange: (value: Toggle) => void;
  onClear: () => void;
}

export function ChildFilters({
  bairro,
  comAlertas,
  revisado,
  onBairroChange,
  onComAlertasChange,
  onRevisadoChange,
  onClear,
}: ChildFiltersProps) {
  const hasActiveFilters =
    bairro !== "" || comAlertas !== undefined || revisado !== undefined;

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3 text-xs font-medium text-muted-foreground">
        <Filter className="w-3.5 h-3.5" aria-hidden="true" />
        Filtros
      </div>
      <div className="flex flex-wrap gap-2">
        <select
          value={bairro}
          onChange={(e) => onBairroChange(e.target.value)}
          aria-label="Filtrar por bairro"
          className={cn(
            "px-3 py-1.5 rounded-lg border text-sm bg-background",
            "focus:outline-none focus:ring-2 focus:ring-ring",
            bairro
              ? "border-primary text-primary font-medium"
              : "border-border"
          )}
        >
          <option value="">Todos os bairros</option>
          {BAIRROS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        <button
          onClick={() => onComAlertasChange(cycleToggle(comAlertas))}
          aria-label="Filtrar por alertas"
          className={cn(
            "px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors",
            comAlertas === true &&
              "bg-red-100 dark:bg-red-950/40 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400",
            comAlertas === false &&
              "bg-emerald-100 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400",
            comAlertas === undefined && "bg-background border-border text-foreground"
          )}
        >
          {toggleLabel(comAlertas, "Com alertas", "Sem alertas")}
        </button>

        <button
          onClick={() => onRevisadoChange(cycleToggle(revisado))}
          aria-label="Filtrar por revisão"
          className={cn(
            "px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors",
            revisado === true &&
              "bg-emerald-100 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400",
            revisado === false &&
              "bg-amber-100 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400",
            revisado === undefined && "bg-background border-border text-foreground"
          )}
        >
          {toggleLabel(revisado, "Revisados", "Não revisados")}
        </button>

        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={onClear}>
            Limpar
          </Button>
        )}
      </div>
    </div>
  );
}
