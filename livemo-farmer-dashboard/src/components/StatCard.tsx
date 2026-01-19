import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "danger";
}

export function StatCard({ title, value, change, icon: Icon, variant = "default" }: StatCardProps) {
  const variantStyles = {
    default: "bg-gradient-earth",
    success: "bg-gradient-pasture",
    warning: "bg-warning",
    danger: "bg-barn",
  };

  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="mt-2 text-3xl font-bold text-foreground">{value}</h3>
            {change && (
              <p className="mt-2 text-sm text-muted-foreground">{change}</p>
            )}
          </div>
          <div className={cn("rounded-lg p-3 text-white", variantStyles[variant])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
