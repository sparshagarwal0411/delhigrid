import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PollutionScore, TrendIndicator } from "@/components/PollutionScore";
import { Ward } from "@/types";
import { getStatusFromScore } from "@/data/wards";
import { MapPin, Users, Ruler, ChevronRight, Gauge } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WardDetailModal } from "@/components/WardDetailModal";

interface WardCardProps {
  ward: Ward;
  showDetails?: boolean;
}

export function WardCard({ ward, showDetails = true }: WardCardProps) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const status = getStatusFromScore(ward.pollutionScore);

  const handleClick = () => {
    // Only show modal if details are shown (list view context usually)
    // If showDetails is false (grid view card), keep original navigation or let parent handle it
    // But since grid view doesn't use WardCard usually (it uses buttons in DelhiMap),
    // WardCard is primarily for the list.
    setShowModal(true);
  };

  return (
    <>
      <Card
        variant="civic"
        className="hover:shadow-lg transition-all cursor-pointer group"
        onClick={handleClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                Ward {ward.id}
              </CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {ward.name}
              </CardDescription>
            </div>
            <PollutionScore score={ward.pollutionScore} size="sm" showLabel={false} />
          </div>
          <Badge variant="outline" className="w-fit mt-2">
            {ward.zone}
          </Badge>
        </CardHeader>

        {showDetails && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{ward.population.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Ruler className="h-4 w-4" />
                <span>{ward.area} sq km</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              {ward.sources.slice(0, 2).map((source) => (
                <Badge key={source} variant="secondary" className="text-xs">
                  {source}
                </Badge>
              ))}
              {ward.sources.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{ward.sources.length - 2} more
                </Badge>
              )}
            </div>

            {ward.aqi !== undefined && ward.aqi !== null && (
              <div className="flex items-center gap-2 text-sm">
                <Gauge className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">AQI:</span>
                <span className="font-semibold">{ward.aqi}</span>
                {ward.pm25 && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">PM2.5:</span>
                    <span className="font-semibold">{ward.pm25} µg/m³</span>
                  </>
                )}
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t">
              <TrendIndicator value={ward.trend7Days} label="7 days" />
              <Button variant="ghost" size="sm" className="gap-1">
                View Details
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      <WardDetailModal
        ward={ward}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}
