import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { AlertsList } from "@/components/AlertsList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PawPrint, Activity, Radio, TrendingUp, ListChecks } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useActiveFarm } from "@/hooks/useActiveFarm";
import { getFarmDashboard } from "@/lib/farmApi";
import { listAnimals } from "@/lib/animalApi";
import type { Animal } from "@/lib/animalApi";
import { AnimalRowCard } from "@/components/AnimalRowCard";
import { getFarmEarnings } from "@/lib/marketplaceApi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

export default function Dashboard() {
  const { activeFarmId } = useActiveFarm();

  const dashboardQuery = useQuery({
    queryKey: ["farmDashboard", activeFarmId],
    queryFn: () => getFarmDashboard(activeFarmId as number),
    enabled: activeFarmId != null,
    staleTime: 10_000,
  });

  const animalsQuery = useQuery({
    queryKey: ["dashboardAnimals", activeFarmId],
    queryFn: () =>
      listAnimals({
        farm_id: activeFarmId ?? undefined,
        page: 1,
      }),
    enabled: activeFarmId != null,
    staleTime: 10_000,
  });

  const earningsQuery = useQuery({
    queryKey: ["farmEarnings", activeFarmId],
    queryFn: () => getFarmEarnings({ farmId: activeFarmId as number, days: 30 }),
    enabled: activeFarmId != null,
    staleTime: 30_000,
  });

  const animals: Animal[] = animalsQuery.data?.data ?? [];

  const healthByCategory =
    dashboardQuery.data?.health_by_category?.map((row) => ({
      type: row.type,
      total: row.total_animals,
      healthy: row.healthy_animals,
      attention: Math.max(0, row.total_animals - row.healthy_animals),
    })) ?? [];

  const earnings = earningsQuery.data;
  const revenueTotal = earnings ? earnings.revenue_total : 0;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your livestock health and operations in real-time
          </p>
        </div>

        {activeFarmId == null ? (
          <div className="text-sm text-muted-foreground">Select a farm to view dashboard data.</div>
        ) : dashboardQuery.isLoading ? (
          <div className="text-sm text-muted-foreground">Loading dashboard...</div>
        ) : dashboardQuery.isError ? (
          <div className="text-sm text-destructive">
            {dashboardQuery.error instanceof Error
              ? dashboardQuery.error.message
              : "Failed to load dashboard"}
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Animals"
                value={dashboardQuery.data?.statistics.total_animals ?? 0}
                change={`Needs attention: ${dashboardQuery.data?.statistics.needs_attention_animals ?? 0}`}
                icon={PawPrint}
                variant="default"
              />
              <StatCard
                title="Healthy"
                value={dashboardQuery.data?.statistics.healthy_animals ?? 0}
                change={
                  dashboardQuery.data?.statistics.total_animals
                    ? `${Math.round(
                        ((dashboardQuery.data.statistics.healthy_animals ?? 0) /
                          dashboardQuery.data.statistics.total_animals) *
                          100
                      )}% health rate`
                    : "—"
                }
                icon={Activity}
                variant="success"
              />
              <StatCard
                title="Sensors Online"
                value={
                  dashboardQuery.data?.statistics.sensors_online ??
                  dashboardQuery.data?.statistics.active_sensors ??
                  0
                }
                change={`${dashboardQuery.data?.statistics.sensors_online_percent ?? 0}% online`}
                icon={Radio}
                variant="default"
              />
              <StatCard
                title="Revenue (30d)"
                value={revenueTotal.toFixed(2)}
                change={`Orders: ${earnings?.orders_count ?? 0}`}
                icon={TrendingUp}
                variant="success"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <StatCard
                title="Feedings due today"
                value={dashboardQuery.data?.statistics.tasks?.feedings_due_today ?? 0}
                icon={ListChecks}
                variant="default"
              />
              <StatCard
                title="Pasture rotations (7d)"
                value={dashboardQuery.data?.statistics.tasks?.pasture_rotations_due_7d ?? 0}
                icon={ListChecks}
                variant="default"
              />
              <StatCard
                title="Vaccinations due (30d)"
                value={dashboardQuery.data?.statistics.tasks?.vaccinations_due_30d ?? 0}
                icon={ListChecks}
                variant="default"
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Health Status by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={healthByCategory}>
                      <defs>
                        <linearGradient id="colorHealthy" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(120, 40%, 35%)" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="hsl(120, 40%, 35%)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorAttention" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(25, 75%, 47%)" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="hsl(25, 75%, 47%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="type" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="healthy"
                        stroke="hsl(120, 40%, 35%)"
                        fillOpacity={1}
                        fill="url(#colorHealthy)"
                        name="Healthy"
                      />
                      <Area
                        type="monotone"
                        dataKey="attention"
                        stroke="hsl(25, 75%, 47%)"
                        fillOpacity={1}
                        fill="url(#colorAttention)"
                        name="Needs Attention"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Revenue Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={[{ label: "Revenue", value: revenueTotal }]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(30, 25%, 24%)"
                        strokeWidth={3}
                        dot={{ fill: "hsl(30, 25%, 24%)", r: 4 }}
                        name="Revenue"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Recent Animals</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {animals.slice(0, 4).map((animal) => (
                    <AnimalRowCard key={animal.id} animal={animal} />
                  ))}
                </div>
              </div>

              <div>
                <AlertsList alerts={dashboardQuery.data?.recent_alerts ?? []} />
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
