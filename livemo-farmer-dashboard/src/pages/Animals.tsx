import { Layout } from "@/components/Layout";
import { AnimalRowCard } from "@/components/AnimalRowCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { listAnimals } from "@/lib/animalApi";
import type { Animal } from "@/lib/animalApi";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useActiveFarm } from "@/hooks/useActiveFarm";

export default function Animals() {
  const navigate = useNavigate();
  const { activeFarmId } = useActiveFarm();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [activeFarmId]);

  const queryParams = useMemo(
    () => ({
      farm_id: activeFarmId ?? undefined,
      search: search.trim().length > 0 ? search.trim() : undefined,
      type: type !== "all" ? type : undefined,
      status: status !== "all" ? status : undefined,
    }),
    [activeFarmId, search, status, type]
  );

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["animals", queryParams, page],
    queryFn: () => listAnimals({ ...queryParams, page }),
    staleTime: 10_000,
  });

  const animals: Animal[] = data?.data ?? [];
  const currentPage = data?.current_page ?? 1;
  const lastPage = data?.last_page ?? 1;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Animals</h1>
            <p className="text-muted-foreground">
              Manage and monitor your livestock
            </p>
          </div>
          <Button
            className="bg-gradient-earth text-white shadow-md hover:opacity-90"
            onClick={() => navigate("/animals/new")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Animal
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or ID..."
              className="pl-10"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select
            value={type}
            onValueChange={(v) => {
              setType(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="cattle">🐄 Cattle</SelectItem>
              <SelectItem value="poultry">🐔 Poultry</SelectItem>
              <SelectItem value="goats">🐐 Goats</SelectItem>
              <SelectItem value="sheep">🐑 Sheep</SelectItem>
              <SelectItem value="swine">🐷 Swine</SelectItem>
              <SelectItem value="horses">🐴 Horses</SelectItem>
              <SelectItem value="rabbits">🐰 Rabbits</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="healthy">Healthy</SelectItem>
              <SelectItem value="sick">Sick</SelectItem>
              <SelectItem value="quarantine">Quarantine</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
              <SelectItem value="deceased">Deceased</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Animals Grid */}
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading animals...</div>
        ) : isError ? (
          <div className="text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load animals"}
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {animals.map((animal) => (
                <AnimalRowCard key={animal.id} animal={animal} />
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {lastPage}
                {isFetching ? " • Updating..." : ""}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= lastPage}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
