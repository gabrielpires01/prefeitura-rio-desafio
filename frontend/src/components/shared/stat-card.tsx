import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  sub?: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

export function StatCard({ label, value, sub, icon: Icon, iconColor, iconBg }: StatCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 flex flex-col gap-3">
      <div
        className={cn("w-9 h-9 rounded-lg flex items-center justify-center", iconBg)}
      >
        <Icon className={cn("w-4 h-4", iconColor)} aria-hidden="true" />
      </div>
      <div>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{label}</p>
      </div>
    </div>
  );
}
