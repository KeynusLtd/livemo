import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MapPin, Plus, RefreshCw, Sprout } from "lucide-react";

const paddocks = [
  {
    id: "PAD-01",
    name: "Pasture A",
    utilization: 78,
    forage: "Good",
    water: "OK",
    status: "active" as const,
    animals: 64,
    notes: "Rotate in 5 days",
  },
  {
    id: "PAD-02",
    name: "Pasture B",
    utilization: 56,
    forage: "Excellent",
    water: "Good",
    status: "rest" as const,
    animals: 0,
    notes: "Resting / regrowth",
  },
  {
    id: "PAD-03",
    name: "Pasture C",
    utilization: 83,
    forage: "Fair",
    water: "Low",
    status: "attention" as const,
    animals: 42,
    notes: "Check water line",
  },
];

export default function Pasture() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Pasture</h1>
            <p className="text-muted-foreground">
              Track pasture utilization and plan rotations
            </p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row">
            <Button variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button className="bg-gradient-earth text-white shadow-md hover:opacity-90">
              <Plus className="mr-2 h-4 w-4" />
              Add Paddock
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Utilization (Avg)
                  </p>
                  <h3 className="mt-2 text-3xl font-bold text-foreground">72%</h3>
                  <div className="mt-2">
                    <Progress value={72} className="h-2" />
                  </div>
                </div>
                <div className="rounded-lg bg-gradient-pasture p-3 text-white">
                  <Sprout className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Active Paddocks</p>
                  <h3 className="mt-2 text-3xl font-bold text-foreground">1</h3>
                  <Badge className="mt-2 bg-success text-success-foreground">On Plan</Badge>
                </div>
                <div className="rounded-lg bg-gradient-earth p-3 text-white">
                  <MapPin className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Items to Check</p>
                  <h3 className="mt-2 text-3xl font-bold text-foreground">1</h3>
                  <Badge className="mt-2 bg-warning text-warning-foreground">Attention</Badge>
                </div>
                <div className="rounded-lg bg-warning p-3 text-white">
                  <MapPin className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Paddocks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paddocks.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col gap-4 rounded-lg border border-border p-4 md:flex-row md:items-center"
                >
                  <div className="flex flex-1 items-center gap-3">
                    <div className="rounded-lg bg-muted p-3">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{p.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {p.animals} animals • {p.notes}
                      </p>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Utilization</span>
                          <span>{p.utilization}%</span>
                        </div>
                        <Progress value={p.utilization} className="mt-1 h-2" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:flex md:items-center md:gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Forage</p>
                      <p className="text-sm font-medium">{p.forage}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Water</p>
                      <p className="text-sm font-medium">{p.water}</p>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <Badge
                        className={
                          p.status === "active"
                            ? "bg-success text-success-foreground"
                            : p.status === "attention"
                            ? "bg-warning text-warning-foreground"
                            : "bg-sky text-white"
                        }
                      >
                        {p.status}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
