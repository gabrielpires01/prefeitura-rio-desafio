import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { labelAlert } from "@/lib/utils";

interface AlertBadgeProps {
  alert: string;
}

export function AlertBadge({ alert }: AlertBadgeProps) {
  return (
    <Badge variant="danger">
      <AlertTriangle className="w-3 h-3" aria-hidden="true" />
      {labelAlert(alert)}
    </Badge>
  );
}
