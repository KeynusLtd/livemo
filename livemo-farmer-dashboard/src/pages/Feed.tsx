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

const feedingSchedule = [
  {
    id: "FD-001",
    time: "06:00",
    group: "Dairy Cows",
    location: "Pasture A",
    feedType: "Hay + Grain Mix",
    status: "upcoming" as const,
  },
  {
    id: "FD-002",
    time: "09:30",
    group: "Goats",
    location: "Pasture B",
    feedType: "Pellets",
    status: "completed" as const,
  },
  {
    id: "FD-003",
    time: "13:00",
    group: "Pigs",
    location: "Pen 5",
    feedType: "Commercial Feed",
    status: "upcoming" as const,
  },
  {
    id: "FD-004",
    time: "17:30",
    group: "Layer Hens",
    location: "Coop 3",
    feedType: "Layer Mash",
    status: "upcoming" as const,
  },
];

export default function Feed() {
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
                    {feedingSchedule.length}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    1 completed, {feedingSchedule.filter((x) => x.status === "upcoming").length} upcoming
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
                  <h3 className="mt-2 text-3xl font-bold text-foreground">92%</h3>
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
                  <h3 className="mt-2 text-3xl font-bold text-foreground">2</h3>
                  <Badge className="mt-2 bg-warning text-warning-foreground">Restock Soon</Badge>
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
                  <Input placeholder="Search by group or location..." />
                </div>
                <Select defaultValue="all">
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
            <div className="space-y-3">
              {feedingSchedule.map((item) => (
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
                        {item.time} • {item.group}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.location} • {item.feedType}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 md:justify-end">
                    <Badge
                      className={
                        item.status === "completed"
                          ? "bg-success text-success-foreground"
                          : "bg-sky text-white"
                      }
                    >
                      {item.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
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
