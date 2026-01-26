import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarClock, Plus, Sprout } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useActiveFarm } from "@/hooks/useActiveFarm";
import { listFeedSchedules } from "@/lib/feedScheduleApi";
import type { FeedSchedule } from "@/lib/feedScheduleApi";

function statusLabel(s: FeedSchedule) {
  return s.is_completed ? "completed" : "upcoming";
}

function formatTime(t: string) {
  return t;
}

export default function Feed() {
  const { activeFarmId } = useActiveFarm();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const apiStatusFilter =
    status === "completed" ? true : status === "upcoming" ? false : undefined;

  const feedQuery = useQuery({
    queryKey: ["feedSchedules", activeFarmId, apiStatusFilter, page],
    queryFn: () =>
      listFeedSchedules({
        farmId: activeFarmId as number,
        page,
        is_completed: apiStatusFilter,
      }),
    enabled: activeFarmId != null,
    staleTime: 10_000,
  });

  const schedules: FeedSchedule[] = feedQuery.data?.data ?? [];
  const completedCount = schedules.filter((s) => s.is_completed).length;
  const upcomingCount = schedules.filter((s) => !s.is_completed).length;
  const totalCount = schedules.length;
  const feedEfficiency = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredSchedules = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q.length === 0) return schedules;

    return schedules.filter((s) => {
      const animalTxt = s.animal ? `${s.animal.tag_id} ${s.animal.name ?? ""}` : "";
      const groupTxt = s.group_name ?? "";
      const feedTxt = s.feed_type;
      return (
        animalTxt.toLowerCase().includes(q) ||
        groupTxt.toLowerCase().includes(q) ||
        feedTxt.toLowerCase().includes(q)
      );
    });
  }, [schedules, search]);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Feed</h1>
            <p className="text-muted-foreground">
              Plan, schedule, and track feeding across your farm
            </p>
          </div>
          <Button className="bg-gradient-pasture text-white shadow-md hover:opacity-90">
            <Plus className="mr-2 h-4 w-4" />
            Schedule Feeding
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Today’s Feedings
                  </p>
                  <h3 className="mt-2 text-3xl font-bold text-foreground">
                    {totalCount}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {completedCount} completed, {upcomingCount} upcoming
                  </p>
                </div>
                <div className="rounded-lg bg-gradient-earth p-3 text-white">
                  <CalendarClock className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Feed Efficiency</p>
                  <h3 className="mt-2 text-3xl font-bold text-foreground">{feedEfficiency}%</h3>
                  <Badge className="mt-2 bg-success text-success-foreground">On Track</Badge>
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
                  <p className="text-sm font-medium text-muted-foreground">Stock Alerts</p>
                  <h3 className="mt-2 text-3xl font-bold text-foreground">0</h3>
                  <Badge className="mt-2 bg-success text-success-foreground">OK</Badge>
                </div>
                <div className="rounded-lg bg-warning p-3 text-white">
                  <Sprout className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <span>Feeding Schedule</span>
              <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                <div className="w-full md:w-64">
                  <Input
                    placeholder="Search by group or animal..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
                <Select
                  value={status}
                  onValueChange={(v) => {
                    setStatus(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full md:w-44">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeFarmId == null ? (
              <div className="text-sm text-muted-foreground">Select a farm to view feed schedules.</div>
            ) : feedQuery.isLoading ? (
              <div className="text-sm text-muted-foreground">Loading feed schedules...</div>
            ) : feedQuery.isError ? (
              <div className="text-sm text-destructive">
                {feedQuery.error instanceof Error ? feedQuery.error.message : "Failed to load feed schedules"}
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {filteredSchedules.map((item) => {
                    const label = statusLabel(item);
                    const animalLabel = item.animal
                      ? `${item.animal.name && item.animal.name.trim().length > 0 ? item.animal.name : "Unnamed"} (${item.animal.tag_id})`
                      : null;
                    const groupLabel = item.group_name && item.group_name.trim().length > 0 ? item.group_name : null;

                    return (
                      <div
                        key={item.id}
                        className="flex flex-col gap-4 rounded-lg border border-border p-4 md:flex-row md:items-center"
                      >
                        <div className="flex flex-1 items-center gap-3">
                          <div className="rounded-lg bg-muted p-3">
                            <CalendarClock className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {formatTime(item.scheduled_time)} • {groupLabel ?? animalLabel ?? "General"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {item.feed_type} • Qty: {item.quantity}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 md:justify-end">
                          <Badge
                            className={
                              label === "completed"
                                ? "bg-success text-success-foreground"
                                : "bg-sky text-white"
                            }
                          >
                            {label}
                          </Badge>
                          <Button variant="outline" size="sm" disabled>
                            View
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-sm text-muted-foreground">
                    Page {feedQuery.data?.current_page ?? 1} of {feedQuery.data?.last_page ?? 1}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={(feedQuery.data?.current_page ?? 1) <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={(feedQuery.data?.current_page ?? 1) >= (feedQuery.data?.last_page ?? 1)}
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
