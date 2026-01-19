import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Radio, Battery, Signal, MapPin, Plus } from "lucide-react";

const sensors = [
  {
    id: "SEN-001",
    animalId: "247",
    animalName: "Bessie",
    type: "Health Monitor",
    battery: 85,
    signal: 95,
    status: "active",
    lastUpdate: "2 mins ago",
  },
  {
    id: "SEN-002",
    animalId: "142",
    animalName: "Clucky",
    type: "Health Monitor",
    battery: 45,
    signal: 88,
    status: "active",
    lastUpdate: "5 mins ago",
  },
  {
    id: "SEN-003",
    animalId: "089",
    animalName: "Billy",
    type: "GPS Tracker",
    battery: 92,
    signal: 100,
    status: "active",
    lastUpdate: "1 min ago",
  },
  {
    id: "SEN-004",
    animalId: "156",
    animalName: "Porky",
    type: "Health Monitor",
    battery: 78,
    signal: 92,
    status: "active",
    lastUpdate: "3 mins ago",
  },
  {
    id: "SEN-005",
    animalId: "203",
    animalName: "Thunder",
    type: "Activity Sensor",
    battery: 15,
    signal: 75,
    status: "warning",
    lastUpdate: "10 mins ago",
  },
  {
    id: "SEN-006",
    animalId: "178",
    animalName: "Cotton",
    type: "Health Monitor",
    battery: 88,
    signal: 90,
    status: "active",
    lastUpdate: "1 min ago",
  },
];

export default function Sensors() {
  const activeSensors = sensors.filter((s) => s.status === "active").length;
  const avgBattery = Math.round(
    sensors.reduce((acc, s) => acc + s.battery, 0) / sensors.length
  );
  const avgSignal = Math.round(
    sensors.reduce((acc, s) => acc + s.signal, 0) / sensors.length
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Sensors</h1>
            <p className="text-muted-foreground">
              Monitor and manage IoT sensors across your livestock
            </p>
          </div>
          <Button className="bg-gradient-earth text-white shadow-md hover:opacity-90">
            <Plus className="mr-2 h-4 w-4" />
            Add Sensor
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Sensors
                  </p>
                  <h3 className="mt-2 text-3xl font-bold text-foreground">
                    {activeSensors}/{sensors.length}
                  </h3>
                  <Badge className="mt-2 bg-success text-success-foreground">
                    All Online
                  </Badge>
                </div>
                <div className="rounded-lg bg-gradient-earth p-3 text-white">
                  <Radio className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Average Battery
                  </p>
                  <h3 className="mt-2 text-3xl font-bold text-foreground">
                    {avgBattery}%
                  </h3>
                  <div className="mt-2">
                    <Progress value={avgBattery} className="h-2" />
                  </div>
                </div>
                <div className="rounded-lg bg-gradient-pasture p-3 text-white">
                  <Battery className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Average Signal
                  </p>
                  <h3 className="mt-2 text-3xl font-bold text-foreground">
                    {avgSignal}%
                  </h3>
                  <Badge className="mt-2 bg-success text-success-foreground">
                    Excellent
                  </Badge>
                </div>
                <div className="rounded-lg bg-sky p-3 text-white">
                  <Signal className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sensors List */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>All Sensors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sensors.map((sensor) => (
                <div
                  key={sensor.id}
                  className="flex flex-col gap-4 rounded-lg border border-border p-4 md:flex-row md:items-center"
                >
                  <div className="flex flex-1 items-center gap-4">
                    <div className="rounded-lg bg-muted p-3">
                      <Radio className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{sensor.id}</h4>
                      <p className="text-sm text-muted-foreground">
                        {sensor.animalName} (#{sensor.animalId}) • {sensor.type}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:flex md:items-center md:gap-6">
                    <div className="flex items-center gap-2">
                      <Battery
                        className={`h-4 w-4 ${
                          sensor.battery > 50
                            ? "text-success"
                            : sensor.battery > 20
                            ? "text-warning"
                            : "text-destructive"
                        }`}
                      />
                      <div>
                        <p className="text-xs text-muted-foreground">Battery</p>
                        <p className="text-sm font-medium">{sensor.battery}%</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Signal className="h-4 w-4 text-success" />
                      <div>
                        <p className="text-xs text-muted-foreground">Signal</p>
                        <p className="text-sm font-medium">{sensor.signal}%</p>
                      </div>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                      <Badge
                        className={
                          sensor.status === "active"
                            ? "bg-success text-success-foreground"
                            : "bg-warning text-warning-foreground"
                        }
                      >
                        {sensor.status}
                      </Badge>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {sensor.lastUpdate}
                      </p>
                    </div>

                    <Button variant="outline" size="sm">
                      <MapPin className="mr-2 h-4 w-4" />
                      Track
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
