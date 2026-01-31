import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import MapPage from "./pages/MapPage";
import WardProfile from "./pages/WardProfile";
import AuthPage from "./pages/AuthPage";
import AuthCallback from "./pages/AuthCallback";
import CitizenDashboard from "./pages/CitizenDashboard";
import AuthorityDashboard from "./pages/AuthorityDashboard";
import ContributePage from "./pages/ContributePage";
import VolunteerPage from "./pages/VolunteerPage";
import NGOPage from "./pages/NGOPage";
import PartnershipPage from "./pages/PartnershipPage";
import PaymentPage from "./pages/PaymentPage";
import Marketplace from "./pages/Marketplace";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();



const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="cleanward-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/ward/:id" element={<WardProfile />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/citizen" element={<CitizenDashboard />} />
            <Route path="/authority" element={<AuthorityDashboard />} />
            <Route path="/contribute" element={<ContributePage />} />
            <Route path="/volunteer" element={<VolunteerPage />} />
            <Route path="/ngo" element={<NGOPage />} />
            <Route path="/partnership" element={<PartnershipPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
