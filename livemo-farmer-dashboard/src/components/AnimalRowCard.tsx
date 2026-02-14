import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Animal } from "@/lib/animalApi";
import { useNavigate } from "react-router-dom";

function statusLabel(status: Animal["status"]) {
  switch (status) {
    case "healthy":
      return "Healthy";
    case "sick":
      return "Sick";
    case "quarantine":
      return "Quarantine";
    case "deceased":
      return "Deceased";
    case "sold":
      return "Sold";
    default:
      return status;
  }
}

function statusClassName(status: Animal["status"]) {
  switch (status) {
    case "healthy":
      return "bg-success text-success-foreground";
    case "sick":
    case "quarantine":
      return "bg-warning text-warning-foreground";
    case "deceased":
      return "bg-destructive text-destructive-foreground";
    case "sold":
      return "bg-muted text-foreground";
    default:
      return "bg-muted text-foreground";
  }
}

export function AnimalRowCard({ animal }: { animal: Animal }) {
  const name = animal.name && animal.name.trim().length > 0 ? animal.name : "Unnamed";
  const navigate = useNavigate();

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">{name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {animal.type} • Tag: {animal.tag_id}
            </p>
          </div>
          <Badge className={statusClassName(animal.status)}>{statusLabel(animal.status)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Health score</span>
          <span className="font-medium">{animal.health_score ?? "—"}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => navigate(`/animals/${animal.id}`)}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
