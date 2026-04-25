"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getChildren } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Minus } from "lucide-react";
import { ChildCard } from "@/components/children/child-card";
import { ChildFilters, type Toggle } from "@/components/children/child-filters";
import { ChildPagination } from "@/components/children/child-pagination";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChildrenPage() {
  const [bairro, setBairro] = useState("");
  const [comAlertas, setComAlertas] = useState<Toggle>(undefined);
  const [revisado, setRevisado] = useState<Toggle>(undefined);
  const [page, setPage] = useState(1);

  const resetPage = () => setPage(1);

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

  const handleClear = () => {
    setBairro("");
    setComAlertas(undefined);
    setRevisado(undefined);
    resetPage();
  };

  return (
    <div className="space-y-4 max-w-5xl">
      <div>
        <h1 className="font-display text-2xl font-bold">Crianças</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {data
            ? `${data.total} registro${data.total !== 1 ? "s" : ""} encontrado${data.total !== 1 ? "s" : ""}`
            : "Carregando..."}
        </p>
      </div>

      <ChildFilters
        bairro={bairro}
        comAlertas={comAlertas}
        revisado={revisado}
        onBairroChange={(v) => { setBairro(v); resetPage(); }}
        onComAlertasChange={(v) => { setComAlertas(v); resetPage(); }}
        onRevisadoChange={(v) => { setRevisado(v); resetPage(); }}
        onClear={handleClear}
      />

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : data?.children.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Minus className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Nenhuma criança encontrada</p>
          <p className="text-sm mt-1">Tente ajustar os filtros</p>
        </div>
      ) : (
        <div
          className={cn(
            "grid sm:grid-cols-2 lg:grid-cols-3 gap-3",
            isFetching && "opacity-70 transition-opacity"
          )}
        >
          {data?.children.map((child) => (
            <ChildCard key={child.id} child={child} />
          ))}
        </div>
      )}

      {data && data.total_pages > 1 && (
        <ChildPagination
          page={page}
          totalPages={data.total_pages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
