import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, FileText } from "lucide-react";

const reports = [
  {
    id: "REP-HEALTH-01",
    name: "Health Summary",
    period: "Last 30 days",
    status: "ready" as const,
  },
  {
    id: "REP-PROD-01",
    name: "Production & Efficiency",
    period: "Last 30 days",
    status: "ready" as const,
  },
  {
    id: "REP-FIN-01",
    name: "Financial Overview",
    period: "This month",
    status: "ready" as const,
  },
  {
    id: "REP-COMP-01",
    name: "Compliance Export",
    period: "Year to date",
    status: "draft" as const,
  },
];

export default function Reports() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">
            Generate reports on health, production, and financial performance
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Exports</p>
                  <h3 className="mt-2 text-3xl font-bold text-foreground">12</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Last 30 days</p>
                </div>
                <div className="rounded-lg bg-gradient-earth p-3 text-white">
                  <FileText className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Health Score</p>
                  <h3 className="mt-2 text-3xl font-bold text-foreground">91%</h3>
                  <Badge className="mt-2 bg-success text-success-foreground">Stable</Badge>
                </div>
                <div className="rounded-lg bg-gradient-pasture p-3 text-white">
                  <FileText className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                  <h3 className="mt-2 text-3xl font-bold text-foreground">R 48,200</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Marketplace + Direct</p>
                </div>
                <div className="rounded-lg bg-sky p-3 text-white">
                  <FileText className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <span>Available Reports</span>
              <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                <Select defaultValue="30d">
                  <SelectTrigger className="w-full md:w-44">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="ytd">Year to date</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="bg-gradient-earth text-white shadow-md hover:opacity-90">
                  Generate
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reports.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-col gap-3 rounded-lg border border-border p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-medium">{r.name}</p>
                    <p className="text-sm text-muted-foreground">{r.period}</p>
                  </div>
                  <div className="flex items-center justify-between gap-3 md:justify-end">
                    <Badge
                      className={
                        r.status === "ready"
                          ? "bg-success text-success-foreground"
                          : "bg-warning text-warning-foreground"
                      }
                    >
                      {r.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Export
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
