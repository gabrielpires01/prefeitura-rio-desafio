import { Info } from "lucide-react";

interface NoDataCardProps {
  area: string;
}

export function NoDataCard({ area }: NoDataCardProps) {
  return (
    <div className="bg-card border border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3 min-h-[140px]">
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
        <Info className="w-4 h-4 text-muted-foreground/60" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          Sem dados em {area}
        </p>
        <p className="text-xs text-muted-foreground/60 mt-0.5">
          Esta criança não possui registros nesta área
        </p>
      </div>
    </div>
  );
}
