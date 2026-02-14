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
import { useActiveFarm } from "@/hooks/useActiveFarm";
import { useToast } from "@/hooks/use-toast";
import { createAnimal, listAnimalCatalogs, listAnimalCatalogTypes } from "@/lib/animalApi";
import type { AnimalStatus } from "@/lib/animalApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AnimalCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { activeFarmId } = useActiveFarm();

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [catalogId, setCatalogId] = useState<number | null>(null);
  const [tagId, setTagId] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<AnimalStatus>("healthy");
  const [gender, setGender] = useState<"male" | "female" | "unset">("female");
  const [birthDate, setBirthDate] = useState("");
  const [weight, setWeight] = useState("");
  const [color, setColor] = useState("");
  const [markings, setMarkings] = useState("");

  const typesQuery = useQuery({
    queryKey: ["animalCatalogTypes"],
    queryFn: () => listAnimalCatalogTypes(),
    staleTime: 30_000,
  });

  const types = typesQuery.data?.types ?? [];

  const catalogsQuery = useQuery({
    queryKey: ["animalCatalogs", selectedType],
    queryFn: () => listAnimalCatalogs({ page: 1, type: selectedType ?? undefined }),
    staleTime: 30_000,
  });

  const catalogs = catalogsQuery.data?.data ?? [];

  function onGenderChange(v: string) {
    if (v === "male" || v === "female" || v === "unset") {
      setGender(v);
    }
  }

  function onStatusChange(v: string) {
    if (v === "healthy" || v === "sick" || v === "quarantine" || v === "deceased" || v === "sold") {
      setStatus(v);
    }
  }

  const canSubmit = useMemo(() => {
    return activeFarmId != null && selectedType != null && catalogId != null && tagId.trim().length > 0;
  }, [activeFarmId, selectedType, catalogId, tagId]);

  const createMutation = useMutation({
    mutationFn: () =>
      createAnimal({
        farm_id: activeFarmId as number,
        catalog_id: catalogId as number,
        tag_id: tagId.trim(),
        name: name.trim().length > 0 ? name.trim() : null,
        status,
        gender: (gender === "unset" ? null : gender),
        birth_date: birthDate || null,
        weight: weight.trim().length > 0 ? Number(weight) : null,
        color: color.trim().length > 0 ? color.trim() : null,
        markings: markings.trim().length > 0 ? markings.trim() : null,
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["animals"] });
      toast({ title: "Animal added" });
      navigate(`/animals/${res.animal.id}`);
    },
    onError: (err: unknown) => {
      toast({
        variant: "destructive",
        title: "Failed",
        description: err instanceof Error ? err.message : "Failed to create animal",
      });
    },
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground">Add Animal</h1>
          <p className="text-muted-foreground">Create a new animal record</p>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Basic details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Type (from admin)</div>
                <Select
                  value={selectedType ?? ""}
                  onValueChange={(v) => {
                    setSelectedType(v || null);
                    setCatalogId(null);
                  }}
                  disabled={typesQuery.isLoading || types.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        typesQuery.isLoading
                          ? "Loading types..."
                          : types.length === 0
                            ? "No types available"
                            : "Select type"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <div className="text-sm text-muted-foreground">Animal (from admin catalog)</div>
                <Select
                  value={catalogId != null ? String(catalogId) : ""}
                  onValueChange={(v) => setCatalogId(v ? Number(v) : null)}
                  disabled={selectedType == null || catalogsQuery.isLoading || catalogs.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        selectedType == null
                          ? "Select type first"
                          : catalogsQuery.isLoading
                            ? "Loading catalog..."
                            : catalogs.length === 0
                              ? "No catalog animals available"
                              : "Select animal"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {catalogs.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Tag ID</div>
                <Input value={tagId} onChange={(e) => setTagId(e.target.value)} placeholder="COW001" />
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Name (optional)</div>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Bella" />
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Status</div>
                <Select value={status} onValueChange={onStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
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
                <div className="text-sm text-muted-foreground">Gender (optional)</div>
                <Select value={gender} onValueChange={onGenderChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unset">Not set</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Birth date (optional)</div>
                <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Weight (kg, optional)</div>
                <Input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="450" />
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Color (optional)</div>
                <Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="Brown" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <div className="text-sm text-muted-foreground">Markings (optional)</div>
                <Input value={markings} onChange={(e) => setMarkings(e.target.value)} placeholder="Notes or markings" />
              </div>
            </div>

            <div className="flex flex-col gap-2 md:flex-row md:justify-end">
              <Button variant="outline" onClick={() => navigate("/animals")}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-earth text-white shadow-md hover:opacity-90"
                disabled={!canSubmit || createMutation.isPending}
                onClick={() => createMutation.mutate()}
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
