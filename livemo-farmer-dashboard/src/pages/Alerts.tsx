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
import { Check, ClipboardList, Search, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActiveFarm } from "@/hooks/useActiveFarm";
import {
  acknowledgeAlert,
  listAlerts,
  resolveAlert,
  getAlertStats,
} from "@/lib/alertApi";
import { useToast } from "@/hooks/use-toast";

export default function Alerts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { activeFarmId } = useActiveFarm();

  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const queryParams = useMemo(
    () => ({
      farm_id: activeFarmId ?? undefined,
      severity: severity !== "all" ? severity : undefined,
      status: status !== "all" ? status : undefined,
      page,
    }),
    [activeFarmId, page, severity, status]
  );

  const alertsQuery = useQuery({
    queryKey: ["alerts", queryParams],
    queryFn: () => listAlerts(queryParams),
    enabled: activeFarmId != null,
    staleTime: 10_000,
  });

  const statsQuery = useQuery({
    queryKey: ["alertStats", activeFarmId],
    queryFn: () => getAlertStats({ farm_id: activeFarmId ?? undefined }),
    enabled: activeFarmId != null,
    staleTime: 10_000,
  });

  const ackMutation = useMutation({
    mutationFn: (alertId: number) => acknowledgeAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["alertStats"] });
      toast({ title: "Alert acknowledged" });
    },
    onError: (err: unknown) => {
      toast({
        variant: "destructive",
        title: "Failed",
        description: err instanceof Error ? err.message : "Failed to acknowledge alert",
      });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: (alertId: number) => resolveAlert({ alertId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["alertStats"] });
      toast({ title: "Alert resolved" });
    },
    onError: (err: unknown) => {
      toast({
        variant: "destructive",
        title: "Failed",
        description: err instanceof Error ? err.message : "Failed to resolve alert",
      });
    },
  });

  const remoteAlerts = alertsQuery.data?.data ?? [];
  const filteredAlerts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q.length === 0) return remoteAlerts;

    return remoteAlerts.filter((a) => {
      const animalText = a.animal ? `${a.animal.tag_id} ${a.animal.name ?? ""}` : "";
      return (
        a.title.toLowerCase().includes(q) ||
        a.message.toLowerCase().includes(q) ||
        animalText.toLowerCase().includes(q)
      );
    });
  }, [remoteAlerts, search]);

  const severityBadge = {
    critical: "bg-destructive text-destructive-foreground",
    warning: "bg-warning text-warning-foreground",
    info: "bg-sky text-white",
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Alerts</h1>
            <p className="text-muted-foreground">
              Centralized health and sensor alerts, categorized by severity
            </p>
          </div>
          <Button variant="outline">
            <ClipboardList className="mr-2 h-4 w-4" />
            View Alert Log
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Open Alerts</p>
                  <h3 className="mt-2 text-3xl font-bold text-foreground">
                    {statsQuery.data?.pending ?? 0}
                  </h3>
                  <Badge className="mt-2 bg-warning text-warning-foreground">Needs Review</Badge>
                </div>
                <div className="rounded-lg bg-warning p-3 text-white">
                  <ShieldAlert className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Critical</p>
                  <h3 className="mt-2 text-3xl font-bold text-foreground">
                    {statsQuery.data?.critical ?? 0}
                  </h3>
                  <Badge className="mt-2 bg-destructive text-destructive-foreground">
                    Urgent
                  </Badge>
                </div>
                <div className="rounded-lg bg-barn p-3 text-white">
                  <ShieldAlert className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Acknowledged</p>
                  <h3 className="mt-2 text-3xl font-bold text-foreground">
                    {remoteAlerts.filter((a) => a.status === "acknowledged").length}
                  </h3>
                  <Badge className="mt-2 bg-success text-success-foreground">On Record</Badge>
                </div>
                <div className="rounded-lg bg-gradient-pasture p-3 text-white">
                  <Check className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <span>All Alerts</span>
              <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search alerts..."
                    className="pl-10"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
                <Select
                  value={severity}
                  onValueChange={(v) => {
                    setSeverity(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full md:w-44">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeFarmId == null ? (
              <div className="text-sm text-muted-foreground">Select a farm to view alerts.</div>
            ) : alertsQuery.isLoading ? (
              <div className="text-sm text-muted-foreground">Loading alerts...</div>
            ) : alertsQuery.isError ? (
              <div className="text-sm text-destructive">
                {alertsQuery.error instanceof Error
                  ? alertsQuery.error.message
                  : "Failed to load alerts"}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAlerts.map((a) => (
                  <div
                    key={a.id}
                    className="flex flex-col gap-4 rounded-lg border border-border p-4 md:flex-row md:items-center"
                  >
                    <div className="flex flex-1 items-start gap-3">
                      <div className="rounded-lg bg-muted p-3">
                        <ShieldAlert className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{a.title}</p>
                          <Badge
                            className={
                              a.severity in severityBadge
                                ? severityBadge[a.severity as keyof typeof severityBadge]
                                : "bg-muted text-foreground"
                            }
                          >
                            {a.severity}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={
                              a.status === "pending"
                                ? "border-warning text-warning"
                                : a.status === "acknowledged"
                                ? "border-sky text-sky"
                                : "border-success text-success"
                            }
                          >
                            {a.status}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{a.message}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {(a.animal && (a.animal.name || "Unnamed") + " • " + a.animal.tag_id) || ""}
                          {a.created_at ? ` • ${new Date(a.created_at).toLocaleString()}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 md:justify-end">
                      <Button variant="outline" size="sm">
                        Log Action
                      </Button>
                      {a.status === "pending" ? (
                        <Button
                          size="sm"
                          className="bg-gradient-earth text-white hover:opacity-90"
                          onClick={() => ackMutation.mutate(a.id)}
                          disabled={ackMutation.isPending}
                        >
                          Acknowledge
                        </Button>
                      ) : a.status === "acknowledged" ? (
                        <Button
                          size="sm"
                          className="bg-success text-success-foreground hover:opacity-90"
                          onClick={() => resolveMutation.mutate(a.id)}
                          disabled={resolveMutation.isPending}
                        >
                          Resolve
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled>
                          Done
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between pt-2">
                  <div className="text-sm text-muted-foreground">
                    Page {alertsQuery.data?.current_page ?? 1} of {alertsQuery.data?.last_page ?? 1}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={(alertsQuery.data?.current_page ?? 1) <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={(alertsQuery.data?.current_page ?? 1) >= (alertsQuery.data?.last_page ?? 1)}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
