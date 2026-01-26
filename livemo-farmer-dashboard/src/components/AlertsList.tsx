import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Check, X } from "lucide-react";
import type { Alert } from "@/lib/alertApi";

function normalizeSeverity(severity?: string | null): "critical" | "warning" | "info" {
  const v = (severity ?? "").toLowerCase();
  if (v === "critical" || v === "severe") return "critical";
  if (v === "warning" || v === "moderate" || v === "mild") return "warning";
  return "info";
}

export function AlertsList({ alerts }: { alerts: Alert[] }) {
  const typeStyles: Record<"critical" | "warning" | "info", string> = {
    critical: "border-l-4 border-l-destructive bg-destructive/5",
    warning: "border-l-4 border-l-warning bg-warning/5",
    info: "border-l-4 border-l-sky bg-sky/5",
  };

  const badgeStyles: Record<"critical" | "warning" | "info", string> = {
    critical: "bg-destructive text-destructive-foreground",
    warning: "bg-warning text-warning-foreground",
    info: "bg-sky text-white",
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Recent Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => {
          const type = normalizeSeverity(alert.severity);
          const time = alert.created_at ? new Date(alert.created_at).toLocaleString() : "";
          const animalLabel = alert.animal
            ? `${alert.animal.name && alert.animal.name.trim().length > 0 ? alert.animal.name : "Unnamed"} • ${alert.animal.tag_id}`
            : undefined;

          return (
          <div
            key={alert.id}
            className={`rounded-lg p-4 ${typeStyles[type]}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{alert.title}</h4>
                  <Badge variant="outline" className={badgeStyles[type]}>
                    {type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{alert.message}</p>
                {animalLabel && (
                  <p className="text-xs text-muted-foreground">{animalLabel}</p>
                )}
                {time && <p className="text-xs text-muted-foreground">{time}</p>}
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                  <Check className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
