import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { AnimalCard } from "@/components/AnimalCard";
import { AlertsList } from "@/components/AlertsList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PawPrint, Activity, Radio, TrendingUp } from "lucide-react";
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

const healthData = [
  { day: "Mon", healthy: 245, attention: 2 },
  { day: "Tue", healthy: 243, attention: 4 },
  { day: "Wed", healthy: 246, attention: 1 },
  { day: "Thu", healthy: 244, attention: 3 },
  { day: "Fri", healthy: 247, attention: 0 },
  { day: "Sat", healthy: 246, attention: 1 },
  { day: "Sun", healthy: 245, attention: 2 },
];

const productivityData = [
  { month: "Jan", value: 85 },
  { month: "Feb", value: 88 },
  { month: "Mar", value: 92 },
  { month: "Apr", value: 90 },
  { month: "May", value: 94 },
  { month: "Jun", value: 96 },
];

const recentAnimals = [
  {
    id: "247",
    name: "Bessie",
    type: "Dairy Cow",
    emoji: "🐄",
    health: 95,
    temperature: 38.5,
    heartRate: 65,
    location: "Pasture A",
    status: "healthy" as const,
  },
  {
    id: "142",
    name: "Clucky",
    type: "Layer Hen",
    emoji: "🐔",
    health: 72,
    temperature: 40.5,
    heartRate: 280,
    location: "Coop 3",
    status: "warning" as const,
  },
  {
    id: "089",
    name: "Billy",
    type: "Meat Goat",
    emoji: "🐐",
    health: 88,
    temperature: 39.2,
    heartRate: 85,
    location: "Pasture B",
    status: "healthy" as const,
  },
];

export default function Dashboard() {
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

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Animals"
            value="247"
            change="+5 this week"
            icon={PawPrint}
            variant="default"
          />
          <StatCard
            title="Healthy"
            value="245"
            change="99.2% health rate"
            icon={Activity}
            variant="success"
          />
          <StatCard
            title="Active Sensors"
            value="247"
            change="100% online"
            icon={Radio}
            variant="default"
          />
          <StatCard
            title="Productivity"
            value="96%"
            change="+4% vs last month"
            icon={TrendingUp}
            variant="success"
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Health Status Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={healthData}>
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
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
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
              <CardTitle>Productivity Score</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={productivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
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
                    name="Score"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Animals</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {recentAnimals.map((animal) => (
                <AnimalCard key={animal.id} {...animal} />
              ))}
            </div>
          </div>

          <div>
            <AlertsList />
          </div>
        </div>
      </div>
    </Layout>
  );
}
