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

const alerts = [
  {
    id: "ALT-001",
    severity: "critical" as const,
    title: "High Temperature",
    message: "Cow #247 has elevated temperature (40.5°C)",
    animal: "Bessie #247",
    time: "5 mins ago",
    status: "open" as const,
  },
  {
    id: "ALT-002",
    severity: "warning" as const,
    title: "Low Feed Level",
    message: "Pasture A feed level below 20%",
    animal: "Pasture A",
    time: "1 hour ago",
    status: "open" as const,
  },
  {
    id: "ALT-003",
    severity: "info" as const,
    title: "Vaccination Due",
    message: "3 animals due for vaccination this week",
    animal: "Multiple",
    time: "2 hours ago",
    status: "acknowledged" as const,
  },
];

export default function Alerts() {
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
                  <h3 className="mt-2 text-3xl font-bold text-foreground">2</h3>
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
                  <h3 className="mt-2 text-3xl font-bold text-foreground">1</h3>
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
                  <h3 className="mt-2 text-3xl font-bold text-foreground">1</h3>
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
                  <Input placeholder="Search alerts..." className="pl-10" />
                </div>
                <Select defaultValue="all">
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
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((a) => (
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
                        <Badge className={severityBadge[a.severity]}>{a.severity}</Badge>
                        <Badge
                          variant="outline"
                          className={
                            a.status === "open"
                              ? "border-warning text-warning"
                              : "border-success text-success"
                          }
                        >
                          {a.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{a.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {a.animal} • {a.time}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 md:justify-end">
                    <Button variant="outline" size="sm">
                      Log Action
                    </Button>
                    <Button size="sm" className="bg-gradient-earth text-white hover:opacity-90">
                      Acknowledge
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
