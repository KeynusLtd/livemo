import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, Thermometer, Heart, TrendingUp } from "lucide-react";
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

const vitalTrends = [
  { time: "00:00", temp: 38.5, heart: 65 },
  { time: "04:00", temp: 38.3, heart: 62 },
  { time: "08:00", temp: 38.7, heart: 68 },
  { time: "12:00", temp: 38.9, heart: 70 },
  { time: "16:00", temp: 38.6, heart: 66 },
  { time: "20:00", temp: 38.4, heart: 64 },
];

const healthMetrics = [
  { metric: "Activity", value: 95, fullMark: 100 },
  { metric: "Nutrition", value: 88, fullMark: 100 },
  { metric: "Temperature", value: 92, fullMark: 100 },
  { metric: "Heart Rate", value: 90, fullMark: 100 },
  { metric: "Behavior", value: 85, fullMark: 100 },
];

const healthStats = [
  {
    title: "Average Temperature",
    value: "38.6°C",
    status: "Normal",
    icon: Thermometer,
    variant: "success" as const,
  },
  {
    title: "Average Heart Rate",
    value: "66 bpm",
    status: "Normal",
    icon: Heart,
    variant: "success" as const,
  },
  {
    title: "Activity Level",
    value: "High",
    status: "Active",
    icon: Activity,
    variant: "success" as const,
  },
  {
    title: "Health Trend",
    value: "+2.5%",
    status: "Improving",
    icon: TrendingUp,
    variant: "success" as const,
  },
];

export default function Health() {
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
                      <Badge className="mt-2 bg-success text-success-foreground">
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
            <div className="space-y-4">
              {[
                {
                  animal: "Bessie #247",
                  type: "Dairy Cow",
                  emoji: "🐄",
                  health: 95,
                  date: "Today, 14:30",
                },
                {
                  animal: "Billy #089",
                  type: "Meat Goat",
                  emoji: "🐐",
                  health: 88,
                  date: "Today, 12:15",
                },
                {
                  animal: "Cotton #178",
                  type: "Wool Sheep",
                  emoji: "🐑",
                  health: 93,
                  date: "Today, 10:45",
                },
              ].map((record) => (
                <div
                  key={record.animal}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{record.emoji}</div>
                    <div>
                      <h4 className="font-medium">{record.animal}</h4>
                      <p className="text-sm text-muted-foreground">{record.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">Health Score</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Progress value={record.health} className="h-2 w-24" />
                        <span className="text-sm font-medium">{record.health}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{record.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
