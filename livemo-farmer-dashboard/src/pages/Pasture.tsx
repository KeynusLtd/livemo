import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MapPin, Plus, RefreshCw, Sprout } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useActiveFarm } from "@/hooks/useActiveFarm";
import { listPastures } from "@/lib/pastureApi";
import type { Pasture as PastureType } from "@/lib/pastureApi";

function daysUntil(dateIso?: string | null) {
  if (!dateIso) return null;
  const d = new Date(dateIso);
  const days = Math.round((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return days;
}

export default function Pasture() {
  const { activeFarmId } = useActiveFarm();
  const [page, setPage] = useState(1);

  const pasturesQuery = useQuery({
    queryKey: ["pastures", activeFarmId, page],
    queryFn: () => listPastures({ farmId: activeFarmId as number, page }),
    enabled: activeFarmId != null,
    staleTime: 10_000,
  });

  const pastures: PastureType[] = pasturesQuery.data?.data ?? [];

  const activeCount = useMemo(
    () => pastures.filter((p) => p.is_active).length,
    [pastures]
  );
  const attentionCount = useMemo(() => {
    return pastures.filter((p) => {
      const dueIn = daysUntil(p.next_rotation);
      return typeof dueIn === "number" && dueIn >= 0 && dueIn <= 7;
    }).length;
  }, [pastures]);

  const utilizationAvg = useMemo(() => {
    if (pastures.length === 0) return 0;
    const vals = pastures.map((p) => {
      if (!p.capacity || p.capacity <= 0) return 0;
      const occ = p.current_animals_count ?? 0;
      return Math.round((occ / p.capacity) * 100);
    });
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }, [pastures]);

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
                  <h3 className="mt-2 text-3xl font-bold text-foreground">{utilizationAvg}%</h3>
                  <div className="mt-2">
                    <Progress value={utilizationAvg} className="h-2" />
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
                  <h3 className="mt-2 text-3xl font-bold text-foreground">{activeCount}</h3>
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
                  <h3 className="mt-2 text-3xl font-bold text-foreground">{attentionCount}</h3>
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
            {activeFarmId == null ? (
              <div className="text-sm text-muted-foreground">Select a farm to view pastures.</div>
            ) : pasturesQuery.isLoading ? (
              <div className="text-sm text-muted-foreground">Loading pastures...</div>
            ) : pasturesQuery.isError ? (
              <div className="text-sm text-destructive">
                {pasturesQuery.error instanceof Error
                  ? pasturesQuery.error.message
                  : "Failed to load pastures"}
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {pastures.map((p) => {
                    const utilization = p.capacity > 0 ? Math.round(((p.current_animals_count ?? 0) / p.capacity) * 100) : 0;
                    const dueIn = daysUntil(p.next_rotation);
                    const statusLabel = dueIn != null && dueIn >= 0 && dueIn <= 7 ? "attention" : p.is_active ? "active" : "rest";

                    return (
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
                              {p.current_animals_count ?? 0} animals • {p.notes ?? ""}
                            </p>
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Utilization</span>
                                <span>{utilization}%</span>
                              </div>
                              <Progress value={utilization} className="mt-1 h-2" />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 md:flex md:items-center md:gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Quality</p>
                            <p className="text-sm font-medium">{p.quality ?? "—"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Next rotation</p>
                            <p className="text-sm font-medium">
                              {p.next_rotation ? new Date(p.next_rotation).toLocaleDateString() : "—"}
                            </p>
                          </div>
                          <div className="col-span-2 md:col-span-1">
                            <Badge
                              className={
                                statusLabel === "active"
                                  ? "bg-success text-success-foreground"
                                  : statusLabel === "attention"
                                  ? "bg-warning text-warning-foreground"
                                  : "bg-sky text-white"
                              }
                            >
                              {statusLabel}
                            </Badge>
                          </div>
                          <Button variant="outline" size="sm" disabled>
                            Details
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-sm text-muted-foreground">
                    Page {pasturesQuery.data?.current_page ?? 1} of {pasturesQuery.data?.last_page ?? 1}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={(pasturesQuery.data?.current_page ?? 1) <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={(pasturesQuery.data?.current_page ?? 1) >= (pasturesQuery.data?.last_page ?? 1)}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
