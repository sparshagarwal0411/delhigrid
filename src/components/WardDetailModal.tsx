import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Ward } from "@/types";
import { getWardColor, getStatusFromScore, getStatusLabel } from "@/data/wards";
import { ArrowRight, Gauge, MapPin, Users, Ruler, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface WardDetailModalProps {
    ward: Ward | null;
    isOpen: boolean;
    onClose: () => void;
}

export function WardDetailModal({ ward, isOpen, onClose }: WardDetailModalProps) {
    if (!ward) return null;

    const status = getStatusFromScore(ward.pollutionScore);
    const statusLabel = getStatusLabel(status);
    const displayAQI = ward.aqi || (ward.pollutionScore < 20 ? 400 : ward.pollutionScore < 40 ? 300 : ward.pollutionScore < 60 ? 150 : ward.pollutionScore < 80 ? 80 : 40);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md overflow-hidden p-0 gap-0 border-none shadow-2xl">
                {/* Header Banner */}
                <div className={`h-32 ${getWardColor(ward.pollutionScore)} relative flex items-end p-6`}>
                    <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        {statusLabel}
                    </div>
                    <div className="text-white">
                        <h2 className="text-3xl font-bold flex items-center gap-2">
                            Ward {ward.id}
                        </h2>
                        <p className="opacity-90 font-medium flex items-center gap-1">
                            <MapPin className="h-4 w-4" /> {ward.name}
                        </p>
                    </div>
                </div>

                <div className="p-6 bg-background space-y-6">
                    {/* Main Stat: AQI */}
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Gauge className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground font-medium">Air Quality Index</div>
                                <div className="text-3xl font-bold leading-none">{displayAQI}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-muted-foreground font-medium">Score</div>
                            <div className="text-2xl font-bold text-muted-foreground/80">{ward.pollutionScore}/100</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/20">
                            <span className="text-xs text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" /> Population</span>
                            <span className="font-semibold">{ward.population.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/20">
                            <span className="text-xs text-muted-foreground flex items-center gap-1"><Ruler className="h-3 w-3" /> Area</span>
                            <span className="font-semibold">{ward.area} sq km</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Top Pollution Sources</h4>
                        <div className="flex flex-wrap gap-2">
                            {ward.sources.map(source => (
                                <Badge key={source} variant="secondary">{source}</Badge>
                            ))}
                        </div>
                    </div>

                    <Link to={`/ward/${ward.id}`} className="block">
                        <Button className="w-full h-12 text-lg gap-2 shadow-lg shadow-primary/20" onClick={onClose}>
                            View Full Profile
                            <ArrowRight className="h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </DialogContent>
        </Dialog>
    );
}
