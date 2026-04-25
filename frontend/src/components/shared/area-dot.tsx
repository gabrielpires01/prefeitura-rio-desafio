import { cn } from "@/lib/utils";

interface AreaDotProps {
  present: boolean;
  hasAlert: boolean;
  icon: React.ElementType;
  label?: string;
}

export function AreaDot({ present, hasAlert, icon: Icon, label }: AreaDotProps) {
  const colorClass = !present
    ? "text-muted-foreground/30"
    : hasAlert
    ? "text-red-500"
    : "text-emerald-500";

  return (
    <Icon
      className={cn("w-3.5 h-3.5", colorClass)}
      aria-label={label}
      aria-hidden={!label}
    />
  );
}
