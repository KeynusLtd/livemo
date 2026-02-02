import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, Thermometer, Heart, TrendingUp } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useActiveFarm } from "@/hooks/useActiveFarm";
import { listAnimals, getAnimalHealth } from "@/lib/animalApi";
import type { Animal } from "@/lib/animalApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

export default function Health() {
  const { activeFarmId } = useActiveFarm();

  const animalsQuery = useQuery({
    queryKey: ["healthAnimals", activeFarmId],
    queryFn: () => listAnimals({ farm_id: activeFarmId ?? undefined, page: 1 }),
    enabled: activeFarmId != null,
    staleTime: 10_000,
  });

  const animals: Animal[] = useMemo(() => animalsQuery.data?.data ?? [], [animalsQuery.data?.data]);
  const [selectedAnimalId, setSelectedAnimalId] = useState<number | null>(null);

  useEffect(() => {
    if (selectedAnimalId != null) return;
    if (animals.length === 0) return;
    setSelectedAnimalId(animals[0].id);
  }, [animals, selectedAnimalId]);

  const animalHealthQuery = useQuery({
    queryKey: ["animalHealth", selectedAnimalId],
    queryFn: () => getAnimalHealth({ animalId: selectedAnimalId as number, page: 1 }),
    enabled: selectedAnimalId != null,
    staleTime: 10_000,
  });

  const healthRecords = useMemo(
    () => animalHealthQuery.data?.health_records.data ?? [],
    [animalHealthQuery.data?.health_records.data]
  );

  const vitalTrends = useMemo(() => {
    const rows = [...healthRecords]
      .filter((r) => r.created_at)
      .slice(0, 12)
      .reverse();

    return rows.map((r) => {
      const t = r.created_at ? new Date(r.created_at) : null;
      const label = t
        ? t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "";

      return {
        time: label,
        temp: r.temperature ?? 0,
        heart: r.heart_rate ?? 0,
      };
    });
  }, [healthRecords]);

  const avgTemp = useMemo(() => {
    const vals = healthRecords.map((r) => r.temperature).filter((v): v is number => typeof v === "number");
    if (vals.length === 0) return null;
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return Math.round(avg * 10) / 10;
  }, [healthRecords]);

  const avgHeart = useMemo(() => {
    const vals = healthRecords.map((r) => r.heart_rate).filter((v): v is number => typeof v === "number");
    if (vals.length === 0) return null;
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return Math.round(avg);
  }, [healthRecords]);

  const avgActivity = useMemo(() => {
    const vals = healthRecords
      .map((r) => r.activity_level)
      .filter((v): v is number => typeof v === "number");
    if (vals.length === 0) return null;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }, [healthRecords]);

  const currentScore = animalHealthQuery.data?.current_health_score ?? null;
  const needsAttention = animalHealthQuery.data?.needs_attention ?? false;

  const healthMetrics = useMemo(() => {
    const tempScore = avgTemp == null ? 0 : Math.max(0, Math.min(100, 100 - Math.abs(avgTemp - 38.6) * 25));
    const heartScore = avgHeart == null ? 0 : Math.max(0, Math.min(100, 100 - Math.abs(avgHeart - 65) * 2));
    const activityScore = avgActivity == null ? 0 : Math.max(0, Math.min(100, avgActivity));

    return [
      { metric: "Activity", value: Math.round(activityScore), fullMark: 100 },
      { metric: "Temperature", value: Math.round(tempScore), fullMark: 100 },
      { metric: "Heart Rate", value: Math.round(heartScore), fullMark: 100 },
      { metric: "Health Score", value: Math.round(currentScore ?? 0), fullMark: 100 },
    ];
  }, [avgActivity, avgHeart, avgTemp, currentScore]);

  const healthStats = useMemo(
    () => [
      {
        title: "Average Temperature",
        value: avgTemp == null ? "—" : `${avgTemp}°C`,
        status: needsAttention ? "Review" : "Normal",
        icon: Thermometer,
      },
      {
        title: "Average Heart Rate",
        value: avgHeart == null ? "—" : `${avgHeart} bpm`,
        status: needsAttention ? "Review" : "Normal",
        icon: Heart,
      },
      {
        title: "Activity Level",
        value: avgActivity == null ? "—" : `${avgActivity}%`,
        status: avgActivity != null && avgActivity >= 70 ? "Active" : "Low",
        icon: Activity,
      },
      {
        title: "Current Health Score",
        value: currentScore == null ? "—" : `${Math.round(currentScore)}%`,
        status: needsAttention ? "Needs Attention" : "Stable",
        icon: TrendingUp,
      },
    ],
    [avgActivity, avgHeart, avgTemp, currentScore, needsAttention]
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Health Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time health metrics and vital signs tracking
          </p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-muted-foreground">
            {activeFarmId == null
              ? "Select a farm to view health data."
              : animalsQuery.isLoading
              ? "Loading animals..."
              : animals.length === 0
              ? "No animals found for this farm."
              : ""}
          </div>
          <div className="w-full md:w-80">
            <Select
              value={selectedAnimalId != null ? String(selectedAnimalId) : ""}
              onValueChange={(v) => setSelectedAnimalId(v ? Number(v) : null)}
              disabled={activeFarmId == null || animalsQuery.isLoading || animals.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select animal" />
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

        {/* Health Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {healthStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <h3 className="mt-2 text-2xl font-bold text-foreground">
                        {stat.value}
                      </h3>
                      <Badge
                        className={
                          stat.status === "Needs Attention" || stat.status === "Review"
                            ? "mt-2 bg-warning text-warning-foreground"
                            : "mt-2 bg-success text-success-foreground"
                        }
                      >
                        {stat.status}
                      </Badge>
                    </div>
                    <div className="rounded-lg bg-gradient-pasture p-3 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Vital Signs (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={vitalTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                  <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="temp"
                    stroke="hsl(25, 75%, 47%)"
                    strokeWidth={2}
                    dot={{ fill: "hsl(25, 75%, 47%)", r: 3 }}
                    name="Temperature (°C)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="heart"
                    stroke="hsl(0, 60%, 45%)"
                    strokeWidth={2}
                    dot={{ fill: "hsl(0, 60%, 45%)", r: 3 }}
                    name="Heart Rate (bpm)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Health Metrics Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={healthMetrics}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis
                    dataKey="metric"
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <PolarRadiusAxis stroke="hsl(var(--muted-foreground))" />
                  <Radar
                    name="Health Score"
                    dataKey="value"
                    stroke="hsl(120, 40%, 35%)"
                    fill="hsl(120, 40%, 35%)"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Health Records */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Recent Health Checks</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedAnimalId == null ? (
              <div className="text-sm text-muted-foreground">Select an animal to view health history.</div>
            ) : animalHealthQuery.isLoading ? (
              <div className="text-sm text-muted-foreground">Loading health records...</div>
            ) : animalHealthQuery.isError ? (
              <div className="text-sm text-destructive">
                {animalHealthQuery.error instanceof Error
                  ? animalHealthQuery.error.message
                  : "Failed to load health records"}
              </div>
            ) : healthRecords.length === 0 ? (
              <div className="text-sm text-muted-foreground">No health records available.</div>
            ) : (
              <div className="space-y-4">
                {healthRecords.slice(0, 6).map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <h4 className="font-medium">
                          {(animalHealthQuery.data?.animal.name &&
                            animalHealthQuery.data.animal.name.trim().length > 0
                            ? animalHealthQuery.data.animal.name
                            : "Unnamed") +
                            " • " +
                            (animalHealthQuery.data?.animal.tag_id ?? "")}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {animalHealthQuery.data?.animal.type} • {record.record_type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">Health Score</p>
                        <div className="mt-1 flex items-center gap-2">
                          <Progress value={currentScore ?? 0} className="h-2 w-24" />
                          <span className="text-sm font-medium">{currentScore ?? "—"}%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {record.created_at ? new Date(record.created_at).toLocaleString() : ""}
                        </p>
                      </div>
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
