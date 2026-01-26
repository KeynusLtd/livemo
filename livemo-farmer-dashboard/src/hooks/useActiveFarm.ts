import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { listFarms } from "@/lib/farmApi";
import type { Farm, LaravelPaginator } from "@/lib/farmApi";
import { useFarmStore } from "@/stores/farmStore";

function normalizeFarms(res: LaravelPaginator<Farm> | Farm[]) {
  return Array.isArray(res) ? res : res.data;
}

export function useActiveFarm() {
  const activeFarmId = useFarmStore((s) => s.activeFarmId);
  const setActiveFarmId = useFarmStore((s) => s.setActiveFarmId);

  const farmsQuery = useQuery({
    queryKey: ["farms"],
    queryFn: () => listFarms(),
    staleTime: 30_000,
  });

  const farms = useMemo(() => {
    if (!farmsQuery.data) return [];
    return normalizeFarms(farmsQuery.data);
  }, [farmsQuery.data]);

  useEffect(() => {
    if (farms.length === 0) return;

    if (activeFarmId == null) {
      setActiveFarmId(farms[0].id);
      return;
    }

    const exists = farms.some((f) => f.id === activeFarmId);
    if (!exists) setActiveFarmId(farms[0].id);
  }, [activeFarmId, farms, setActiveFarmId]);

  const activeFarm = useMemo(() => {
    if (activeFarmId == null) return null;
    return farms.find((f) => f.id === activeFarmId) ?? null;
  }, [activeFarmId, farms]);

  return {
    farms,
    activeFarmId,
    activeFarm,
    setActiveFarmId,
    farmsQuery,
  };
}
