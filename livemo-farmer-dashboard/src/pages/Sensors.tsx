import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Radio, Battery, Signal, MapPin, Plus } from "lucide-react";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useActiveFarm } from "@/hooks/useActiveFarm";
import { listSensors } from "@/lib/sensorApi";
import type { Sensor } from "@/lib/sensorApi";

function minutesAgoLabel(iso?: string | null) {
  if (!iso) return "Never";
  const t = new Date(iso).getTime();
  const mins = Math.max(0, Math.round((Date.now() - t) / 60000));
  if (mins <= 1) return "Just now";
  if (mins < 60) return `${mins} mins ago`;
  const hrs = Math.round(mins / 60);
  return `${hrs} hrs ago`;
}

function isOnline(sensor: Sensor) {
  if (sensor.status !== "active") return false;
  if (!sensor.last_communication) return false;
  const mins = (Date.now() - new Date(sensor.last_communication).getTime()) / 60000;
  return mins <= 30;
}

export default function Sensors() {
  const { activeFarmId } = useActiveFarm();

  const sensorsQuery = useQuery({
    queryKey: ["sensors", activeFarmId],
    queryFn: () => listSensors({ farm_id: activeFarmId ?? undefined, page: 1 }),
    enabled: activeFarmId != null,
    staleTime: 10_000,
  });

  const sensors: Sensor[] = useMemo(() => sensorsQuery.data?.data ?? [], [sensorsQuery.data?.data]);

  const onlineCount = useMemo(() => sensors.filter((s) => isOnline(s)).length, [sensors]);
  const avgBattery = useMemo(() => {
    const vals = sensors.map((s) => s.battery_level).filter((v): v is number => typeof v === "number");
    if (vals.length === 0) return 0;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }, [sensors]);

  const onlinePercent = sensors.length > 0 ? Math.round((onlineCount / sensors.length) * 100) : 0;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Sensors</h1>
            <p className="text-muted-foreground">
              Monitor and manage IoT sensors across your livestock
            </p>
          </div>
          <Button className="bg-gradient-earth text-white shadow-md hover:opacity-90">
            <Plus className="mr-2 h-4 w-4" />
            Add Sensor
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Sensors
                  </p>
                  <h3 className="mt-2 text-3xl font-bold text-foreground">
                    {onlineCount}/{sensors.length}
                  </h3>
                  <Badge className="mt-2 bg-success text-success-foreground">
                    {onlinePercent >= 90 ? "All Online" : "Partial"}
                  </Badge>
                </div>
                <div className="rounded-lg bg-gradient-earth p-3 text-white">
                  <Radio className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Average Battery
                  </p>
                  <h3 className="mt-2 text-3xl font-bold text-foreground">
                    {avgBattery}%
                  </h3>
                  <div className="mt-2">
                    <Progress value={avgBattery} className="h-2" />
                  </div>
                </div>
                <div className="rounded-lg bg-gradient-pasture p-3 text-white">
                  <Battery className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Average Signal
                  </p>
                  <h3 className="mt-2 text-3xl font-bold text-foreground">
                    {onlinePercent}%
                  </h3>
                  <Badge className="mt-2 bg-success text-success-foreground">
                    {onlinePercent >= 90 ? "Excellent" : onlinePercent >= 60 ? "Good" : "Low"}
                  </Badge>
                </div>
                <div className="rounded-lg bg-sky p-3 text-white">
                  <Signal className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sensors List */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>All Sensors</CardTitle>
          </CardHeader>
          <CardContent>
            {activeFarmId == null ? (
              <div className="text-sm text-muted-foreground">Select a farm to view sensors.</div>
            ) : sensorsQuery.isLoading ? (
              <div className="text-sm text-muted-foreground">Loading sensors...</div>
            ) : sensorsQuery.isError ? (
              <div className="text-sm text-destructive">
                {sensorsQuery.error instanceof Error
                  ? sensorsQuery.error.message
                  : "Failed to load sensors"}
              </div>
            ) : (
              <div className="space-y-3">
                {sensors.map((sensor) => {
                  const online = isOnline(sensor);
                  const signalPct = online ? 100 : 0;

                  const animalLabel = sensor.animal
                    ? `${sensor.animal.name && sensor.animal.name.trim().length > 0 ? sensor.animal.name : "Unnamed"} (${sensor.animal.tag_id})`
                    : "Unassigned";

                  return (
                    <div
                      key={sensor.id}
                      className="flex flex-col gap-4 rounded-lg border border-border p-4 md:flex-row md:items-center"
                    >
                      <div className="flex flex-1 items-center gap-4">
                        <div className="rounded-lg bg-muted p-3">
                          <Radio className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{sensor.device_id}</h4>
                          <p className="text-sm text-muted-foreground">
                            {animalLabel} • {sensor.type}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 md:flex md:items-center md:gap-6">
                        <div className="flex items-center gap-2">
                          <Battery
                            className={`h-4 w-4 ${
                              (sensor.battery_level ?? 0) > 50
                                ? "text-success"
                                : (sensor.battery_level ?? 0) > 20
                                ? "text-warning"
                                : "text-destructive"
                            }`}
                          />
                          <div>
                            <p className="text-xs text-muted-foreground">Battery</p>
                            <p className="text-sm font-medium">{sensor.battery_level ?? "—"}%</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Signal className={`h-4 w-4 ${online ? "text-success" : "text-warning"}`} />
                          <div>
                            <p className="text-xs text-muted-foreground">Signal</p>
                            <p className="text-sm font-medium">{signalPct}%</p>
                          </div>
                        </div>

                        <div className="col-span-2 md:col-span-1">
                          <Badge
                            className={
                              online
                                ? "bg-success text-success-foreground"
                                : "bg-warning text-warning-foreground"
                            }
                          >
                            {online ? "online" : "offline"}
                          </Badge>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {minutesAgoLabel(sensor.last_communication)}
                          </p>
                        </div>

                        <Button variant="outline" size="sm">
                          <MapPin className="mr-2 h-4 w-4" />
                          Track
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
