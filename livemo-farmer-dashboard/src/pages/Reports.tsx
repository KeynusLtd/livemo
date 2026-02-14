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
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useActiveFarm } from "@/hooks/useActiveFarm";
import {
  exportFinancialReport,
  exportHealthReport,
  exportOperationsReport,
  getFinancialReport,
  getHealthReport,
  getOperationsReport,
} from "@/lib/reportsApi";
import type { ExportFormat } from "@/lib/reportsApi";

function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function guessFilename(res: Response, fallback: string) {
  const disp = res.headers.get("content-disposition") ?? "";
  const m = disp.match(/filename="?([^";]+)"?/i);
  return m?.[1] ?? fallback;
}

async function downloadResponse(res: Response, fallbackFilename: string) {
  const blob = await res.blob();
  const filename = guessFilename(res, fallbackFilename);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

type ExportHistoryItem = {
  id: string;
  farmId: number;
  reportId: string;
  reportName: string;
  format: ExportFormat;
  createdAt: string;
};

const EXPORT_HISTORY_KEY = "livemo.reports.exportHistory.v1";

function loadExportHistory(): ExportHistoryItem[] {
  try {
    const raw = localStorage.getItem(EXPORT_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ExportHistoryItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveExportHistory(items: ExportHistoryItem[]) {
  try {
    localStorage.setItem(EXPORT_HISTORY_KEY, JSON.stringify(items.slice(0, 50)));
  } catch {
    // ignore
  }
}

export default function Reports() {
  const { activeFarmId } = useActiveFarm();
  const [period, setPeriod] = useState("30d");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("json");
  const [exportHistory, setExportHistory] = useState<ExportHistoryItem[]>(() => loadExportHistory());

  const days = useMemo(() => {
    if (period === "7d") return 7;
    if (period === "ytd") return 365;
    return 30;
  }, [period]);

  const healthReportQuery = useQuery({
    queryKey: ["reportHealth", activeFarmId, days],
    queryFn: () => getHealthReport({ farmId: activeFarmId as number }),
    enabled: activeFarmId != null,
    staleTime: 30_000,
  });

  const opsReportQuery = useQuery({
    queryKey: ["reportOperations", activeFarmId, days],
    queryFn: () => getOperationsReport({ farmId: activeFarmId as number, days }),
    enabled: activeFarmId != null,
    staleTime: 30_000,
  });

  const finReportQuery = useQuery({
    queryKey: ["reportFinancial", activeFarmId],
    queryFn: () => getFinancialReport({ farmId: activeFarmId as number }),
    enabled: activeFarmId != null,
    staleTime: 30_000,
  });

  const healthScore = useMemo(() => {
    const total = healthReportQuery.data?.summary.total_records ?? 0;
    if (total === 0) return 0;
    const critical = (healthReportQuery.data?.summary.by_severity?.critical ?? 0) as number;
    const score = Math.max(0, Math.min(100, Math.round(100 - (critical / total) * 100)));
    return score;
  }, [healthReportQuery.data]);

  const marketplaceRevenue = finReportQuery.data?.summary.marketplace_revenue_total ?? 0;

  const reports = useMemo(
    () => [
      {
        id: "REP-HEALTH",
        name: "Health Summary",
        period: `Last ${days} days`,
        status: activeFarmId != null ? "ready" : "draft",
      },
      {
        id: "REP-OPS",
        name: "Operations Summary",
        period: `Last ${days} days`,
        status: activeFarmId != null ? "ready" : "draft",
      },
      {
        id: "REP-FIN",
        name: "Financial Overview",
        period: "This month",
        status: activeFarmId != null ? "ready" : "draft",
      },
    ],
    [activeFarmId, days]
  );

  const canExport = activeFarmId != null;

  const exportReport = async (reportId: string) => {
    if (!canExport || activeFarmId == null) return;

    const dateTag = new Date().toISOString().slice(0, 10);

    const reportMeta = reports.find((r) => r.id === reportId);
    const reportName = reportMeta?.name ?? reportId;

    if (reportId === "REP-HEALTH") {
      if (exportFormat === "json") {
        if (!healthReportQuery.data) return;
        downloadJson(`health-report-farm-${activeFarmId}-${dateTag}.json`, healthReportQuery.data);
      } else {
        const res = await exportHealthReport({ farmId: activeFarmId, format: exportFormat });
        await downloadResponse(res, `health-report-farm-${activeFarmId}-${dateTag}.${exportFormat}`);
      }

      const next: ExportHistoryItem[] = [
        {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          farmId: activeFarmId,
          reportId,
          reportName,
          format: exportFormat,
          createdAt: new Date().toISOString(),
        },
        ...exportHistory,
      ];
      setExportHistory(next);
      saveExportHistory(next);
      return;
    }

    if (reportId === "REP-OPS") {
      if (exportFormat === "json") {
        if (!opsReportQuery.data) return;
        downloadJson(`operations-report-farm-${activeFarmId}-${dateTag}.json`, opsReportQuery.data);
      } else {
        const res = await exportOperationsReport({ farmId: activeFarmId, days, format: exportFormat });
        await downloadResponse(res, `operations-report-farm-${activeFarmId}-${dateTag}.${exportFormat}`);
      }

      const next: ExportHistoryItem[] = [
        {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          farmId: activeFarmId,
          reportId,
          reportName,
          format: exportFormat,
          createdAt: new Date().toISOString(),
        },
        ...exportHistory,
      ];
      setExportHistory(next);
      saveExportHistory(next);
      return;
    }

    if (reportId === "REP-FIN") {
      if (exportFormat === "json") {
        if (!finReportQuery.data) return;
        downloadJson(`financial-report-farm-${activeFarmId}-${dateTag}.json`, finReportQuery.data);
      } else {
        const res = await exportFinancialReport({ farmId: activeFarmId, format: exportFormat });
        await downloadResponse(res, `financial-report-farm-${activeFarmId}-${dateTag}.${exportFormat}`);
      }

      const next: ExportHistoryItem[] = [
        {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          farmId: activeFarmId,
          reportId,
          reportName,
          format: exportFormat,
          createdAt: new Date().toISOString(),
        },
        ...exportHistory,
      ];
      setExportHistory(next);
      saveExportHistory(next);
    }
  };

  const exportCountForFarm = useMemo(() => {
    if (activeFarmId == null) return 0;
    return exportHistory.filter((h) => h.farmId === activeFarmId).length;
  }, [activeFarmId, exportHistory]);

  const recentExportsForFarm = useMemo(() => {
    if (activeFarmId == null) return [];
    return exportHistory.filter((h) => h.farmId === activeFarmId).slice(0, 5);
  }, [activeFarmId, exportHistory]);

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
                  <h3 className="mt-2 text-3xl font-bold text-foreground">{exportCountForFarm}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Last {days} days</p>
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
                  <h3 className="mt-2 text-3xl font-bold text-foreground">{healthScore}%</h3>
                  <Badge className={healthScore >= 80 ? "mt-2 bg-success text-success-foreground" : "mt-2 bg-warning text-warning-foreground"}>
                    {healthScore >= 80 ? "Stable" : "Review"}
                  </Badge>
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
                  <h3 className="mt-2 text-3xl font-bold text-foreground">
                    {marketplaceRevenue.toFixed(2)}
                  </h3>
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
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-full md:w-44">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="ytd">Year to date</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as ExportFormat)}>
                  <SelectTrigger className="w-full md:w-36">
                    <SelectValue placeholder="Export" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  className="bg-gradient-earth text-white shadow-md hover:opacity-90"
                  onClick={() => {
                    healthReportQuery.refetch();
                    opsReportQuery.refetch();
                    finReportQuery.refetch();
                  }}
                  disabled={activeFarmId == null}
                >
                  Generate
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeFarmId == null ? (
              <div className="text-sm text-muted-foreground">Select a farm to view reports.</div>
            ) : healthReportQuery.isLoading || opsReportQuery.isLoading || finReportQuery.isLoading ? (
              <div className="text-sm text-muted-foreground">Loading reports...</div>
            ) : healthReportQuery.isError || opsReportQuery.isError || finReportQuery.isError ? (
              <div className="text-sm text-destructive">
                Failed to load one or more reports.
              </div>
            ) : (
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
                      <Button variant="outline" size="sm" onClick={() => void exportReport(r.id)} disabled={!canExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Recent exports</CardTitle>
          </CardHeader>
          <CardContent>
            {activeFarmId == null ? (
              <div className="text-sm text-muted-foreground">Select a farm to view export history.</div>
            ) : recentExportsForFarm.length === 0 ? (
              <div className="text-sm text-muted-foreground">No exports yet.</div>
            ) : (
              <div className="space-y-3">
                {recentExportsForFarm.map((e) => (
                  <div key={e.id} className="flex flex-col gap-1 rounded-lg border border-border p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="font-medium">{e.reportName}</div>
                      <div className="text-sm text-muted-foreground">{new Date(e.createdAt).toLocaleString()}</div>
                    </div>
                    <Badge className="bg-muted text-foreground">{e.format}</Badge>
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
