import { Car, AlertTriangle, CheckCircle2, Siren } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type TrafficStatus = 'low' | 'moderate' | 'heavy' | 'severe';

interface TrafficIndicatorProps {
    status?: TrafficStatus;
    className?: string;
    showLabel?: boolean;
}

export const TrafficIndicator = ({ status = 'moderate', className, showLabel = true }: TrafficIndicatorProps) => {
    const config = {
        low: {
            color: "bg-emerald-100 text-emerald-700 border-emerald-200",
            icon: CheckCircle2,
            label: "Low Traffic"
        },
        moderate: {
            color: "bg-yellow-100 text-yellow-700 border-yellow-200",
            icon: Car,
            label: "Moderate Traffic"
        },
        heavy: {
            color: "bg-orange-100 text-orange-700 border-orange-200",
            icon: AlertTriangle,
            label: "Heavy Traffic"
        },
        severe: {
            color: "bg-red-100 text-red-700 border-red-200",
            icon: Siren,
            label: "Severe Congestion"
        }
    };

    const current = config[status] || config.moderate;
    const Icon = current.icon;

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <Badge variant="outline" className={cn("gap-1.5 px-3 py-1 font-medium border-2", current.color)}>
                <Icon className="h-3.5 w-3.5" />
                {showLabel && current.label}
            </Badge>
        </div>
    );
};
