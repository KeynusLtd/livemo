import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getAnimal, getAnimalHealth } from "@/lib/animalApi";
import type { AnimalHealthResponse } from "@/lib/animalApi";
import { listAlerts } from "@/lib/alertApi";
import { listAnimalBreedingRecords } from "@/lib/breedingApi";
import type { BreedingRecord } from "@/lib/breedingApi";
import { getSensorReadings } from "@/lib/sensorApi";
import {
  createAnimalVaccination,
  deleteVaccination,
  listAnimalVaccinations,
  updateVaccination,
} from "@/lib/vaccinationApi";
import type { Vaccination } from "@/lib/vaccinationApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function statusBadgeClass(status?: string | null) {
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

function chartLabel(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString();
}

export default function AnimalProfile() {
  const { id } = useParams();
  const animalId = useMemo(() => (id ? Number(id) : NaN), [id]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [sensorWindow, setSensorWindow] = useState<"24h" | "7d">("24h");

  const [vaccinationDialogOpen, setVaccinationDialogOpen] = useState(false);
  const [vaccinationMode, setVaccinationMode] = useState<"create" | "edit">("create");
  const [activeVaccination, setActiveVaccination] = useState<Vaccination | null>(null);

  const [vaccineName, setVaccineName] = useState("");
  const [administeredDate, setAdministeredDate] = useState("");
  const [nextDueDate, setNextDueDate] = useState("");
  const [administeredBy, setAdministeredBy] = useState("");
  const [notes, setNotes] = useState("");

  const animalQuery = useQuery({
    queryKey: ["animal", animalId],
    queryFn: () => getAnimal({ animalId }),
    enabled: Number.isFinite(animalId),
    staleTime: 10_000,
  });

  const vaccinationsQuery = useQuery({
    queryKey: ["animalVaccinations", animalId],
    queryFn: () => listAnimalVaccinations({ animalId, page: 1 }),
    enabled: Number.isFinite(animalId),
    staleTime: 10_000,
  });

  const healthQuery = useQuery({
    queryKey: ["animalHealth", animalId],
    queryFn: () => getAnimalHealth({ animalId, page: 1 }),
    enabled: Number.isFinite(animalId),
    staleTime: 10_000,
  });

  const sensors = useMemo(() => animalQuery.data?.sensors ?? [], [animalQuery.data?.sensors]);
  const primarySensorId = sensors.length > 0 ? sensors[0].id : null;

  const breedingQuery = useQuery({
    queryKey: ["animalBreedingRecords", animalId],
    queryFn: () => listAnimalBreedingRecords({ animalId, page: 1 }),
    enabled: Number.isFinite(animalId),
    staleTime: 10_000,
  });

  const alertsQuery = useQuery({
    queryKey: ["animalAlerts", animalId],
    queryFn: () => listAlerts({ animal_id: animalId, page: 1 }),
    enabled: Number.isFinite(animalId),
    staleTime: 10_000,
  });

  const readingsQuery = useQuery({
    queryKey: ["sensorReadings", primarySensorId, sensorWindow],
    queryFn: () => {
      const now = new Date();
      const from = new Date(now.getTime() - (sensorWindow === "24h" ? 24 : 7 * 24) * 60 * 60 * 1000);
      return getSensorReadings({
        sensorId: primarySensorId as number,
        from: from.toISOString(),
        to: now.toISOString(),
        limit: sensorWindow === "24h" ? 200 : 2000,
      });
    },
    enabled: primarySensorId != null,
    staleTime: 10_000,
  });

  const sensorPoints = useMemo(() => {
    const readings = readingsQuery.data?.readings ?? [];
    return readings
      .filter((r) => r.recorded_at)
      .map((r) => ({
        t: chartLabel(r.recorded_at),
        temperature: r.temperature ?? null,
        movement: r.activity_level ?? null,
      }));
  }, [readingsQuery.data?.readings]);

  const vaccinations = useMemo(() => vaccinationsQuery.data?.data ?? [], [vaccinationsQuery.data?.data]);

  const breedingRecords = useMemo(
    () => (breedingQuery.data?.data ?? []) as BreedingRecord[],
    [breedingQuery.data?.data]
  );

  const animalAlerts = useMemo(() => alertsQuery.data?.data ?? [], [alertsQuery.data?.data]);

  const healthRecords = useMemo(
    () => (healthQuery.data as AnimalHealthResponse | undefined)?.health_records.data ?? [],
    [healthQuery.data]
  );

  const createVaccinationMutation = useMutation({
    mutationFn: () =>
      createAnimalVaccination({
        animalId,
        vaccine_name: vaccineName.trim(),
        administered_date: administeredDate,
        next_due_date: nextDueDate.trim().length > 0 ? nextDueDate.trim() : null,
        administered_by: administeredBy.trim().length > 0 ? administeredBy.trim() : null,
        notes: notes.trim().length > 0 ? notes.trim() : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animalVaccinations", animalId] });
      queryClient.invalidateQueries({ queryKey: ["animal", animalId] });
      toast({ title: "Vaccination added" });
      setVaccinationDialogOpen(false);
    },
    onError: (err: unknown) => {
      toast({
        variant: "destructive",
        title: "Failed",
        description: err instanceof Error ? err.message : "Failed to add vaccination",
      });
    },
  });

  const updateVaccinationMutation = useMutation({
    mutationFn: () =>
      updateVaccination({
        vaccinationId: activeVaccination?.id as number,
        vaccine_name: vaccineName.trim().length > 0 ? vaccineName.trim() : undefined,
        administered_date: administeredDate || undefined,
        next_due_date: nextDueDate.trim().length > 0 ? nextDueDate.trim() : null,
        administered_by: administeredBy.trim().length > 0 ? administeredBy.trim() : null,
        notes: notes.trim().length > 0 ? notes.trim() : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animalVaccinations", animalId] });
      queryClient.invalidateQueries({ queryKey: ["animal", animalId] });
      toast({ title: "Vaccination updated" });
      setVaccinationDialogOpen(false);
    },
    onError: (err: unknown) => {
      toast({
        variant: "destructive",
        title: "Failed",
        description: err instanceof Error ? err.message : "Failed to update vaccination",
      });
    },
  });

  const deleteVaccinationMutation = useMutation({
    mutationFn: (vaccinationId: number) => deleteVaccination(vaccinationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animalVaccinations", animalId] });
      queryClient.invalidateQueries({ queryKey: ["animal", animalId] });
      toast({ title: "Vaccination deleted" });
    },
    onError: (err: unknown) => {
      toast({
        variant: "destructive",
        title: "Failed",
        description: err instanceof Error ? err.message : "Failed to delete vaccination",
      });
    },
  });

  function openVaccinationCreate() {
    setVaccinationMode("create");
    setActiveVaccination(null);
    setVaccineName("");
    setAdministeredDate(new Date().toISOString().slice(0, 10));
    setNextDueDate("");
    setAdministeredBy("");
    setNotes("");
    setVaccinationDialogOpen(true);
  }

  function openVaccinationEdit(v: Vaccination) {
    setVaccinationMode("edit");
    setActiveVaccination(v);
    setVaccineName(v.vaccine_name ?? "");
    setAdministeredDate(v.administered_date ? String(v.administered_date).slice(0, 10) : "");
    setNextDueDate(v.next_due_date ? String(v.next_due_date).slice(0, 10) : "");
    setAdministeredBy(v.administered_by ?? "");
    setNotes(v.notes ?? "");
    setVaccinationDialogOpen(true);
  }

  return (
    <Layout>
      <div className="space-y-6">
        {animalQuery.isLoading ? (
          <div className="text-sm text-muted-foreground">Loading animal...</div>
        ) : animalQuery.isError ? (
          <div className="text-sm text-destructive">
            {animalQuery.error instanceof Error ? animalQuery.error.message : "Failed to load animal"}
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {(animalQuery.data?.name && animalQuery.data.name.trim().length > 0
                    ? animalQuery.data.name
                    : "Unnamed") + " • " + (animalQuery.data?.tag_id ?? "")}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge className={statusBadgeClass(animalQuery.data?.status)}>
                    {animalQuery.data?.status ?? "unknown"}
                  </Badge>
                  <Badge variant="outline">{animalQuery.data?.type ?? ""}</Badge>
                  <Badge variant="outline">Health score: {animalQuery.data?.health_score ?? "—"}</Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate("/animals")}>
                  Back
                </Button>
                <Button onClick={() => navigate(`/animals/${animalId}/edit`)}>Edit</Button>
              </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="health">Health</TabsTrigger>
                <TabsTrigger value="vaccination">Vaccination</TabsTrigger>
                <TabsTrigger value="breeding">Breeding</TabsTrigger>
                <TabsTrigger value="sensors">Sensors</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle>Basic info</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-3">
                    <div>
                      <div className="text-xs text-muted-foreground">ID</div>
                      <div className="text-sm font-medium">{animalQuery.data?.id}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Breed</div>
                      <div className="text-sm font-medium">{animalQuery.data?.breed ?? "—"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Birth date</div>
                      <div className="text-sm font-medium">
                        {animalQuery.data?.birth_date ? new Date(animalQuery.data.birth_date).toLocaleDateString() : "—"}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle>Linked sensors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {sensors.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No sensors assigned.</div>
                    ) : (
                      <div className="space-y-2">
                        {sensors.map((s) => (
                          <div key={s.id} className="flex items-center justify-between rounded border border-border p-3">
                            <div>
                              <div className="text-sm font-medium">{s.device_id}</div>
                              <div className="text-xs text-muted-foreground">{s.type}</div>
                            </div>
                            <Badge variant="outline">Battery: {s.battery_level ?? "—"}%</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="health" className="space-y-4">
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle>Recent health records</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {healthQuery.isLoading ? (
                      <div className="text-sm text-muted-foreground">Loading health records...</div>
                    ) : healthQuery.isError ? (
                      <div className="text-sm text-destructive">
                        {healthQuery.error instanceof Error ? healthQuery.error.message : "Failed to load health"}
                      </div>
                    ) : healthRecords.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No health records.</div>
                    ) : (
                      <div className="space-y-2">
                        {healthRecords.slice(0, 10).map((r) => (
                          <div key={r.id} className="flex flex-col gap-1 rounded border border-border p-3 md:flex-row md:items-center md:justify-between">
                            <div>
                              <div className="text-sm font-medium">{r.record_type}</div>
                              <div className="text-xs text-muted-foreground">
                                {r.created_at ? new Date(r.created_at).toLocaleString() : ""}
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Temp: {r.temperature ?? "—"} • HR: {r.heart_rate ?? "—"} • Activity: {r.activity_level ?? "—"}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="vaccination" className="space-y-4">
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle>Vaccination history</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {vaccinationsQuery.isLoading ? (
                      <div className="text-sm text-muted-foreground">Loading vaccinations...</div>
                    ) : vaccinationsQuery.isError ? (
                      <div className="text-sm text-destructive">
                        {vaccinationsQuery.error instanceof Error
                          ? vaccinationsQuery.error.message
                          : "Failed to load vaccinations"}
                      </div>
                    ) : vaccinations.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No vaccinations recorded.</div>
                    ) : (
                      <div className="space-y-2">
                        {vaccinations.map((v) => (
                          <div
                            key={v.id}
                            className="flex flex-col gap-3 rounded border border-border p-3 md:flex-row md:items-center md:justify-between"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-medium">{v.vaccine_name}</div>
                                <Badge variant="outline">
                                  {v.administered_date
                                    ? new Date(v.administered_date).toLocaleDateString()
                                    : "—"}
                                </Badge>
                              </div>
                              <div className="mt-1 text-xs text-muted-foreground">
                                Next due: {v.next_due_date ? new Date(v.next_due_date).toLocaleDateString() : "—"}
                                {v.administered_by ? ` • By: ${v.administered_by}` : ""}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => openVaccinationEdit(v)}>
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const ok = window.confirm("Delete this vaccination record?");
                                  if (!ok) return;
                                  deleteVaccinationMutation.mutate(v.id);
                                }}
                                disabled={deleteVaccinationMutation.isPending}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" onClick={openVaccinationCreate}>
                        Add vaccination
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="breeding" className="space-y-4">
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle>Breeding</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="text-xs text-muted-foreground">Mother</div>
                      <div className="text-sm font-medium">
                        {animalQuery.data?.mother ? `${animalQuery.data.mother.tag_id} (${animalQuery.data.mother.name ?? "Unnamed"})` : "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Father</div>
                      <div className="text-sm font-medium">
                        {animalQuery.data?.father ? `${animalQuery.data.father.tag_id} (${animalQuery.data.father.name ?? "Unnamed"})` : "—"}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle>Breeding history</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {breedingQuery.isLoading ? (
                      <div className="text-sm text-muted-foreground">Loading breeding records...</div>
                    ) : breedingQuery.isError ? (
                      <div className="text-sm text-destructive">
                        {breedingQuery.error instanceof Error ? breedingQuery.error.message : "Failed to load breeding records"}
                      </div>
                    ) : breedingRecords.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No breeding records found.</div>
                    ) : (
                      <div className="space-y-2">
                        {breedingRecords.slice(0, 10).map((r) => (
                          <div key={r.id} className="rounded border border-border p-3">
                            <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                              <div className="text-sm font-medium">
                                {formatDate(r.breeding_date)} • {r.method}
                              </div>
                              <Badge variant="outline">{r.status ?? "—"}</Badge>
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              Mother: {r.mother ? `${r.mother.tag_id} (${r.mother.name ?? "Unnamed"})` : "—"}
                              {r.father ? ` • Father: ${r.father.tag_id} (${r.father.name ?? "Unnamed"})` : ""}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              Expected birth: {formatDate(r.expected_birth_date)} • Actual birth: {formatDate(r.actual_birth_date)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle>Alert history</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {alertsQuery.isLoading ? (
                      <div className="text-sm text-muted-foreground">Loading alerts...</div>
                    ) : alertsQuery.isError ? (
                      <div className="text-sm text-destructive">
                        {alertsQuery.error instanceof Error ? alertsQuery.error.message : "Failed to load alerts"}
                      </div>
                    ) : animalAlerts.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No alerts for this animal.</div>
                    ) : (
                      <div className="space-y-2">
                        {animalAlerts.slice(0, 10).map((a) => (
                          <div key={a.id} className="rounded border border-border p-3">
                            <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                              <div className="text-sm font-medium">{a.title}</div>
                              <div className="flex gap-2">
                                <Badge variant="outline">{a.severity}</Badge>
                                <Badge variant="outline">{a.status}</Badge>
                              </div>
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">{a.message}</div>
                            <div className="mt-1 text-xs text-muted-foreground">{a.created_at ? new Date(a.created_at).toLocaleString() : ""}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 text-xs text-muted-foreground">
                      Actions log can be linked later via <code>GET /api/v1/alerts/{`{id}`}/actions</code>.
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sensors" className="space-y-4">
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <span>Sensor trends</span>
                      <div className="flex gap-2">
                        <Button
                          variant={sensorWindow === "24h" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSensorWindow("24h")}
                        >
                          24h
                        </Button>
                        <Button
                          variant={sensorWindow === "7d" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSensorWindow("7d")}
                        >
                          7d
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {primarySensorId == null ? (
                      <div className="text-sm text-muted-foreground">No sensor assigned.</div>
                    ) : readingsQuery.isLoading ? (
                      <div className="text-sm text-muted-foreground">Loading sensor readings...</div>
                    ) : readingsQuery.isError ? (
                      <div className="text-sm text-destructive">
                        {readingsQuery.error instanceof Error ? readingsQuery.error.message : "Failed to load readings"}
                      </div>
                    ) : sensorPoints.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No readings in this time window.</div>
                    ) : (
                      <div className="grid gap-6 lg:grid-cols-2">
                        <div>
                          <div className="mb-2 text-sm font-medium">Temperature</div>
                          <ResponsiveContainer width="100%" height={260}>
                            <LineChart data={sensorPoints}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis dataKey="t" stroke="hsl(var(--muted-foreground))" />
                              <YAxis stroke="hsl(var(--muted-foreground))" />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "hsl(var(--card))",
                                  border: "1px solid hsl(var(--border))",
                                  borderRadius: "var(--radius)",
                                }}
                              />
                              <Line
                                type="monotone"
                                dataKey="temperature"
                                stroke="hsl(25, 75%, 47%)"
                                strokeWidth={2}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>

                        <div>
                          <div className="mb-2 text-sm font-medium">Movement</div>
                          <ResponsiveContainer width="100%" height={260}>
                            <LineChart data={sensorPoints}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis dataKey="t" stroke="hsl(var(--muted-foreground))" />
                              <YAxis stroke="hsl(var(--muted-foreground))" />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "hsl(var(--card))",
                                  border: "1px solid hsl(var(--border))",
                                  borderRadius: "var(--radius)",
                                }}
                              />
                              <Line
                                type="monotone"
                                dataKey="movement"
                                stroke="hsl(200, 80%, 45%)"
                                strokeWidth={2}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}

        <Dialog open={vaccinationDialogOpen} onOpenChange={setVaccinationDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {vaccinationMode === "create" ? "Add vaccination" : "Edit vaccination"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Vaccine name</div>
                <Input value={vaccineName} onChange={(e) => setVaccineName(e.target.value)} />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Administered date</div>
                  <Input type="date" value={administeredDate} onChange={(e) => setAdministeredDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Next due date</div>
                  <Input type="date" value={nextDueDate} onChange={(e) => setNextDueDate(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Administered by</div>
                <Input value={administeredBy} onChange={(e) => setAdministeredBy(e.target.value)} />
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Notes</div>
                <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setVaccinationDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                disabled={
                  vaccineName.trim().length === 0 ||
                  administeredDate.trim().length === 0 ||
                  createVaccinationMutation.isPending ||
                  updateVaccinationMutation.isPending
                }
                onClick={() => {
                  if (vaccinationMode === "create") {
                    createVaccinationMutation.mutate();
                  } else {
                    updateVaccinationMutation.mutate();
                  }
                }}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
