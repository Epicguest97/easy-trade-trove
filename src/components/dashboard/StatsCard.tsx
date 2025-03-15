
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

type StatsCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
};

const StatsCard = ({ title, value, icon, trend, className }: StatsCardProps) => {
  return (
    <Card className={cn("p-6 glass animate-fade-up", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-semibold mt-1">{value}</h3>
          {trend && (
            <p className={cn(
              "text-sm mt-2",
              trend.isPositive ? "text-green-500" : "text-red-500"
            )}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className="text-muted-foreground">
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;
