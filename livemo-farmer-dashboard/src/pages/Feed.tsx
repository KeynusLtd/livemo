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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CalendarClock, Plus, Sprout } from "lucide-react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActiveFarm } from "@/hooks/useActiveFarm";
import { useToast } from "@/hooks/use-toast";
import { listAnimals } from "@/lib/animalApi";
import type { Animal } from "@/lib/animalApi";
import {
  completeFeedSchedule,
  createFeedSchedule,
  deleteFeedSchedule,
  listFeedSchedules,
  updateFeedSchedule,
} from "@/lib/feedScheduleApi";
import type { FeedSchedule } from "@/lib/feedScheduleApi";

function statusLabel(s: FeedSchedule) {
  return s.is_completed ? "completed" : "upcoming";
}

function formatTime(t: string) {
  return t;
}

function dayLabel(d: number) {
  if (d === 1) return "Mon";
  if (d === 2) return "Tue";
  if (d === 3) return "Wed";
  if (d === 4) return "Thu";
  if (d === 5) return "Fri";
  if (d === 6) return "Sat";
  if (d === 7) return "Sun";
  return String(d);
}

function daysText(days?: number[] | null, isRecurring?: boolean) {
  if (!isRecurring) return "One-time";
  if (!days || days.length === 0) return "Recurring";
  return days
    .slice()
    .sort((a, b) => a - b)
    .map(dayLabel)
    .join(", ");
}

