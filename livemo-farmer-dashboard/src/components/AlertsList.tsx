import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Check, X } from "lucide-react";

interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  message: string;
  time: string;
  animalId?: string;
}

const mockAlerts: Alert[] = [
  {
    id: "1",
    type: "critical",
    title: "High Temperature Alert",
    message: "Cow #247 has elevated temperature (40.5°C)",
    time: "5 mins ago",
    animalId: "247",
  },
  {
    id: "2",
    type: "warning",
    title: "Low Feed Level",
    message: "Pasture A feed level below 20%",
    time: "1 hour ago",
  },
  {
    id: "3",
    type: "info",
    title: "Vaccination Due",
    message: "3 animals due for vaccination this week",
    time: "2 hours ago",
  },
];

export function AlertsList() {
  const typeStyles = {
    critical: "border-l-4 border-l-destructive bg-destructive/5",
    warning: "border-l-4 border-l-warning bg-warning/5",
    info: "border-l-4 border-l-sky bg-sky/5",
  };

  const badgeStyles = {
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
        {mockAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-lg p-4 ${typeStyles[alert.type]}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{alert.title}</h4>
                  <Badge variant="outline" className={badgeStyles[alert.type]}>
                    {alert.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{alert.message}</p>
                <p className="text-xs text-muted-foreground">{alert.time}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Check className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
