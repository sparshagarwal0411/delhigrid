import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PollutionScore, TrendIndicator } from "@/components/PollutionScore";
import { getWardById, getStatusFromScore, getStatusLabel } from "@/data/wards";
import { usePollutionData } from "@/hooks/usePollutionData";
import { Ward } from "@/types";
import {
  ArrowLeft,
  MapPin,
  Users,
  Ruler,
  Wind,
  Droplets,
  Trash2,
  Volume2,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  BookOpen,
  ExternalLink,
  RefreshCw,
  Gauge
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { TrafficIndicator } from "@/components/TrafficIndicator";


const WardProfile = () => {
  const { id } = useParams<{ id: string }>();
  const wardId = parseInt(id || "1");
  const ward = getWardById(wardId);
  const { wards, isLoading, refetch, isUsingRealData } = usePollutionData();
  const [wardWithAQI, setWardWithAQI] = useState<Ward | undefined>(ward);

  useEffect(() => {
    // Reset scroll to top when ward changes
    window.scrollTo(0, 0);

    const updatedWard = wards.find(w => w.id === wardId);
    if (updatedWard) {
      setWardWithAQI(updatedWard);
    }
  }, [wards, wardId]);

  if (!ward || !wardWithAQI) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Ward Not Found</h1>
          <Link to="/map">
            <Button variant="civic">Back to Map</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const getAQICategory = (aqi: number) => {
    if (aqi <= 50) return { label: 'Good', color: 'text-success', bg: 'bg-success/10' };
    if (aqi <= 100) return { label: 'Moderate', color: 'text-info', bg: 'bg-info/10' };
    if (aqi <= 150) return { label: 'Unhealthy for Sensitive', color: 'text-warning', bg: 'bg-warning/10' };
    if (aqi <= 200) return { label: 'Unhealthy', color: 'text-destructive', bg: 'bg-destructive/10' };
    if (aqi <= 300) return { label: 'Very Unhealthy', color: 'text-destructive', bg: 'bg-destructive/20' };
    return { label: 'Hazardous', color: 'text-destructive', bg: 'bg-destructive/30' };
  };

  const pollutionData = [
    { type: 'air', label: 'Air Quality', value: wardWithAQI.airQuality, icon: Wind, color: 'text-info' },
    { type: 'water', label: 'Water Quality', value: wardWithAQI.waterQuality, icon: Droplets, color: 'text-primary' },
    { type: 'waste', label: 'Waste Management', value: wardWithAQI.wasteManagement, icon: Trash2, color: 'text-warning' },
    { type: 'noise', label: 'Noise Level', value: wardWithAQI.noiseLevel, icon: Volume2, color: 'text-destructive' },
  ];

  const educationContent = [
    {
      title: "Why is Air Quality Low?",
      content: `Ward ${wardWithAQI.id} experiences elevated PM2.5 levels primarily due to ${wardWithAQI.sources[0]} and ${wardWithAQI.sources[1] || 'local activities'}. Dense traffic during peak hours and inadequate green cover contribute to poor air dispersion.`
    },
    {
      title: "Understanding Water Contamination",
      content: `Groundwater quality is affected by improper sewage disposal and industrial runoff. Regular testing shows elevated levels of contaminants in certain pockets of this ward.`
    },
    {
      title: "Waste Management Challenges",
      content: `With a population of ${wardWithAQI.population.toLocaleString()}, the ward generates significant daily waste. Segregation compliance and timely collection remain key challenges.`
    }
  ];

  const actionItems = [
    { action: "Participate in weekly ward clean-up drives", impact: "High" },
    { action: "Report open burning incidents via the app", impact: "Medium" },
    { action: "Install air purifying plants at home", impact: "Medium" },
    { action: "Use public transport or carpool", impact: "High" },
    { action: "Segregate waste at source", impact: "High" },
    { action: "Report water leakages immediately", impact: "Low" },
  ];

  return (
    <Layout>
      <div className="container py-8">
        {/* Back Button */}
        <Link to="/map" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Map
        </Link>

        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-6 items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className="text-sm">Ward {ward.id}</Badge>
              <Badge variant="secondary">{ward.zone}</Badge>
              {ward.trafficStatus && <TrafficIndicator status={ward.trafficStatus} />}
            </div>
            <h1 className="text-3xl font-heading font-bold mb-2">{wardWithAQI.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {ward.zone}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {wardWithAQI.population.toLocaleString()} residents
              </span>
              <span className="flex items-center gap-1">
                <Ruler className="h-4 w-4" />
                {wardWithAQI.area} sq km
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Card variant="pollution" className="p-6">
              <div className="flex items-center gap-6">
                <PollutionScore score={wardWithAQI.pollutionScore} size="xl" />
                <div className="space-y-2">
                  <div className="font-semibold">Overall Score</div>
                  <TrendIndicator value={wardWithAQI.trend7Days} label="7 days" />
                  <TrendIndicator value={wardWithAQI.trend30Days} label="30 days" />
                </div>
              </div>
            </Card>

            {/* Live AQI Display - Always show if AQI is available */}
            {wardWithAQI && (wardWithAQI.aqi !== undefined && wardWithAQI.aqi !== null) && (
              <Card className="border-2 border-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Gauge className="h-5 w-5 text-primary" />
                      Air Quality Index (AQI)
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {isUsingRealData && (
                        <Badge variant="default" className="bg-success text-success-foreground">
                          Live
                        </Badge>
                      )}
                      <Button variant="ghost" size="icon" onClick={refetch} disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-primary">{wardWithAQI.aqi}</div>
                      <div className="text-sm text-muted-foreground mt-1">AQI</div>
                    </div>
                    <div className="flex-1">
                      {(() => {
                        const category = getAQICategory(wardWithAQI.aqi!);
                        return (
                          <div className={`p-4 rounded-lg ${category.bg}`}>
                            <div className={`font-semibold text-lg ${category.color}`}>
                              {category.label}
                            </div>
                            {wardWithAQI.pm25 && (
                              <div className="text-sm text-muted-foreground mt-2">
                                PM2.5: {wardWithAQI.pm25} µg/m³
                              </div>
                            )}
                            {wardWithAQI.lastUpdated ? (
                              <div className="text-xs text-muted-foreground mt-2">
                                Updated: {new Date(wardWithAQI.lastUpdated).toLocaleString()}
                              </div>
                            ) : (
                              <div className="text-xs text-muted-foreground mt-2">
                                Estimated from pollution score
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Pollution Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Pollution Breakdown</CardTitle>
                <CardDescription>Individual scores across all pollution categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-6">
                  {pollutionData.map((item) => (
                    <div key={item.type} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <item.icon className={`h-5 w-5 ${item.color}`} />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <Badge variant={`pollution-${getStatusFromScore(item.value)}` as any}>
                          {item.value}
                        </Badge>
                      </div>
                      <Progress value={item.value} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        Status: {getStatusLabel(getStatusFromScore(item.value))}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pollution Sources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Key Pollution Sources
                </CardTitle>
                <CardDescription>Major contributors to pollution in this ward</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {wardWithAQI.sources.map((source) => (
                    <Badge key={source} variant="outline" className="py-2 px-4">
                      {source}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Education Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Understanding Your Ward's Pollution
                </CardTitle>
                <CardDescription>Educational context for pollution levels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {educationContent.map((item, index) => (
                  <div key={index} className="border-l-4 border-l-primary pl-4">
                    <h4 className="font-semibold mb-2">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.content}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Action Items */}
            <Card variant="civic">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-accent" />
                  Ward-Specific Actions You Can Take
                </CardTitle>
                <CardDescription>Practical steps to reduce pollution in {wardWithAQI.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {actionItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                      <div className="flex-1">
                        <span>{item.action}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {item.impact} Impact
                        </Badge>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button variant="civic">
                    Download Action Guide
                  </Button>
                  <Button variant="civic-outline">
                    Join Ward Community
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="civic" className="w-full justify-start gap-2">
                  <Users className="h-4 w-4" />
                  Join as Volunteer
                </Button>
                <Button variant="civic-outline" className="w-full justify-start gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Report Pollution
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Share Ward Data
                </Button>
              </CardContent>
            </Card>

            {/* Nearby Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Ward Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <div className="font-medium">Ward Councillor Office</div>
                  <div className="text-muted-foreground">Mon-Sat, 10AM-5PM</div>
                </div>
                <div>
                  <div className="font-medium">Nearest MCD Office</div>
                  <div className="text-muted-foreground">1.2 km away</div>
                </div>
                <div>
                  <div className="font-medium">Pollution Helpline</div>
                  <div className="text-muted-foreground">1800-XXX-XXXX</div>
                </div>
              </CardContent>
            </Card>

            {/* Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Zone Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  How does Ward {wardWithAQI.id} compare to other wards in {wardWithAQI.zone}?
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Zone Average</span>
                    <span className="font-medium">62</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>This Ward</span>
                    <span className="font-medium">{wardWithAQI.pollutionScore}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>City Average</span>
                    <span className="font-medium">58</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WardProfile;
