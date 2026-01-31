import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { WardSearch } from "@/components/WardSearch";
import { StatCard } from "@/components/StatCard";
import { Layout } from "@/components/Layout";
import Snowfall from "react-snowfall";
import {
  MapPin,
  Users,
  Building2,
  HeartHandshake,
  Leaf,
  Wind,
  Droplets,
  Trash2,
  Volume2,
  ArrowRight,
  CheckCircle,
  TrendingDown,
  Shield,
  BarChart3,
  Info,
  HelpCircle,
  IndianRupee,
  Sparkles,
  Award,
  Zap,
  Target
} from "lucide-react";

// --- REVAMPED CLEAN LEAF ANIMATION ---
const AnimatedTitle = () => {
  const text = "Delhi Grid";
  const letters = text.split("");
  
  // 50 Leaves for the "Flurry"
  const leaves = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    // Staggered delays: 0s to 1.5s
    delay: Math.random() * 1.5,
    // Random "spread" from the center line of the swarm
    ySpread: Math.random() * 60 - 30, 
    xSpread: Math.random() * 40 - 20,
    // Random sizes
    scale: 0.5 + Math.random() * 0.5,
    // Random rotation speed
    spinDuration: 1 + Math.random() * 2,
    // Color Palette
    color: [
      "text-green-400", "text-green-500", "text-emerald-400", "text-lime-500"
    ][Math.floor(Math.random() * 4)]
  }));

  return (
    <div className="relative flex items-center justify-center h-32 w-full max-w-4xl mx-auto overflow-visible perspective-1000">
      <style>{`
        /* 1. FLURRY PATH: Bottom-Left to Top-Right */
        @keyframes swarm-fly {
          0% {
            opacity: 0;
            transform: translate(-300px, 150px) scale(0.5); /* Start Bottom Left */
          }
          10% { opacity: 1; }
          80% { opacity: 1; }
          100% {
            opacity: 0;
            transform: translate(300px, -150px) scale(0); /* End Top Right */
          }
        }

        /* 2. SPIRAL EFFECT: Makes leaves go round */
        @keyframes leaf-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* 3. TEXT REVEAL: Strictly invisible at start */
        @keyframes text-uncover {
          0% { opacity: 0; filter: blur(8px); transform: translateY(10px); }
          100% { opacity: 1; filter: blur(0); transform: translateY(0); }
        }
      `}</style>

      {/* TEXT CONTAINER */}
      <h1 className="relative z-10 text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-primary-foreground leading-tight drop-shadow-2xl flex gap-1 md:gap-2">
        {letters.map((char, i) => (
          <span 
            key={i} 
            className="opacity-0" // Hardcoded invisible start
            style={{ 
              animation: 'text-uncover 0.8s ease-out forwards',
              // Timing: Wait for the swarm to reach this letter position
              // 0.2s initial buffer + index * speed
              animationDelay: `${0.2 + (i * 0.15)}s` 
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </h1>

      {/* LEAF SWARM CONTAINER (Absolute Overlay) */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
        {leaves.map((leaf) => (
          <div
            key={leaf.id}
            className={`absolute ${leaf.color}`}
            style={{
              // Apply the diagonal flight path
              animation: `swarm-fly 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
              animationDelay: `${leaf.delay}s`,
              // Apply random offset so they aren't in a straight line
              marginLeft: `${leaf.xSpread}px`,
              marginTop: `${leaf.ySpread}px`,
            }}
          >
            {/* Inner rotation for the leaf itself */}
            <Leaf 
              className="w-5 h-5 md:w-8 md:h-8 drop-shadow-md" 
              fill="currentColor"
              style={{
                animation: `leaf-spin ${leaf.spinDuration}s linear infinite`
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero py-20 md:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

        {/* Snowfall Effect */}
        <div className="absolute inset-0 z-0">
          <Snowfall
            color="rgba(255, 255, 255, 0.8)"
            snowflakeCount={100}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
            }}
            speed={[0.5, 2]}
            wind={[-0.5, 0.5]}
            radius={[0.5, 3]}
          />
        </div>

        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="secondary" className="text-sm px-4 py-1.5 backdrop-blur-sm bg-white/10 text-white border-white/20">
              Government of NCT of Delhi Initiative
            </Badge>

            {/* NEW ANIMATED COMPONENT */}
            <AnimatedTitle />

            <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto font-body font-medium drop-shadow-sm">
              Empowering Delhi's 250 wards with real-time pollution data, education, and actionable steps for cleaner communities.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <WardSearch placeholder="Search your ward by name or number..." />
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-4">
              <Link to="/map">
                <Button variant="hero" size="xl" className="gap-2 shadow-xl shadow-green-900/20 hover:scale-105 transition-transform">
                  <MapPin className="h-5 w-5" />
                  Explore Ward Map
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="hero-outline" size="xl" className="gap-2 hover:scale-105 transition-transform">
                  Join as Citizen
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 50L60 45.7C120 41.3 240 32.7 360 32.3C480 32 600 40 720 48.3C840 56.7 960 65.3 1080 65C1200 64.7 1320 55.3 1380 50.7L1440 46V101H1380C1320 101 1200 101 1080 101C960 101 840 101 720 101C600 101 480 101 360 101C240 101 120 101 60 101H0V50Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <StatCard
              title="Total Wards"
              value="250"
              description="Across 11 zones"
              icon={MapPin}
              variant="primary"
            />
            <StatCard
              title="Citizens Engaged"
              value="50+"
              description="Active participants"
              icon={Users}
              variant="success"
            />
            <StatCard
              title="NGOs Registered"
              value="10+"
              description="Partner organizations"
              icon={Building2}
              variant="warning"
            />
            <StatCard
              title="Actions Taken"
              value="10"
              description="This month"
              icon={HeartHandshake}
              variant="primary"
            />
          </div>
        </div>
      </section>

      {/* Pollution Categories */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold mb-4">
              Comprehensive Pollution Monitoring
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Track and understand pollution across four key dimensions in your ward
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card variant="civic" className="text-center">
              <CardHeader>
                <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <Wind className="h-7 w-7 text-primary" />
                </div>
                <CardTitle>Air Quality</CardTitle>
                <CardDescription>
                  PM2.5, PM10, AQI monitoring with health advisories
                </CardDescription>
              </CardHeader>
            </Card>

            <Card variant="civic" className="text-center">
              <CardHeader>
                <div className="mx-auto h-14 w-14 rounded-full bg-info/10 flex items-center justify-center mb-2">
                  <Droplets className="h-7 w-7 text-info" />
                </div>
                <CardTitle>Water Quality</CardTitle>
                <CardDescription>
                  Groundwater, drainage, and drinking water assessment
                </CardDescription>
              </CardHeader>
            </Card>

            <Card variant="civic" className="text-center">
              <CardHeader>
                <div className="mx-auto h-14 w-14 rounded-full bg-warning/10 flex items-center justify-center mb-2">
                  <Trash2 className="h-7 w-7 text-warning" />
                </div>
                <CardTitle>Waste Management</CardTitle>
                <CardDescription>
                  Solid waste handling, segregation, and disposal rates
                </CardDescription>
              </CardHeader>
            </Card>

            <Card variant="civic" className="text-center">
              <CardHeader>
                <div className="mx-auto h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
                  <Volume2 className="h-7 w-7 text-destructive" />
                </div>
                <CardTitle>Noise Levels</CardTitle>
                <CardDescription>
                  Decibel monitoring across residential and commercial areas
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold mb-4">
              How CleanWard Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From data to action — empowering every citizen to make a difference
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                1
              </div>
              <h3 className="font-heading text-xl font-semibold">Find Your Ward</h3>
              <p className="text-muted-foreground">
                Search by ward number, name, or explore the interactive map to locate your area
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-2xl font-bold">
                2
              </div>
              <h3 className="font-heading text-xl font-semibold">Understand the Data</h3>
              <p className="text-muted-foreground">
                View pollution scores, trends, sources, and educational content specific to your ward
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-success text-success-foreground flex items-center justify-center text-2xl font-bold">
                3
              </div>
              <h3 className="font-heading text-xl font-semibold">Take Action</h3>
              <p className="text-muted-foreground">
                Follow ward-specific recommendations and track your personal contribution goals
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold mb-4">
              Get Involved
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Multiple ways to contribute to Delhi's cleaner future
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <HeartHandshake className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Contribute to the Cause</CardTitle>
                <CardDescription>
                  Support ward-level initiatives financially
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/contribute">
                  <Button variant="civic" className="w-full">Donate Now</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-success" />
                </div>
                <CardTitle className="text-lg">Join as Volunteer</CardTitle>
                <CardDescription>
                  Participate in clean-up drives and awareness campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/volunteer">
                  <Button variant="civic-outline" className="w-full">Register</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center mb-2">
                  <Building2 className="h-6 w-6 text-warning" />
                </div>
                <CardTitle className="text-lg">Register Your NGO</CardTitle>
                <CardDescription>
                  Partner with us for on-ground implementation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/ngo">
                  <Button variant="civic-outline" className="w-full">Apply</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto h-12 w-12 rounded-full bg-info/10 flex items-center justify-center mb-2">
                  <Shield className="h-6 w-6 text-info" />
                </div>
                <CardTitle className="text-lg">Partner with Municipality</CardTitle>
                <CardDescription>
                  Corporate partnerships for sustainable impact
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/partnership">
                  <Button variant="civic-outline" className="w-full">Learn More</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features for Different Users */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8">
            <Card variant="elevated" className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading text-2xl font-bold">For Citizens</h3>
                  <p className="text-muted-foreground">Your personal pollution dashboard</p>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span>View your ward's real-time pollution data</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span>Learn why pollution is high in your area</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span>Set and track personal green goals</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span>Access educational videos and guides</span>
                </li>
              </ul>
              <Link to="/citizen">
                <Button variant="civic" size="lg" className="w-full gap-2">
                  Access Citizen Dashboard
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </Card>

            <Card variant="elevated" className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-14 w-14 rounded-full bg-secondary/10 flex items-center justify-center">
                  <BarChart3 className="h-7 w-7 text-secondary" />
                </div>
                <div>
                  <h3 className="font-heading text-2xl font-bold">For Authorities</h3>
                  <p className="text-muted-foreground">Advanced analytics portal</p>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span>City-wide pollution overview and trends</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span>Ward comparison and ranking analytics</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span>Resource allocation insights</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span>Citizen engagement metrics</span>
                </li>
              </ul>
              <Link to="/authority">
                <Button variant="civic-secondary" size="lg" className="w-full gap-2">
                  Access Authority Portal
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-16 bg-muted/30 scroll-mt-16">
        <div className="container">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <Info className="h-3 w-3 mr-1" />
              About Us
            </Badge>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              About CleanWard
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A comprehensive platform connecting citizens, authorities, and organizations for cleaner Delhi
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card variant="civic" className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Leaf className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-heading font-semibold">Our Mission</h3>
              </div>
              <p className="text-muted-foreground">
                CleanWard is a government initiative by the NCT of Delhi to create a transparent,
                data-driven approach to pollution management. We empower citizens with real-time
                ward-level pollution data and actionable insights to drive community-led environmental action.
              </p>
            </Card>

            <Card variant="civic" className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-success" />
                </div>
                <h3 className="text-xl font-heading font-semibold">Our Vision</h3>
              </div>
              <p className="text-muted-foreground">
                To make Delhi one of the cleanest cities in India by fostering citizen participation,
                enabling data-driven policy decisions, and creating a collaborative ecosystem where
                every ward takes ownership of its environmental health.
              </p>
            </Card>

            <Card variant="civic" className="p-6 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-info/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-info" />
                </div>
                <h3 className="text-xl font-heading font-semibold">Who We Are</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                CleanWard is developed and maintained by the Delhi Municipal Corporation in partnership
                with the Delhi Pollution Control Committee (DPCC) and Central Pollution Control Board (CPCB).
                Our platform integrates data from multiple government sources to provide comprehensive
                pollution monitoring across all 250 wards of Delhi.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-background rounded-lg">
                  <div className="text-2xl font-bold text-primary mb-1">250</div>
                  <div className="text-sm text-muted-foreground">Wards Covered</div>
                </div>
                <div className="text-center p-4 bg-background rounded-lg">
                  <div className="text-2xl font-bold text-success mb-1">24/7</div>
                  <div className="text-sm text-muted-foreground">Data Monitoring</div>
                </div>
                <div className="text-center p-4 bg-background rounded-lg">
                  <div className="text-2xl font-bold text-info mb-1">100%</div>
                  <div className="text-sm text-muted-foreground">Transparent</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section id="faqs" className="py-16 bg-background scroll-mt-16">
        <div className="container">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <HelpCircle className="h-3 w-3 mr-1" />
              Frequently Asked Questions
            </Badge>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Common Questions
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find answers to the most common questions about CleanWard
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left font-semibold">
                  What is CleanWard and how does it work?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  CleanWard is a government platform that provides real-time pollution data for all 250 wards
                  in Delhi. Citizens can search for their ward, view pollution scores across air, water, waste,
                  and noise categories, and access educational resources and action steps to improve their ward's
                  environmental health.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left font-semibold">
                  How is the pollution data collected?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Our data comes from multiple trusted sources including the Central Pollution Control Board (CPCB),
                  Delhi Pollution Control Committee (DPCC), municipal records, and IoT sensors deployed across
                  Delhi. Data is updated in real-time and verified by government authorities.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left font-semibold">
                  Do I need to register to use CleanWard?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  No, you can browse ward data, view the map, and access public information without registration.
                  However, creating a free account gives you access to personalized dashboards, goal tracking,
                  educational videos, and the ability to track your environmental impact.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left font-semibold">
                  How can I contribute to reducing pollution in my ward?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  There are multiple ways to contribute: join volunteer clean-up drives, participate in tree
                  plantation events, follow ward-specific action recommendations, report pollution incidents,
                  and spread awareness in your community. You can also make donations to support ward-level
                  initiatives through our platform.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left font-semibold">
                  Is CleanWard free to use?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes, all basic features are completely free. Citizens can access pollution data, educational
                  content, and participate in community initiatives at no cost. We offer optional premium features
                  for advanced analytics and priority support, but the core platform remains free for all citizens.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left font-semibold">
                  How accurate is the pollution data?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Our data is sourced from government-certified monitoring stations and verified by environmental
                  authorities. We update data multiple times daily and use standardized measurement protocols
                  approved by CPCB and DPCC. However, pollution levels can vary within a ward, so data represents
                  average conditions.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left font-semibold">
                  Can NGOs or organizations partner with CleanWard?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Absolutely! We welcome partnerships with NGOs, community organizations, and corporate entities.
                  Organizations can register through our platform to participate in clean-up drives, awareness
                  campaigns, and implementation projects. Contact us through the "Register Your NGO" section for more information.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left font-semibold">
                  How do I report a pollution issue in my area?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Once you're logged into your Citizen Dashboard, you can report pollution incidents directly
                  through the platform. Reports are forwarded to the relevant municipal authorities and
                  tracked for resolution. You can also call our toll-free helpline at 1800-XXX-XXXX for urgent issues.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Pricing/Billing Section */}
      <section id="pricing" className="py-16 bg-muted/30 scroll-mt-16">
        <div className="container">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <IndianRupee className="h-3 w-3 mr-1" />
              Pricing & Support
            </Badge>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Affordable Plans for Everyone
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose a plan that fits your needs. All plans support our mission to make Delhi cleaner.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
            {/* Free Plan */}
            <Card variant="civic" className="relative">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-2xl">Citizen</CardTitle>
                  <Badge variant="secondary">Free</Badge>
                </div>
                <CardDescription>Perfect for individual citizens</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-3xl font-bold">₹0</div>
                  <div className="text-sm text-muted-foreground">Forever free</div>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Access to all ward pollution data</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Personal dashboard & goal tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Educational videos & guides</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Join volunteer programs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Report pollution incidents</span>
                  </li>
                </ul>
                <Link to="/auth">
                  <Button variant="civic" className="w-full">Get Started Free</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card variant="civic" className="relative border-2 border-primary">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
              </div>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-2xl">Premium</CardTitle>
                  <Badge variant="outline">₹99/mo</Badge>
                </div>
                <CardDescription>For engaged citizens & small groups</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-3xl font-bold">₹99</div>
                  <div className="text-sm text-muted-foreground">per month or ₹999/year</div>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Everything in Citizen plan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Advanced analytics & trends</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Priority support & response</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Early access to new features</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Detailed impact reports</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Ad-free experience</span>
                  </li>
                </ul>
                <Link to="/payment">
                  <Button variant="civic" className="w-full">Upgrade to Premium</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Organization Plan */}
            <Card variant="civic" className="relative">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-2xl">Organization</CardTitle>
                  <Badge variant="secondary">Custom</Badge>
                </div>
                <CardDescription>For NGOs & community groups</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-3xl font-bold">₹499</div>
                  <div className="text-sm text-muted-foreground">per month (starting)</div>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Everything in Premium</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Team management (up to 50 members)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Custom reporting & analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Event management tools</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Dedicated account manager</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">API access for integration</span>
                  </li>
                </ul>
                <Link to="/partnership">
                  <Button variant="civic-outline" className="w-full">Contact Sales</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Model Explanation */}
          <Card variant="civic" className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                How We Sustain CleanWard
              </CardTitle>
              <CardDescription>Transparent funding model for a government initiative</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                CleanWard is a government initiative, but we operate on a sustainable model to ensure
                long-term operation and continuous improvement:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Government Funding</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Core infrastructure and basic features are funded by the Delhi Municipal Corporation
                    under the Swachh Bharat Mission.
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-success" />
                    <h4 className="font-semibold">Premium Subscriptions</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Affordable premium plans (₹99/month) help fund advanced features, server costs,
                    and platform improvements.
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <HeartHandshake className="h-5 w-5 text-warning" />
                    <h4 className="font-semibold">Citizen Donations</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Voluntary contributions from citizens directly support ward-level clean-up initiatives
                    and awareness campaigns.
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-5 w-5 text-info" />
                    <h4 className="font-semibold">Corporate Partnerships</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    CSR partnerships with organizations help fund large-scale projects and infrastructure
                    improvements.
                  </p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-sm">
                  <strong>100% Transparency:</strong> All revenue is used exclusively for platform
                  maintenance, data collection, and community initiatives. Financial reports are
                  published quarterly on our official website.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default Index;