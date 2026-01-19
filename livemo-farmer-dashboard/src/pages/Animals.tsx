import { Layout } from "@/components/Layout";
import { AnimalCard } from "@/components/AnimalCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search } from "lucide-react";

const allAnimals = [
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
  {
    id: "156",
    name: "Porky",
    type: "Commercial Pig",
    emoji: "🐷",
    health: 91,
    temperature: 39.0,
    heartRate: 75,
    location: "Pen 5",
    status: "healthy" as const,
  },
  {
    id: "203",
    name: "Thunder",
    type: "Work Horse",
    emoji: "🐴",
    health: 87,
    temperature: 38.0,
    heartRate: 40,
    location: "Stable A",
    status: "healthy" as const,
  },
  {
    id: "178",
    name: "Cotton",
    type: "Wool Sheep",
    emoji: "🐑",
    health: 93,
    temperature: 39.5,
    heartRate: 90,
    location: "Pasture C",
    status: "healthy" as const,
  },
];

export default function Animals() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Animals</h1>
            <p className="text-muted-foreground">
              Manage and monitor your livestock
            </p>
          </div>
          <Button className="bg-gradient-earth text-white shadow-md hover:opacity-90">
            <Plus className="mr-2 h-4 w-4" />
            Add Animal
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or ID..."
              className="pl-10"
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="cattle">🐄 Cattle</SelectItem>
              <SelectItem value="poultry">🐔 Poultry</SelectItem>
              <SelectItem value="goats">🐐 Goats</SelectItem>
              <SelectItem value="sheep">🐑 Sheep</SelectItem>
              <SelectItem value="pigs">🐷 Pigs</SelectItem>
              <SelectItem value="horses">🐴 Horses</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="healthy">Healthy</SelectItem>
              <SelectItem value="warning">Needs Attention</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Animals Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allAnimals.map((animal) => (
            <AnimalCard key={animal.id} {...animal} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
