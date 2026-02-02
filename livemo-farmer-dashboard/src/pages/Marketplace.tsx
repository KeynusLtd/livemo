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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Plus, ShoppingCart, Store, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useActiveFarm } from "@/hooks/useActiveFarm";
import {
  getFarmEarnings,
  listFarmListings,
  listFarmOrders,
} from "@/lib/marketplaceApi";
import type { Listing, Order } from "@/lib/marketplaceApi";

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export default function Marketplace() {
  const { activeFarmId } = useActiveFarm();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [ordersPage, setOrdersPage] = useState(1);

  const listingsQuery = useQuery({
    queryKey: ["farmListings", activeFarmId, category],
    queryFn: () =>
      listFarmListings({
        farmId: activeFarmId as number,
        page: 1,
        type: category === "livestock" ? "livestock" : category === "products" ? "product" : undefined,
      }),
    enabled: activeFarmId != null,
    staleTime: 10_000,
  });

  const ordersQuery = useQuery({
    queryKey: ["farmOrders", activeFarmId, ordersPage],
    queryFn: () => listFarmOrders({ farmId: activeFarmId as number, page: ordersPage }),
    enabled: activeFarmId != null,
    staleTime: 10_000,
  });

  const earningsQuery = useQuery({
    queryKey: ["farmEarnings", activeFarmId],
    queryFn: () => getFarmEarnings({ farmId: activeFarmId as number, days: 30 }),
    enabled: activeFarmId != null,
    staleTime: 30_000,
  });

  const listings: Listing[] = useMemo(() => listingsQuery.data?.data ?? [], [listingsQuery.data?.data]);
  const orders: Order[] = ordersQuery.data?.data ?? [];
  const earnings = earningsQuery.data;

  const filteredListings = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q.length === 0) return listings;
    return listings.filter((l) => l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q));
  }, [listings, search]);

  const activeListingsCount = listings.filter((l) => l.status === "active").length;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Marketplace</h1>
            <p className="text-muted-foreground">
              Manage listings, communicate with buyers, and track orders & earnings
            </p>
          </div>
          <Button className="bg-gradient-earth text-white shadow-md hover:opacity-90">
            <Plus className="mr-2 h-4 w-4" />
            New Listing
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Active Listings</p>
                  <h3 className="mt-2 text-3xl font-bold text-foreground">
                    {activeFarmId == null ? 0 : activeListingsCount}
                  </h3>
                  <Badge className="mt-2 bg-success text-success-foreground">Live</Badge>
                </div>
                <div className="rounded-lg bg-gradient-pasture p-3 text-white">
                  <Store className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Orders (30d)</p>
                  <h3 className="mt-2 text-3xl font-bold text-foreground">
                    {earnings?.orders_count ?? 0}
                  </h3>
                  <Badge className="mt-2 bg-sky text-white">On Track</Badge>
                </div>
                <div className="rounded-lg bg-gradient-earth p-3 text-white">
                  <ShoppingCart className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Earnings</p>
                  <h3 className="mt-2 text-3xl font-bold text-foreground">
                    {earnings ? formatMoney(earnings.revenue_total, "USD") : "USD 0.00"}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">This month</p>
                </div>
                <div className="rounded-lg bg-barn p-3 text-white">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="listings" className="w-full">
          <TabsList>
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="space-y-4">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <span>Manage Listings</span>
                  <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                    <div className="w-full md:w-64">
                      <Input
                        placeholder="Search listings..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    <Select value={category} onValueChange={(v) => setCategory(v)}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="livestock">Livestock</SelectItem>
                        <SelectItem value="products">Products</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeFarmId == null ? (
                  <div className="text-sm text-muted-foreground">Select a farm to view marketplace data.</div>
                ) : listingsQuery.isLoading ? (
                  <div className="text-sm text-muted-foreground">Loading listings...</div>
                ) : listingsQuery.isError ? (
                  <div className="text-sm text-destructive">
                    {listingsQuery.error instanceof Error
                      ? listingsQuery.error.message
                      : "Failed to load listings"}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredListings.map((l) => (
                      <div
                        key={l.id}
                        className="flex flex-col gap-3 rounded-lg border border-border p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <p className="font-medium">{l.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatMoney(l.price, l.currency)}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {l.views_count ?? 0} views
                          </p>
                        </div>
                        <div className="flex items-center justify-between gap-3 md:justify-end">
                          <Badge
                            className={
                              l.status === "active"
                                ? "bg-success text-success-foreground"
                                : l.status === "paused"
                                ? "bg-warning text-warning-foreground"
                                : "bg-muted text-foreground"
                            }
                          >
                            {l.status}
                          </Badge>
                          <Button variant="outline" size="sm" disabled>
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" disabled>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Messages
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {activeFarmId == null ? (
                  <div className="text-sm text-muted-foreground">Select a farm to view orders.</div>
                ) : ordersQuery.isLoading ? (
                  <div className="text-sm text-muted-foreground">Loading orders...</div>
                ) : ordersQuery.isError ? (
                  <div className="text-sm text-destructive">
                    {ordersQuery.error instanceof Error
                      ? ordersQuery.error.message
                      : "Failed to load orders"}
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {orders.map((o) => (
                        <div
                          key={o.id}
                          className="flex flex-col gap-3 rounded-lg border border-border p-4 md:flex-row md:items-center md:justify-between"
                        >
                          <div>
                            <p className="font-medium">{o.order_number}</p>
                            <p className="text-sm text-muted-foreground">
                              Payment: {o.payment_status}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {o.created_at ? new Date(o.created_at).toLocaleString() : ""}
                            </p>
                          </div>
                          <div className="flex items-center justify-between gap-3 md:justify-end">
                            <p className="text-sm font-medium">{formatMoney(o.total, o.currency)}</p>
                            <Badge
                              className={
                                o.status === "completed" || o.status === "delivered"
                                  ? "bg-success text-success-foreground"
                                  : "bg-sky text-white"
                              }
                            >
                              {o.status}
                            </Badge>
                            <Button variant="outline" size="sm" disabled>
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="text-sm text-muted-foreground">
                        Page {ordersQuery.data?.current_page ?? 1} of {ordersQuery.data?.last_page ?? 1}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={(ordersQuery.data?.current_page ?? 1) <= 1}
                          onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={(ordersQuery.data?.current_page ?? 1) >= (ordersQuery.data?.last_page ?? 1)}
                          onClick={() => setOrdersPage((p) => p + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
