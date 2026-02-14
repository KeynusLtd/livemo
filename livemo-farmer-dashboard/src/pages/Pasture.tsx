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
import { MapPin, Plus, RefreshCw, Sprout } from "lucide-react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActiveFarm } from "@/hooks/useActiveFarm";
import { useToast } from "@/hooks/use-toast";
import { listAnimals } from "@/lib/animalApi";
import type { Animal } from "@/lib/animalApi";
import { assignAnimalToPasture, createPasture, listPastures } from "@/lib/pastureApi";
import type { Pasture as PastureType } from "@/lib/pastureApi";
import { useNavigate } from "react-router-dom";

function daysUntil(dateIso?: string | null) {
  if (!dateIso) return null;
  const d = new Date(dateIso);
  const days = Math.round((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return days;
}

export default function Pasture() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { activeFarmId } = useActiveFarm();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const [addOpen, setAddOpen] = useState(false);
  const [pName, setPName] = useState("");
  const [pSize, setPSize] = useState("5");
  const [pCapacity, setPCapacity] = useState("10");
  const [pQuality, setPQuality] = useState("good");
  const [pNextRotation, setPNextRotation] = useState("");
  const [pNotes, setPNotes] = useState("");

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignPastureId, setAssignPastureId] = useState<number | null>(null);
  const [assignAnimalId, setAssignAnimalId] = useState<number | null>(null);

  const pasturesQuery = useQuery({
    queryKey: ["pastures", activeFarmId, page],
    queryFn: () => listPastures({ farmId: activeFarmId as number, page }),
    enabled: activeFarmId != null,
    staleTime: 10_000,
  });

  const animalsQuery = useQuery({
    queryKey: ["pastureAnimals", activeFarmId],
    queryFn: () => listAnimals({ farm_id: activeFarmId ?? undefined, page: 1 }),
    enabled: activeFarmId != null,
    staleTime: 30_000,
  });

  const animals: Animal[] = useMemo(() => animalsQuery.data?.data ?? [], [animalsQuery.data?.data]);

  const pastures: PastureType[] = useMemo(() => pasturesQuery.data?.data ?? [], [pasturesQuery.data?.data]);

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

  const createMutation = useMutation({
    mutationFn: (payload: {
      farmId: number;
      name: string;
      size: number;
      capacity: number;
      quality: string;
      next_rotation?: string;
      notes?: string;
    }) =>
      createPasture({
        farmId: payload.farmId,
        payload: {
          name: payload.name,
          size: payload.size,
          capacity: payload.capacity,
          quality: payload.quality,
          next_rotation: payload.next_rotation,
          notes: payload.notes,
          is_active: true,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pastures"] });
      toast({ title: "Paddock added" });
      setAddOpen(false);
      setPName("");
      setPSize("5");
      setPCapacity("10");
      setPQuality("good");
      setPNextRotation("");
      setPNotes("");
    },
    onError: (err: unknown) => {
      toast({
        variant: "destructive",
        title: "Failed",
        description: err instanceof Error ? err.message : "Failed to add paddock",
      });
    },
  });

  const assignMutation = useMutation({
    mutationFn: (payload: { farmId: number; pastureId: number; animalId: number }) =>
      assignAnimalToPasture({ farmId: payload.farmId, pastureId: payload.pastureId, animal_id: payload.animalId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pastures"] });
      toast({ title: "Animal assigned" });
      setAssignOpen(false);
      setAssignPastureId(null);
      setAssignAnimalId(null);
    },
    onError: (err: unknown) => {
      toast({
        variant: "destructive",
        title: "Failed",
        description: err instanceof Error ? err.message : "Failed to assign animal",
      });
    },
  });

  const canCreate =
    activeFarmId != null &&
    pName.trim().length > 0 &&
    Number.isFinite(Number(pSize)) &&
    Number(pSize) > 0 &&
    Number.isFinite(Number(pCapacity)) &&
    Number(pCapacity) >= 0;

  const openAssign = (pasture: PastureType) => {
    setAssignPastureId(pasture.id);
    setAssignAnimalId(null);
    setAssignOpen(true);
  };

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
        <Dialog
          open={addOpen}
          onOpenChange={(v) => {
            setAddOpen(v);
            if (!v) {
              setPName("");
              setPSize("5");
              setPCapacity("10");
              setPQuality("good");
              setPNextRotation("");
              setPNotes("");
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Paddock</DialogTitle>
              <DialogDescription>Create a paddock and optionally set next rotation date.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Name</div>
                <Input value={pName} onChange={(e) => setPName(e.target.value)} placeholder="Pasture C" />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Size (hectares)</div>
                  <Input value={pSize} onChange={(e) => setPSize(e.target.value)} placeholder="5" />
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Capacity</div>
                  <Input value={pCapacity} onChange={(e) => setPCapacity(e.target.value)} placeholder="10" />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Quality</div>
                  <Select value={pQuality} onValueChange={setPQuality}>
                    <SelectTrigger>
                      <SelectValue placeholder="Quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">excellent</SelectItem>
                      <SelectItem value="good">good</SelectItem>
                      <SelectItem value="fair">fair</SelectItem>
                      <SelectItem value="poor">poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Next rotation (YYYY-MM-DD)</div>
                  <Input value={pNextRotation} onChange={(e) => setPNextRotation(e.target.value)} placeholder="2026-02-21" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Notes (optional)</div>
                <Input value={pNotes} onChange={(e) => setPNotes(e.target.value)} placeholder="Irrigated, high grass" />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)} disabled={createMutation.isPending}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!canCreate || activeFarmId == null) return;
                  createMutation.mutate({
                    farmId: activeFarmId,
                    name: pName.trim(),
                    size: Number(pSize),
                    capacity: Number(pCapacity),
                    quality: pQuality,
                    next_rotation: pNextRotation.trim().length > 0 ? pNextRotation.trim() : undefined,
                    notes: pNotes.trim().length > 0 ? pNotes.trim() : undefined,
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
              setAssignPastureId(null);
              setAssignAnimalId(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Animal</DialogTitle>
              <DialogDescription>Select an animal to place in this paddock.</DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <div className="text-sm font-medium">Animal</div>
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

            <DialogFooter>
              <Button variant="outline" onClick={() => setAssignOpen(false)} disabled={assignMutation.isPending}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (activeFarmId == null || assignPastureId == null || assignAnimalId == null) return;
                  assignMutation.mutate({
                    farmId: activeFarmId,
                    pastureId: assignPastureId,
                    animalId: assignAnimalId,
                  });
                }}
                disabled={assignPastureId == null || assignAnimalId == null || assignMutation.isPending}
              >
                {assignMutation.isPending ? "Saving..." : "Assign"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Pasture</h1>
            <p className="text-muted-foreground">
              Track pasture utilization and plan rotations
            </p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row">
            <Button variant="outline" onClick={() => pasturesQuery.refetch()} disabled={pasturesQuery.isFetching}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button
              className="bg-gradient-earth text-white shadow-md hover:opacity-90"
              onClick={() => setAddOpen(true)}
              disabled={activeFarmId == null}
            >
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
                          <Button variant="outline" size="sm" onClick={() => navigate(`/pasture/${p.id}`)}>
                            Details
                          </Button>

                          <Button variant="outline" size="sm" onClick={() => openAssign(p)}>
                            Assign animal
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
