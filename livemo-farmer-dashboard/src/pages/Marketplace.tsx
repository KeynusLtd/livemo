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

const livestockListings = [
  {
    id: "LIV-001",
    title: "Dairy Cow (Healthy)",
    price: "R 18,000",
    status: "active" as const,
    views: 124,
    inquiries: 6,
  },
  {
    id: "LIV-002",
    title: "Meat Goat (2 years)",
    price: "R 1,800",
    status: "paused" as const,
    views: 52,
    inquiries: 1,
  },
];

const productListings = [
  {
    id: "PROD-010",
    title: "Fresh Milk (20L)",
    price: "R 320",
    status: "active" as const,
    views: 88,
    inquiries: 4,
  },
  {
    id: "PROD-011",
    title: "Free-range Eggs (Tray)",
    price: "R 95",
    status: "active" as const,
    views: 143,
    inquiries: 12,
  },
];

const recentOrders = [
  {
    id: "ORD-1001",
    item: "Free-range Eggs (Tray)",
    amount: "R 190",
    status: "processing" as const,
    time: "Today",
  },
  {
    id: "ORD-1000",
    item: "Fresh Milk (20L)",
    amount: "R 320",
    status: "completed" as const,
    time: "Yesterday",
  },
];

export default function Marketplace() {
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
                  <h3 className="mt-2 text-3xl font-bold text-foreground">4</h3>
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
                  <h3 className="mt-2 text-3xl font-bold text-foreground">18</h3>
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
                  <h3 className="mt-2 text-3xl font-bold text-foreground">R 48,200</h3>
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
                      <Input placeholder="Search listings..." />
                    </div>
                    <Select defaultValue="all">
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
                <div className="space-y-6">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">Livestock Marketplace</p>
                    {livestockListings.map((l) => (
                      <div
                        key={l.id}
                        className="flex flex-col gap-3 rounded-lg border border-border p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <p className="font-medium">{l.title}</p>
                          <p className="text-sm text-muted-foreground">{l.price}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {l.views} views • {l.inquiries} inquiries
                          </p>
                        </div>
                        <div className="flex items-center justify-between gap-3 md:justify-end">
                          <Badge
                            className={
                              l.status === "active"
                                ? "bg-success text-success-foreground"
                                : "bg-warning text-warning-foreground"
                            }
                          >
                            {l.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Messages
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">Products Marketplace</p>
                    {productListings.map((l) => (
                      <div
                        key={l.id}
                        className="flex flex-col gap-3 rounded-lg border border-border p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <p className="font-medium">{l.title}</p>
                          <p className="text-sm text-muted-foreground">{l.price}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {l.views} views • {l.inquiries} inquiries
                          </p>
                        </div>
                        <div className="flex items-center justify-between gap-3 md:justify-end">
                          <Badge className="bg-success text-success-foreground">{l.status}</Badge>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Messages
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentOrders.map((o) => (
                    <div
                      key={o.id}
                      className="flex flex-col gap-3 rounded-lg border border-border p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="font-medium">{o.id}</p>
                        <p className="text-sm text-muted-foreground">{o.item}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{o.time}</p>
                      </div>
                      <div className="flex items-center justify-between gap-3 md:justify-end">
                        <p className="text-sm font-medium">{o.amount}</p>
                        <Badge
                          className={
                            o.status === "completed"
                              ? "bg-success text-success-foreground"
                              : "bg-sky text-white"
                          }
                        >
                          {o.status}
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
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
