import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Leaf,
  Menu,
  X,
  MapPin,
  LayoutDashboard,
  Users,
  LogIn,
  LogOut,
  IndianRupee,
  ShoppingBag
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<"citizen" | "admin" | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          setIsAuthenticated(true);
          // Fetch user role
          const { data: profile, error: profileError } = await supabase
            .from("users")
            .select("role")
            .eq("id", session.user.id)
            .single();

          if (profile && !profileError) {
            setUserRole((profile as { role: "citizen" | "admin" }).role);
          }
        } else {
          setIsAuthenticated(false);
          setUserRole(null);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        setIsAuthenticated(false);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Handle sign out events explicitly
      if (event === 'SIGNED_OUT' || !session) {
        setIsAuthenticated(false);
        setUserRole(null);
        return;
      }

      // Only set authenticated if we have a valid session
      if (session && session.user) {
        setIsAuthenticated(true);
        // Fetch user role on auth change
        supabase
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .single()
          .then(({ data: profile, error: profileError }) => {
            if (profile && !profileError) {
              setUserRole((profile as { role: "citizen" | "admin" }).role);
            } else {
              // If profile fetch fails, still clear auth state
              setIsAuthenticated(false);
              setUserRole(null);
            }
          });
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      // Clear state first to prevent UI glitches
      setIsAuthenticated(false);
      setUserRole(null);

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
      }

      // Navigate to home page
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error signing out:", error);
      // Ensure state is cleared even on error
      setIsAuthenticated(false);
      setUserRole(null);
      navigate("/", { replace: true });
    }
  };

  // Base navigation links (always visible)
  const baseNavLinks = [
    { to: "/", label: "Home", icon: Leaf },
    { to: "/map", label: "Ward Map", icon: MapPin },
  ];

  // Dashboard link based on user role
  const dashboardLink = isAuthenticated && userRole === "admin"
    ? { to: "/authority", label: "Authority Portal", icon: LayoutDashboard }
    : isAuthenticated && userRole === "citizen"
      ? { to: "/citizen", label: "Citizen Dashboard", icon: Users }
      : null;

  const marketplaceLink = isAuthenticated && userRole === "citizen"
    ? { to: "/marketplace", label: "Marketplace", icon: ShoppingBag }
    : null;

  const navLinks = [
    ...baseNavLinks,
    ...(dashboardLink ? [dashboardLink] : []),
    ...(marketplaceLink ? [marketplaceLink] : []),
  ];

  return (
    // UPDATED: Used 'fixed top-0' to keep it locked to the top of the viewport
    <nav className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-heading text-xl font-bold">CleanWard</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to}>
              <Button
                variant={isActive(link.to) ? "secondary" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Button>
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => {
              const element = document.getElementById('pricing');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              } else {
                navigate('/');
                setTimeout(() => {
                  const el = document.getElementById('pricing');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }
            }}
          >
            <IndianRupee className="h-4 w-4" />
            Pricing
          </Button>
          {isAuthenticated ? (
            <Button
              variant="civic-outline"
              size="sm"
              className="gap-2"
              onClick={(e) => handleSignOut(e)}
              type="button"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          ) : (
            <Link to="/auth">
              <Button variant="civic" size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t bg-background animate-slide-down">
          <div className="container py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
              >
                <Button
                  variant={isActive(link.to) ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            ))}
            {isAuthenticated ? (
              <Button
                variant="civic-outline"
                className="w-full gap-2 mt-2"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsOpen(false);
                  handleSignOut(e);
                }}
                type="button"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            ) : (
              <Link to="/auth" onClick={() => setIsOpen(false)}>
                <Button variant="civic" className="w-full gap-2 mt-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}