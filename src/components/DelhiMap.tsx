import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WardSearch } from "@/components/WardSearch";
import { WardCard } from "@/components/WardCard";
import { usePollutionData } from "@/hooks/usePollutionData";
import { Ward } from "@/types";
import {
  Map as MapIcon,
  Grid,
  List,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Wifi,
  WifiOff,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  SortAsc,
  SortDesc
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getStatusFromScore, getStatusLabel, getWardColor } from "@/data/wards";

type SortOption = 'aqi-desc' | 'aqi-asc' | 'alphabetical' | 'id-asc' | 'id-desc' | 'score-desc' | 'score-asc';

export function DelhiMap() {
  const { wards, avgPM25, avgAQI, lastUpdated, isLoading, isUsingRealData, refetch } = usePollutionData();
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [hoveredWard, setHoveredWard] = useState<Ward | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState<SortOption>('id-asc');
  const wardsPerPage = 100;

  const zones = [...new Set(wards.map((w: Ward) => w.zone))];

  // Filter by zone
  const filteredWards = useMemo(() => {
    let filtered = selectedZone
      ? wards.filter((w: Ward) => w.zone === selectedZone)
      : wards;

    // Sort wards
    filtered = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'aqi-desc':
          return ((b as any).aqi || 0) - ((a as any).aqi || 0);
        case 'aqi-asc':
          return ((a as any).aqi || 0) - ((b as any).aqi || 0);
        case 'alphabetical':
          return a.name.localeCompare(b.name);
        case 'id-asc':
          return a.id - b.id;
        case 'id-desc':
          return b.id - a.id;
        case 'score-desc':
          return b.pollutionScore - a.pollutionScore;
        case 'score-asc':
          return a.pollutionScore - b.pollutionScore;
        default:
          return a.id - b.id;
      }
    });

    return filtered;
  }, [wards, selectedZone, sortOption]);

  // Pagination
  const totalPages = Math.ceil(filteredWards.length / wardsPerPage);
  const startIndex = (currentPage - 1) * wardsPerPage;
  const endIndex = startIndex + wardsPerPage;
  const currentWards = filteredWards.slice(startIndex, endIndex);
  const currentRange = `${startIndex + 1}-${Math.min(endIndex, filteredWards.length)}`;

  // Reset to page 1 when filter changes
  const handleZoneChange = (zone: string | null) => {
    setSelectedZone(zone);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortOption(value as SortOption);
    setCurrentPage(1);
  };



  return (
    <div className="space-y-6">
      {/* Search and Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <WardSearch />

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>



      {/* Interactive Map Visualization */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <MapIcon className="h-5 w-5 text-primary" />
                Delhi Ward Map
              </CardTitle>
              {/* Real-time data indicator */}
              <Badge variant={isUsingRealData ? "default" : "secondary"} className="flex items-center gap-1">
                {isLoading ? (
                  <><Loader2 className="h-3 w-3 animate-spin" /> Loading...</>
                ) : isUsingRealData ? (
                  <><Wifi className="h-3 w-3" /> Live Data</>
                ) : (
                  <><WifiOff className="h-3 w-3" /> Mock Data</>
                )}
              </Badge>
              {avgPM25 && (
                <Badge variant="outline" className="text-xs">
                  Avg PM2.5: {avgPM25} µg/m³
                </Badge>
              )}
              {avgAQI && (
                <Badge variant="outline" className="text-xs">
                  Avg AQI: {avgAQI}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={refetch} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="ghost" size="icon">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {lastUpdated && (
            <div className="text-xs text-muted-foreground mt-1">
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {/* Simplified Map Grid Representation */}
          <div className="relative bg-muted/20 p-6">
            {/* Pagination Controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">
                Showing wards {currentRange} of {filteredWards.length}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="min-w-[40px]"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-10 md:grid-cols-16 lg:grid-cols-20 gap-1">
              {currentWards.map((ward) => {
                const status = getStatusFromScore(ward.pollutionScore);
                const statusLabel = getStatusLabel(status);
                // Use explicit AQI if available, otherwise estimate from score for display consistency
                const displayAQI = ward.aqi || (ward.pollutionScore < 20 ? 400 : ward.pollutionScore < 40 ? 300 : ward.pollutionScore < 60 ? 150 : ward.pollutionScore < 80 ? 80 : 40);

                return (
                  <Tooltip key={ward.id} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <button
                        className={`
                          aspect-square rounded-sm transition-all duration-200 
                          ${getWardColor(ward.pollutionScore)}
                          hover:scale-110 hover:z-10 hover:shadow-lg
                          ${hoveredWard?.id === ward.id ? 'ring-2 ring-primary scale-110 z-10' : ''}
                          flex items-center justify-center text-white text-[8px] md:text-[10px] font-bold
                          shadow-sm cursor-pointer
                        `}
                        onMouseEnter={() => setHoveredWard(ward)}
                        onMouseLeave={() => setHoveredWard(null)}
                        onClick={() => window.location.href = `/ward/${ward.id}`}
                      >
                        {ward.id}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="p-0 border-none shadow-xl">
                      <div className="w-48 overflow-hidden rounded-md bg-card">
                        {/* Status Banner */}
                        <div className={`px-3 py-2 text-white font-bold flex justify-between items-center ${getWardColor(ward.pollutionScore)}`}>
                          <span>{statusLabel}</span>
                          <span className="text-xs opacity-90">Ward {ward.id}</span>
                        </div>

                        {/* Content */}
                        <div className="p-3 bg-background text-foreground text-center">
                          <div className="text-sm font-medium truncate mb-1" title={ward.name}>
                            {ward.name}
                          </div>

                          <div className="flex items-baseline justify-center gap-1 mt-2">
                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">AQI</span>
                            <span className={`text-3xl font-bold ${displayAQI > 300 ? 'text-pollution-hazardous' :
                              displayAQI > 200 ? 'text-pollution-severe' :
                                displayAQI > 100 ? 'text-pollution-unhealthy' :
                                  'text-pollution-moderate'
                              }`}>
                              {displayAQI}
                            </span>
                          </div>

                          <div className="mt-2 text-xs text-muted-foreground border-t pt-2 flex justify-between">
                            <span>Score: {ward.pollutionScore}/100</span>
                            <span>{ward.zone}</span>
                          </div>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm bg-pollution-good" />
                <span>Good (80+)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm bg-pollution-moderate" />
                <span>Moderate (60-79)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm bg-pollution-unhealthy" />
                <span>Unhealthy (40-59)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm bg-pollution-severe" />
                <span>Severe (20-39)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm bg-pollution-hazardous" />
                <span>Hazardous (&lt;20)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zone Filter and Sorting - Moved below grid as requested */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-muted/20 p-4 rounded-lg">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedZone === null ? "secondary" : "outline"}
            size="sm"
            onClick={() => handleZoneChange(null)}
          >
            All Zones
          </Button>
          {zones.map((zone: string) => (
            <Button
              key={zone}
              variant={selectedZone === zone ? "secondary" : "outline"}
              size="sm"
              onClick={() => handleZoneChange(zone)}
            >
              {zone}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Select value={sortOption} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[200px] bg-background">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="id-asc">Ward ID (Ascending)</SelectItem>
              <SelectItem value="id-desc">Ward ID (Descending)</SelectItem>
              <SelectItem value="aqi-desc">AQI (Highest First)</SelectItem>
              <SelectItem value="aqi-asc">AQI (Lowest First)</SelectItem>
              <SelectItem value="score-desc">Score (Best First)</SelectItem>
              <SelectItem value="score-asc">Score (Worst First)</SelectItem>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg font-semibold">
            {selectedZone ? `${selectedZone} Wards` : 'All Wards'} ({filteredWards.length})
            {sortOption !== 'id-asc' && (
              <span className="text-sm text-muted-foreground font-normal ml-2">
                (Sorted by {sortOption === 'aqi-desc' ? 'AQI (High to Low)' :
                  sortOption === 'aqi-asc' ? 'AQI (Low to High)' :
                    sortOption === 'alphabetical' ? 'Alphabetical' :
                      sortOption === 'score-desc' ? 'Score (Best First)' :
                        sortOption === 'score-asc' ? 'Score (Worst First)' :
                          sortOption === 'id-desc' ? 'ID (Descending)' : 'ID (Ascending)'})
              </span>
            )}
          </h3>
        </div>

        <div className={viewMode === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          : "space-y-3"
        }>
          {filteredWards.map((ward) => (
            <WardCard key={ward.id} ward={ward} showDetails={viewMode === "grid"} />
          ))}
        </div>
      </div>
    </div>
  );
}
