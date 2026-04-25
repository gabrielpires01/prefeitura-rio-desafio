"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { getChild, reviewChild } from "@/lib/api";
import { calcAge, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SaudeCard } from "@/components/children/area-cards/saude-card";
import { EducacaoCard } from "@/components/children/area-cards/educacao-card";
import { AssistenciaCard } from "@/components/children/area-cards/assistencia-card";
import { NoDataCard } from "@/components/shared/no-data-card";

function LoadingSkeleton() {
  return (
    <div className="max-w-3xl space-y-6">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-24 rounded-xl" />
      <div className="grid sm:grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
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

  if (isLoading) return <LoadingSkeleton />;
  if (!child) return <p className="text-muted-foreground">Criança não encontrada.</p>;

  const age = calcAge(child.data_nascimento);
  const isReviewed = child.revisado || reviewed;

  return (
    <div className="max-w-3xl space-y-5">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="gap-2 text-muted-foreground hover:text-foreground -ml-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Button>

      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-primary" aria-hidden="true" />
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
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  Revisado
                </span>
                {child.revisado_por && (
                  <p className="text-xs text-muted-foreground text-right">
                    por {child.revisado_por}
                    {child.revisado_em && (
                      <>
                        <br />
                        {formatDate(child.revisado_em)}
                      </>
                    )}
                  </p>
                )}
              </div>
            ) : (
              <Button
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending}
                className="gap-2"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                    Marcar como revisado
                  </>
                )}
              </Button>
            )}

            {mutation.isError && (
              <p className="text-xs text-destructive">
                Erro ao salvar. Tente novamente.
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border flex items-center gap-4 text-xs text-muted-foreground">
          <span>Nascimento: {formatDate(child.data_nascimento)}</span>
          <span>ID: {child.id}</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {child.saude ? (
          <SaudeCard saude={child.saude} />
        ) : (
          <NoDataCard area="Saúde" />
        )}
        {child.educacao ? (
          <EducacaoCard educacao={child.educacao} />
        ) : (
          <NoDataCard area="Educação" />
        )}
        {child.assistencia_social ? (
          <AssistenciaCard assistencia={child.assistencia_social} />
        ) : (
          <NoDataCard area="Assistência Social" />
        )}
      </div>
    </div>
  );
}