export default function Feed() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { activeFarmId } = useActiveFarm();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formFeedType, setFormFeedType] = useState("Hay");
  const [formQuantity, setFormQuantity] = useState("5");
  const [formTime, setFormTime] = useState("06:00");
  const [formGroupName, setFormGroupName] = useState("");
  const [formAnimalId, setFormAnimalId] = useState<number | null>(null);
  const [formRecurring, setFormRecurring] = useState(false);
  const [formDays, setFormDays] = useState<number[]>([]);

  const apiStatusFilter =
    status === "completed" ? true : status === "upcoming" ? false : undefined;

  const animalsQuery = useQuery({
    queryKey: ["feedAnimals", activeFarmId],
    queryFn: () => listAnimals({ farm_id: activeFarmId ?? undefined, page: 1 }),
    enabled: activeFarmId != null,
    staleTime: 30_000,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: {
      farmId: number;
      feedScheduleId: number;
      feed_type: string;
      quantity: number;
      scheduled_time: string;
      group_name?: string | null;
      animal_id?: number | null;
      is_recurring?: boolean;
      days_of_week?: number[] | null;
    }) =>
      updateFeedSchedule({
        farmId: payload.farmId,
        feedScheduleId: payload.feedScheduleId,
        payload: {
          feed_type: payload.feed_type,
          quantity: payload.quantity,
          scheduled_time: payload.scheduled_time,
          group_name: payload.group_name,
          animal_id: payload.animal_id,
          is_recurring: payload.is_recurring,
          days_of_week: payload.days_of_week,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedSchedules"] });
      toast({ title: "Schedule updated" });
      setEditOpen(false);
      setEditId(null);
    },
    onError: (err: unknown) => {
      toast({
        variant: "destructive",
        title: "Failed",
        description: err instanceof Error ? err.message : "Failed to update schedule",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (payload: { farmId: number; feedScheduleId: number }) => deleteFeedSchedule(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedSchedules"] });
      toast({ title: "Schedule deleted" });
    },
    onError: (err: unknown) => {
      toast({
        variant: "destructive",
        title: "Failed",
        description: err instanceof Error ? err.message : "Failed to delete schedule",
      });
    },
  });

  const animals: Animal[] = useMemo(() => animalsQuery.data?.data ?? [], [animalsQuery.data?.data]);

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

  const schedules: FeedSchedule[] = useMemo(() => feedQuery.data?.data ?? [], [feedQuery.data?.data]);
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

  const createMutation = useMutation({
    mutationFn: (payload: {
      farmId: number;
      feed_type: string;
      quantity: number;
      scheduled_time: string;
      group_name?: string | null;
      animal_id?: number | null;
    }) =>
      createFeedSchedule({
        farmId: payload.farmId,
        payload: {
          feed_type: payload.feed_type,
          quantity: payload.quantity,
          scheduled_time: payload.scheduled_time,
          group_name: payload.group_name,
          animal_id: payload.animal_id,
          is_recurring: payload.is_recurring,
          days_of_week: payload.days_of_week,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedSchedules"] });
      toast({ title: "Feeding scheduled" });
      setAddOpen(false);
      setFormFeedType("Hay");
      setFormQuantity("5");
      setFormTime("06:00");
      setFormGroupName("");
      setFormAnimalId(null);
      setFormRecurring(false);
      setFormDays([]);
    },
    onError: (err: unknown) => {
      toast({
        variant: "destructive",
        title: "Failed",
        description: err instanceof Error ? err.message : "Failed to schedule feeding",
      });
    },
  });

  const completeMutation = useMutation({
    mutationFn: (payload: { farmId: number; feedScheduleId: number }) => completeFeedSchedule(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedSchedules"] });
      toast({ title: "Marked as completed" });
    },
    onError: (err: unknown) => {
      toast({
        variant: "destructive",
        title: "Failed",
        description: err instanceof Error ? err.message : "Failed to complete feeding",
      });
    },
  });

  const canCreate =
    activeFarmId != null &&
    formFeedType.trim().length > 0 &&
    Number.isFinite(Number(formQuantity)) &&
    Number(formQuantity) > 0 &&
    /^\d{2}:\d{2}$/.test(formTime.trim());

  const canSaveEdit =
    activeFarmId != null &&
    editId != null &&
    formFeedType.trim().length > 0 &&
    Number.isFinite(Number(formQuantity)) &&
    Number(formQuantity) > 0 &&
    /^\d{2}:\d{2}$/.test(formTime.trim());

  const openEdit = (s: FeedSchedule) => {
    setEditId(s.id);
    setFormFeedType(s.feed_type ?? "");
    setFormQuantity(String(s.quantity ?? ""));
    setFormTime((s.scheduled_time ?? "").slice(0, 5));
    setFormGroupName(s.group_name ?? "");
    setFormAnimalId(s.animal_id ?? null);
    setFormRecurring(Boolean(s.is_recurring));
    setFormDays((s.days_of_week ?? []) as number[]);
    setEditOpen(true);
  };

  const clearForm = () => {
    setFormFeedType("Hay");
    setFormQuantity("5");
    setFormTime("06:00");
    setFormGroupName("");
    setFormAnimalId(null);
    setFormRecurring(false);
    setFormDays([]);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <Dialog
          open={addOpen}
          onOpenChange={(v) => {
            setAddOpen(v);
            if (!v) {
              clearForm();
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Feeding</DialogTitle>
              <DialogDescription>Create a one-time feeding schedule for this farm.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Feed type</div>
                <Input value={formFeedType} onChange={(e) => setFormFeedType(e.target.value)} placeholder="Hay + Grain" />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Quantity (kg)</div>
                  <Input value={formQuantity} onChange={(e) => setFormQuantity(e.target.value)} placeholder="5" />
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Time (HH:mm)</div>
                  <Input value={formTime} onChange={(e) => setFormTime(e.target.value)} placeholder="06:00" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Group name (optional)</div>
                <Input value={formGroupName} onChange={(e) => setFormGroupName(e.target.value)} placeholder="Dairy cows" />
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Schedule type</div>
                <Select
                  value={formRecurring ? "recurring" : "one-time"}
                  onValueChange={(v) => {
                    setFormRecurring(v === "recurring");
                    if (v !== "recurring") setFormDays([]);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one-time">One-time</SelectItem>
                    <SelectItem value="recurring">Recurring</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formRecurring ? (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Days of week</div>
                  <ToggleGroup
                    type="multiple"
                    value={formDays.map(String)}
                    onValueChange={(vals) => {
                      const next = vals
                        .map((v) => Number(v))
                        .filter((n) => Number.isFinite(n));
                      setFormDays(next);
                    }}
                    className="justify-start"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                      <ToggleGroupItem key={d} value={String(d)} aria-label={dayLabel(d)}>
                        {dayLabel(d)}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>
              ) : null}

              <div className="space-y-2">
                <div className="text-sm font-medium">Animal (optional)</div>
                <Select
                  value={formAnimalId != null ? String(formAnimalId) : ""}
                  onValueChange={(v) => setFormAnimalId(v ? Number(v) : null)}
                  disabled={animalsQuery.isLoading || activeFarmId == null}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="General" />
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
                  if (!canCreate || activeFarmId == null) return;
                  createMutation.mutate({
                    farmId: activeFarmId,
                    feed_type: formFeedType.trim(),
                    quantity: Number(formQuantity),
                    scheduled_time: formTime.trim(),
                    group_name: formGroupName.trim().length > 0 ? formGroupName.trim() : null,
                    animal_id: formAnimalId,
                    is_recurring: formRecurring,
                    days_of_week: formRecurring ? formDays : null,
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
          open={editOpen}
          onOpenChange={(v) => {
            setEditOpen(v);
            if (!v) {
              setEditId(null);
              clearForm();
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Schedule</DialogTitle>
              <DialogDescription>Update schedule details.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Feed type</div>
                <Input value={formFeedType} onChange={(e) => setFormFeedType(e.target.value)} />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Quantity (kg)</div>
                  <Input value={formQuantity} onChange={(e) => setFormQuantity(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Time (HH:mm)</div>
                  <Input value={formTime} onChange={(e) => setFormTime(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Group name (optional)</div>
                <Input value={formGroupName} onChange={(e) => setFormGroupName(e.target.value)} />
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Animal (optional)</div>
                <Select
                  value={formAnimalId != null ? String(formAnimalId) : ""}
                  onValueChange={(v) => setFormAnimalId(v ? Number(v) : null)}
                  disabled={animalsQuery.isLoading || activeFarmId == null}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="General" />
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

              <div className="space-y-2">
                <div className="text-sm font-medium">Schedule type</div>
                <Select
                  value={formRecurring ? "recurring" : "one-time"}
                  onValueChange={(v) => {
                    setFormRecurring(v === "recurring");
                    if (v !== "recurring") setFormDays([]);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one-time">One-time</SelectItem>
                    <SelectItem value="recurring">Recurring</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formRecurring ? (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Days of week</div>
                  <ToggleGroup
                    type="multiple"
                    value={formDays.map(String)}
                    onValueChange={(vals) => {
                      const next = vals
                        .map((v) => Number(v))
                        .filter((n) => Number.isFinite(n));
                      setFormDays(next);
                    }}
                    className="justify-start"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                      <ToggleGroupItem key={d} value={String(d)} aria-label={dayLabel(d)}>
                        {dayLabel(d)}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>
              ) : null}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)} disabled={updateMutation.isPending}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!canSaveEdit || activeFarmId == null || editId == null) return;
                  updateMutation.mutate({
                    farmId: activeFarmId,
                    feedScheduleId: editId,
                    feed_type: formFeedType.trim(),
                    quantity: Number(formQuantity),
                    scheduled_time: formTime.trim(),
                    group_name: formGroupName.trim().length > 0 ? formGroupName.trim() : null,
                    animal_id: formAnimalId,
                    is_recurring: formRecurring,
                    days_of_week: formRecurring ? formDays : null,
                  });
                }}
                disabled={!canSaveEdit || updateMutation.isPending}
              >
                {updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Feed</h1>
            <p className="text-muted-foreground">
              Plan, schedule, and track feeding across your farm
            </p>
          </div>
          <Button
            className="bg-gradient-pasture text-white shadow-md hover:opacity-90"
            onClick={() => setAddOpen(true)}
            disabled={activeFarmId == null}
          >
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
                              {item.feed_type} • Qty: {item.quantity} • {daysText(item.days_of_week, item.is_recurring)}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 md:justify-end">
                          <Badge
                            className={
                              label === "completed"
                                ? "bg-success text-success-foreground"
                                : "bg-sky text-white"
                            }
                          >
                            {label}
                          </Badge>
                          <Button variant="outline" size="sm" onClick={() => openEdit(item)} disabled={item.is_completed}>
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (activeFarmId == null) return;
                              const ok = window.confirm("Delete this feed schedule?");
                              if (!ok) return;
                              deleteMutation.mutate({ farmId: activeFarmId, feedScheduleId: item.id });
                            }}
                            disabled={deleteMutation.isPending}
                          >
                            Delete
                          </Button>
                          {!item.is_completed ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (activeFarmId == null) return;
                                completeMutation.mutate({ farmId: activeFarmId, feedScheduleId: item.id });
                              }}
                              disabled={completeMutation.isPending}
                            >
                              Complete
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" disabled>
                              Done
                            </Button>
                          )}
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
