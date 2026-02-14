import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useActiveFarm } from "@/hooks/useActiveFarm";
import { listAnimals } from "@/lib/animalApi";
import type { Animal } from "@/lib/animalApi";
import {
  deletePasture,
  getPasture,
  removeAnimalFromPasture,
  updatePasture,
} from "@/lib/pastureApi";
import type { PastureAnimal, PastureDetails } from "@/lib/pastureApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function formatDateTime(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString();
}

function formatDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString();
}

export default function PastureDetailsPage() {
  const { id } = useParams();
  const pastureId = useMemo(() => (id ? Number(id) : NaN), [id]);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { activeFarmId } = useActiveFarm();

  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState("");
  const [size, setSize] = useState("");
  const [capacity, setCapacity] = useState("");
  const [quality, setQuality] = useState("");
  const [nextRotation, setNextRotation] = useState("");
  const [notes, setNotes] = useState("");
  const [isActive, setIsActive] = useState(true);

  const pastureQuery = useQuery({
    queryKey: ["pasture", activeFarmId, pastureId],
    queryFn: () => getPasture({ farmId: activeFarmId as number, pastureId }),
    enabled: activeFarmId != null && Number.isFinite(pastureId),
    staleTime: 10_000,
  });

  const pasture: PastureDetails | undefined = pastureQuery.data;

  const currentAnimals: PastureAnimal[] = useMemo(() => pasture?.current_animals ?? [], [pasture?.current_animals]);
  const history: PastureAnimal[] = useMemo(() => pasture?.all_animals ?? [], [pasture?.all_animals]);

  const animalsQuery = useQuery({
    queryKey: ["pastureDetailsAnimals", activeFarmId],
    queryFn: () => listAnimals({ farm_id: activeFarmId ?? undefined, page: 1 }),
    enabled: activeFarmId != null,
    staleTime: 30_000,
  });

  const allFarmAnimals: Animal[] = useMemo(() => animalsQuery.data?.data ?? [], [animalsQuery.data?.data]);

  const updateMutation = useMutation({
    mutationFn: (payload: {
      farmId: number;
      pastureId: number;
      patch: {
        name?: string;
        size?: number;
        capacity?: number;
        quality?: string;
        next_rotation?: string | null;
        notes?: string | null;
        is_active?: boolean;
      };
    }) => updatePasture({ farmId: payload.farmId, pastureId: payload.pastureId, payload: payload.patch }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pasture"] });
      queryClient.invalidateQueries({ queryKey: ["pastures"] });
      toast({ title: "Paddock updated" });
      setEditOpen(false);
    },
    onError: (err: unknown) => {
      toast({
        variant: "destructive",
        title: "Failed",
        description: err instanceof Error ? err.message : "Failed to update paddock",
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (payload: { farmId: number; pastureId: number; animalId: number }) =>
      removeAnimalFromPasture({ farmId: payload.farmId, pastureId: payload.pastureId, animal_id: payload.animalId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pasture"] });
      queryClient.invalidateQueries({ queryKey: ["pastures"] });
      toast({ title: "Animal removed" });
    },
    onError: (err: unknown) => {
      toast({
        variant: "destructive",
        title: "Failed",
        description: err instanceof Error ? err.message : "Failed to remove animal",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (payload: { farmId: number; pastureId: number }) => deletePasture(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pastures"] });
      toast({ title: "Paddock deleted" });
      navigate("/pasture");
    },
    onError: (err: unknown) => {
      toast({
        variant: "destructive",
        title: "Failed",
        description: err instanceof Error ? err.message : "Failed to delete paddock",
      });
    },
  });

  const canEdit = pasture != null;

  const openEdit = () => {
    if (!pasture) return;
    setName(pasture.name ?? "");
    setSize(String(pasture.size ?? ""));
    setCapacity(String(pasture.capacity ?? ""));
    setQuality(pasture.quality ?? "good");
    setNextRotation(pasture.next_rotation ?? "");
    setNotes(pasture.notes ?? "");
    setIsActive(Boolean(pasture.is_active));
    setEditOpen(true);
  };

  const canSave =
    activeFarmId != null &&
    Number.isFinite(pastureId) &&
    name.trim().length > 0 &&
    Number.isFinite(Number(size)) &&
    Number(size) >= 0 &&
    Number.isFinite(Number(capacity)) &&
    Number(capacity) >= 0;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Pasture Details</h1>
            <p className="text-muted-foreground">View current animals, history, and update rotations.</p>
          </div>

          <div className="flex flex-col gap-2 md:flex-row">
            <Button variant="outline" onClick={() => navigate("/pasture")}>
              Back
            </Button>
            <Button
              className="bg-gradient-earth text-white shadow-md hover:opacity-90"
              onClick={() => openEdit()}
              disabled={!canEdit}
            >
              Edit / Deactivate
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (activeFarmId == null || !Number.isFinite(pastureId)) return;
                const ok = window.confirm("Delete this paddock? This cannot be undone.");
                if (!ok) return;
                deleteMutation.mutate({ farmId: activeFarmId, pastureId });
              }}
              disabled={deleteMutation.isPending || !canEdit}
            >
              Delete
            </Button>
          </div>
        </div>

        <Dialog
          open={editOpen}
          onOpenChange={(v) => {
            setEditOpen(v);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Paddock</DialogTitle>
              <DialogDescription>Update paddock details and status.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Name</div>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Size (hectares)</div>
                  <Input value={size} onChange={(e) => setSize(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Capacity</div>
                  <Input value={capacity} onChange={(e) => setCapacity(e.target.value)} />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Quality</div>
                  <Input value={quality} onChange={(e) => setQuality(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Next rotation (YYYY-MM-DD)</div>
                  <Input value={nextRotation} onChange={(e) => setNextRotation(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Notes</div>
                <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Active</div>
                <div className="text-sm text-muted-foreground">
                  Current: <span className="font-medium">{isActive ? "active" : "inactive"}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsActive(true)}>
                    Activate
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsActive(false)}>
                    Deactivate
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)} disabled={updateMutation.isPending}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!canSave || activeFarmId == null || !Number.isFinite(pastureId)) return;
                  updateMutation.mutate({
                    farmId: activeFarmId,
                    pastureId,
                    patch: {
                      name: name.trim(),
                      size: Number(size),
                      capacity: Number(capacity),
                      quality: quality.trim().length > 0 ? quality.trim() : undefined,
                      next_rotation: nextRotation.trim().length > 0 ? nextRotation.trim() : null,
                      notes: notes.trim().length > 0 ? notes.trim() : null,
                      is_active: isActive,
                    },
                  });
                }}
                disabled={!canSave || updateMutation.isPending}
              >
                {updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground">Paddock</div>
              <div className="mt-2 text-2xl font-bold">{pasture?.name ?? "—"}</div>
              <div className="mt-2">
                <Badge className={pasture?.is_active ? "bg-success text-success-foreground" : "bg-muted text-foreground"}>
                  {pasture?.is_active ? "active" : "inactive"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground">Occupancy</div>
              <div className="mt-2 text-2xl font-bold">
                {(pasture?.current_animals?.length ?? 0)} / {pasture?.capacity ?? 0}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Quality: {pasture?.quality ?? "—"}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground">Next rotation</div>
              <div className="mt-2 text-2xl font-bold">{formatDate(pasture?.next_rotation ?? null)}</div>
              <div className="mt-2 text-sm text-muted-foreground">Last rotation: {formatDate(pasture?.last_rotation ?? null)}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Current animals</CardTitle>
          </CardHeader>
          <CardContent>
            {pastureQuery.isLoading ? (
              <div className="text-sm text-muted-foreground">Loading pasture...</div>
            ) : pastureQuery.isError ? (
              <div className="text-sm text-destructive">
                {pastureQuery.error instanceof Error ? pastureQuery.error.message : "Failed to load pasture"}
              </div>
            ) : currentAnimals.length === 0 ? (
              <div className="text-sm text-muted-foreground">No animals currently assigned.</div>
            ) : (
              <div className="space-y-3">
                {currentAnimals.map((a) => (
                  <div key={a.id} className="flex flex-col gap-2 rounded-lg border border-border p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="font-medium">{a.name && a.name.trim().length > 0 ? a.name : "Unnamed"} ({a.tag_id})</div>
                      <div className="text-sm text-muted-foreground">{a.type} • Assigned: {formatDateTime(a.pivot?.assigned_at)}</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (activeFarmId == null || !Number.isFinite(pastureId)) return;
                        removeMutation.mutate({ farmId: activeFarmId, pastureId, animalId: a.id });
                      }}
                      disabled={removeMutation.isPending}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Assignment history</CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="text-sm text-muted-foreground">No assignment history.</div>
            ) : (
              <div className="space-y-3">
                {history
                  .slice()
                  .sort((a, b) => {
                    const aa = a.pivot?.assigned_at ? new Date(a.pivot.assigned_at).getTime() : 0;
                    const bb = b.pivot?.assigned_at ? new Date(b.pivot.assigned_at).getTime() : 0;
                    return bb - aa;
                  })
                  .map((a) => (
                    <div key={`${a.id}-${a.pivot?.assigned_at ?? ""}`} className="rounded-lg border border-border p-4">
                      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                        <div className="font-medium">{a.name && a.name.trim().length > 0 ? a.name : "Unnamed"} ({a.tag_id})</div>
                        <Badge className={a.pivot?.is_current ? "bg-success text-success-foreground" : "bg-muted text-foreground"}>
                          {a.pivot?.is_current ? "current" : "past"}
                        </Badge>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        Assigned: {formatDateTime(a.pivot?.assigned_at)} • Removed: {formatDateTime(a.pivot?.removed_at ?? null)}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
