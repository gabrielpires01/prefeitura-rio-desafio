import Link from "next/link";
import { AlertTriangle, CheckCircle2, Heart, BookOpen, HandHeart } from "lucide-react";
import { calcAge, cn } from "@/lib/utils";
import { AreaDot } from "@/components/shared/area-dot";
import type { Child } from "@/types";

function countAlerts(child: Child): number {
  return (
    (child.saude?.alertas.length ?? 0) +
    (child.educacao?.alertas.length ?? 0) +
    (child.assistencia_social?.alertas.length ?? 0)
  );
}

interface ChildCardProps {
  child: Child;
}

export function ChildCard({ child }: ChildCardProps) {
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
              <AlertTriangle className="w-3 h-3" aria-hidden="true" />
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
        <span className={cn("flex items-center gap-1")}>
          <AreaDot
            present={!!child.saude}
            hasAlert={(child.saude?.alertas.length ?? 0) > 0}
            icon={Heart}
          />
          Saúde
        </span>
        <span className="flex items-center gap-1">
          <AreaDot
            present={!!child.educacao}
            hasAlert={(child.educacao?.alertas.length ?? 0) > 0}
            icon={BookOpen}
          />
          Educ.
        </span>
        <span className="flex items-center gap-1">
          <AreaDot
            present={!!child.assistencia_social}
            hasAlert={(child.assistencia_social?.alertas.length ?? 0) > 0}
            icon={HandHeart}
          />
          Assist.
        </span>
        {child.revisado && (
          <span className="flex items-center gap-1 ml-auto text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            Revisado
          </span>
        )}
      </div>
    </Link>
  );
}
