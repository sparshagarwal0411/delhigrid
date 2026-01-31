import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface PollutionScoreProps {
  score: number;
  size?: "sm" | "md" | "lg" | "xl";
  showLabel?: boolean;
}

const getScoreStatus = (score: number) => {
  if (score >= 80) return { status: 'good', label: 'Good', color: 'bg-pollution-good' };
  if (score >= 60) return { status: 'moderate', label: 'Moderate', color: 'bg-pollution-moderate' };
  if (score >= 40) return { status: 'unhealthy', label: 'Unhealthy', color: 'bg-pollution-unhealthy' };
  if (score >= 20) return { status: 'severe', label: 'Severe', color: 'bg-pollution-severe' };
  return { status: 'hazardous', label: 'Hazardous', color: 'bg-pollution-hazardous' };
};

export function PollutionScore({ score, size = "md", showLabel = true }: PollutionScoreProps) {
  const { label, color } = getScoreStatus(score);

  const sizeClasses = {
    sm: "h-12 w-12 text-lg",
    md: "h-16 w-16 text-xl",
    lg: "h-20 w-20 text-2xl",
    xl: "h-28 w-28 text-3xl",
  };

  const labelSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-bold text-primary-foreground shadow-lg",
          sizeClasses[size],
          color
        )}
      >
        {score}
      </div>
      {showLabel && (
        <span className={cn("font-medium text-muted-foreground", labelSizes[size])}>
          {label}
        </span>
      )}
    </div>
  );
}

interface TrendIndicatorProps {
  value: number;
  label: string;
  className?: string;
}

export function TrendIndicator({ value, label, className }: TrendIndicatorProps) {
  const isPositive = value > 0;
  const isNeutral = value === 0;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
          isNeutral
            ? "bg-muted text-muted-foreground"
            : isPositive
            ? "bg-destructive/10 text-destructive"
            : "bg-success/10 text-success"
        )}
      >
        {isNeutral ? (
          <Minus className="h-3 w-3" />
        ) : isPositive ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        <span>{Math.abs(value)}%</span>
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
