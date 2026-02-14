import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getAnimal, updateAnimal } from "@/lib/animalApi";
import type { AnimalStatus } from "@/lib/animalApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function AnimalEdit() {
  const { id } = useParams();
  const animalId = useMemo(() => (id ? Number(id) : NaN), [id]);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const animalQuery = useQuery({
    queryKey: ["animal", animalId],
    queryFn: () => getAnimal({ animalId }),
    enabled: Number.isFinite(animalId),
    staleTime: 10_000,
  });

  const [name, setName] = useState("");
  const [status, setStatus] = useState<AnimalStatus>("healthy");
  const [breed, setBreed] = useState("");
  const [weight, setWeight] = useState("");
  const [color, setColor] = useState("");
  const [markings, setMarkings] = useState("");

  function onStatusChange(v: string) {
    if (v === "healthy" || v === "sick" || v === "quarantine" || v === "deceased" || v === "sold") {
      setStatus(v);
    }
  }

  useEffect(() => {
    const a = animalQuery.data;
    if (!a) return;
    setName(a.name ?? "");
    setStatus(a.status ?? "healthy");
    setBreed(a.breed ?? "");
    setWeight(a.weight != null ? String(a.weight) : "");
    setColor(a.color ?? "");
    setMarkings(a.markings ?? "");
  }, [animalQuery.data]);

  const canSubmit = useMemo(() => {
    return Number.isFinite(animalId) && !animalQuery.isLoading && !animalQuery.isError;
  }, [animalId, animalQuery.isError, animalQuery.isLoading]);

  const updateMutation = useMutation({
    mutationFn: () =>
      updateAnimal({
        animalId,
        name: name.trim().length > 0 ? name.trim() : null,
        status,
        breed: breed.trim().length > 0 ? breed.trim() : null,
        weight: weight.trim().length > 0 ? Number(weight) : null,
        color: color.trim().length > 0 ? color.trim() : null,
        markings: markings.trim().length > 0 ? markings.trim() : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animal", animalId] });
      queryClient.invalidateQueries({ queryKey: ["animals"] });
      toast({ title: "Animal updated" });
      navigate(`/animals/${animalId}`);
    },
    onError: (err: unknown) => {
      toast({
        variant: "destructive",
        title: "Failed",
        description: err instanceof Error ? err.message : "Failed to update animal",
      });
    },
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground">Edit Animal</h1>
          <p className="text-muted-foreground">Update basic details</p>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {animalQuery.isLoading ? (
              <div className="text-sm text-muted-foreground">Loading animal...</div>
            ) : animalQuery.isError ? (
              <div className="text-sm text-destructive">
                {animalQuery.error instanceof Error ? animalQuery.error.message : "Failed to load animal"}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Tag ID</div>
                  <Input value={animalQuery.data?.tag_id ?? ""} disabled />
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Type</div>
                  <Input value={animalQuery.data?.type ?? ""} disabled />
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Name</div>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Status</div>
                  <Select value={status} onValueChange={onStatusChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="healthy">Healthy</SelectItem>
                      <SelectItem value="sick">Sick</SelectItem>
                      <SelectItem value="quarantine">Quarantine</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="deceased">Deceased</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Breed</div>
                  <Input value={breed} onChange={(e) => setBreed(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Weight (kg)</div>
                  <Input value={weight} onChange={(e) => setWeight(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Color</div>
                  <Input value={color} onChange={(e) => setColor(e.target.value)} />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="text-sm text-muted-foreground">Markings</div>
                  <Input value={markings} onChange={(e) => setMarkings(e.target.value)} />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 md:flex-row md:justify-end">
              <Button variant="outline" onClick={() => navigate(`/animals/${animalId}`)}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-earth text-white shadow-md hover:opacity-90"
                disabled={!canSubmit || updateMutation.isPending}
                onClick={() => updateMutation.mutate()}
              >
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
