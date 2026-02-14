import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Radio, Battery, Signal, MapPin, Plus } from "lucide-react";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActiveFarm } from "@/hooks/useActiveFarm";
import { useToast } from "@/hooks/use-toast";
import { listAnimals } from "@/lib/animalApi";
import type { Animal } from "@/lib/animalApi";
import { createSensor, listSensors, updateSensor } from "@/lib/sensorApi";
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
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { activeFarmId } = useActiveFarm();

  const [addOpen, setAddOpen] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [sensorType, setSensorType] = useState("collar");
  const [assignAnimalId, setAssignAnimalId] = useState<number | null>(null);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignSensorId, setAssignSensorId] = useState<number | null>(null);
  const [assignToAnimalId, setAssignToAnimalId] = useState<number | null>(null);

  const animalsQuery = useQuery({
    queryKey: ["sensorAnimals", activeFarmId],
    queryFn: () => listAnimals({ farm_id: activeFarmId ?? undefined, page: 1 }),
    enabled: activeFarmId != null,
    staleTime: 30_000,
  });

  const animals: Animal[] = useMemo(() => animalsQuery.data?.data ?? [], [animalsQuery.data?.data]);

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

  const createMutation = useMutation({
    mutationFn: (payload: { device_id: string; type: string; farm_id: number; animal_id?: number }) =>
      createSensor(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sensors"] });
      toast({ title: "Sensor added" });
      setAddOpen(false);
      setDeviceId("");
      setSensorType("collar");
      setAssignAnimalId(null);
    },
    onError: (err: unknown) => {
      toast({
        variant: "destructive",
        title: "Failed",
        description: err instanceof Error ? err.message : "Failed to add sensor",
      });
    },
  });

  const assignMutation = useMutation({
    mutationFn: (payload: { sensorId: number; animal_id: number | null }) =>
      updateSensor({ sensorId: payload.sensorId, animal_id: payload.animal_id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sensors"] });
      toast({ title: "Sensor updated" });
      setAssignOpen(false);
      setAssignSensorId(null);
      setAssignToAnimalId(null);
    },
    onError: (err: unknown) => {
      toast({
        variant: "destructive",
        title: "Failed",
        description: err instanceof Error ? err.message : "Failed to update sensor",
      });
    },
  });

  const canCreate = activeFarmId != null && deviceId.trim().length > 0 && sensorType.trim().length > 0;
  const canAssign = assignSensorId != null;

  const openAssign = (sensor: Sensor) => {
    setAssignSensorId(sensor.id);
    setAssignToAnimalId(sensor.animal_id ?? null);
    setAssignOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <Dialog
          open={addOpen}
          onOpenChange={(v) => {
            setAddOpen(v);
            if (!v) {
              setDeviceId("");
              setSensorType("collar");
              setAssignAnimalId(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Sensor</DialogTitle>
              <DialogDescription>
                Register a sensor device and optionally assign it to an animal.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Device ID</div>
                <Input
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  placeholder="e.g. SENSOR_COW001"
                />
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Sensor type</div>
                <Select value={sensorType} onValueChange={setSensorType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wearable">wearable</SelectItem>
                    <SelectItem value="collar">collar</SelectItem>
                    <SelectItem value="ear_tag">ear_tag</SelectItem>
                    <SelectItem value="environmental">environmental</SelectItem>
                    <SelectItem value="camera">camera</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Assign to animal (optional)</div>
                <Select
                  value={assignAnimalId != null ? String(assignAnimalId) : ""}
                  onValueChange={(v) => setAssignAnimalId(v ? Number(v) : null)}
                  disabled={animalsQuery.isLoading || animals.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={animals.length === 0 ? "No animals" : "Select animal"} />
                  </SelectTrigger>
                  <SelectContent>
                    {animals.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        {(a.name && a.name.trim().length > 0 ? a.name : "Unnamed") + " • " + a.tag_id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)} disabled={createMutation.isPending}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!canCreate) return;
                  createMutation.mutate({
                    device_id: deviceId.trim(),
                    type: sensorType,
                    farm_id: activeFarmId as number,
                    animal_id: assignAnimalId ?? undefined,
                  });
                }}
                disabled={!canCreate || createMutation.isPending}
              >
                {createMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={assignOpen}
          onOpenChange={(v) => {
            setAssignOpen(v);
            if (!v) {
              setAssignSensorId(null);
              setAssignToAnimalId(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Sensor</DialogTitle>
              <DialogDescription>
                Choose which animal this sensor belongs to (or set it as unassigned).
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <div className="text-sm font-medium">Animal</div>
              <Select
                value={assignToAnimalId != null ? String(assignToAnimalId) : ""}
                onValueChange={(v) => setAssignToAnimalId(v ? Number(v) : null)}
                disabled={animalsQuery.isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  {animals.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {(a.name && a.name.trim().length > 0 ? a.name : "Unnamed") + " • " + a.tag_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAssignOpen(false)} disabled={assignMutation.isPending}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!canAssign) return;
                  assignMutation.mutate({
                    sensorId: assignSensorId as number,
                    animal_id: assignToAnimalId,
                  });
                }}
                disabled={!canAssign || assignMutation.isPending}
              >
                {assignMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Sensors</h1>
            <p className="text-muted-foreground">
              Monitor and manage IoT sensors across your livestock
            </p>
          </div>
          <Button
            className="bg-gradient-earth text-white shadow-md hover:opacity-90"
            onClick={() => setAddOpen(true)}
            disabled={activeFarmId == null}
          >
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

                        <Button variant="outline" size="sm" onClick={() => openAssign(sensor)}>
                          {sensor.animal_id ? "Change" : "Assign"}
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
