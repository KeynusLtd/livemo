import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, MapPin, Thermometer, Heart } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface AnimalCardProps {
  id: string;
  name: string;
  type: string;
  emoji: string;
  health: number;
  temperature: number;
  heartRate: number;
  location: string;
  status: "healthy" | "warning" | "critical";
}

export function AnimalCard({
  id,
  name,
  type,
  emoji,
  health,
  temperature,
  heartRate,
  location,
  status,
}: AnimalCardProps) {
  const statusVariants = {
    healthy: "bg-success text-success-foreground",
    warning: "bg-warning text-warning-foreground",
    critical: "bg-destructive text-destructive-foreground",
  };

  const statusText = {
    healthy: "Healthy",
    warning: "Needs Attention",
    critical: "Critical",
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{emoji}</div>
            <div>
              <CardTitle className="text-lg">{name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {type} • ID: {id}
              </p>
            </div>
          </div>
          <Badge className={statusVariants[status]}>{statusText[status]}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Overall Health</span>
            <span className="font-medium">{health}%</span>
          </div>
          <Progress value={health} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Thermometer className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Temperature</p>
              <p className="font-medium">{temperature}°C</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Heart className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Heart Rate</p>
              <p className="font-medium">{heartRate} bpm</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <p className="text-muted-foreground">{location}</p>
        </div>

        <Button variant="outline" className="w-full" size="sm">
          <Activity className="mr-2 h-4 w-4" />
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
