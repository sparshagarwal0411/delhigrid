import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Leaf, LogIn, UserPlus, Shield, AlertCircle, Github, 
  Circle, Square, Triangle, Hexagon, X, ChevronRight, ChevronLeft 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { WardSelector } from "@/components/WardSelector";
import { Provider } from "@supabase/supabase-js";

// --- CUSTOM ICONS ---
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<"citizen" | "admin">("citizen");
  const [showConfigWarning, setShowConfigWarning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { toast } = useToast();
  const navigate = useNavigate();

  // --- REGISTRATION STATE ---
  const [registerStep, setRegisterStep] = useState(1);
  const [regData, setRegData] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    age: "", sex: "", gender: "", wardNumber: "",
    password: "", confirmPassword: ""
  });

  const updateRegData = (field: string, value: string) => {
    setRegData(prev => ({ ...prev, [field]: value }));
  };

  // --- BACKGROUND SHAPES ---
  const shapes = useMemo(() => {
    const items = [];
    const columns = 12; const rows = 12;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        if (1 > 0) { 
          const depth = Math.random() < 0.6 ? 1 : Math.random() < 0.9 ? 2 : 3;
          const sizeBase = depth === 1 ? 8 : depth === 2 ? 15 : 25;
          const speedBase = depth === 1 ? 0.1 : depth === 2 ? 0.3 : 0.6;
          items.push({
            id: `${row}-${col}`,
            left: (col * (100 / columns)) + (Math.random() * (100 / columns)),
            top: (row * (100 / rows)) + (Math.random() * (100 / rows)),
            size: Math.random() * 5 + sizeBase,
            parallaxSpeed: speedBase + Math.random() * 0.1,
            zIndex: depth,
            rotation: Math.random() * 360,
            floatDuration: 10 + Math.random() * 10,
            floatDelay: Math.random() * 5,
            type: Math.floor(Math.random() * 5),
            floatX: (Math.random() - 0.5) * 60,
            floatY: (Math.random() - 0.5) * 60
          });
        }
      }
    }
    return items;
  }, []);

  const ShapeIcon = ({ type, className }: { type: number, className?: string }) => {
    const icons = [Circle, Square, Triangle, Hexagon, X];
    const IconComponent = icons[type];
    return <IconComponent className={className} strokeWidth={1.5} />;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX - window.innerWidth / 2) / window.innerWidth,
        y: (e.clientY - window.innerHeight / 2) / window.innerHeight
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) setShowConfigWarning(true);
  }, []);

  // --- CORE LOGIN LOGIC (Reused for Manual & Test Login) ---
  const performLogin = async (email: string, password: string, explicitUserType?: "citizen" | "admin") => {
    setIsLoading(true);
    const targetUserType = explicitUserType || userType;

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Fetch user profile to check role
        const { data: userProfile } = await supabase
          .from("users")
          .select("role")
          .eq("id", authData.user.id)
          .single();

        const profile = userProfile as { role: "citizen" | "admin" } | null;
        const userRole = profile?.role || targetUserType;

        toast({
          title: "Login Successful",
          description: `Welcome back, ${userRole === 'admin' ? 'Admin' : 'Citizen'}!`,
        });

        setShowSuccess(true);
        setTimeout(() => {
          navigate(userRole === "admin" ? "/authority" : "/citizen");
        }, 1500);
      }
    } catch (error: any) {
      let errorMessage = error.message || "Invalid email or password";
      if (error.message?.includes("Invalid login credentials")) {
        errorMessage = "Invalid credentials. Please try again.";
      }
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleManualLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    await performLogin(email, password);
  };

  const handleSocialLogin = async (provider: Provider) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
      setIsLoading(false);
    }
  };

  // --- REGISTRATION LOGIC ---
  const handleNextStep = () => {
    if (registerStep === 1) {
      if (!regData.firstName || !regData.lastName || !regData.email || !regData.phone) {
        toast({ title: "Missing Fields", description: "Please fill in all personal details.", variant: "destructive" });
        return;
      }
    } else if (registerStep === 2) {
      if (!regData.age || !regData.sex || !regData.wardNumber) {
        toast({ title: "Missing Fields", description: "Please complete the demographic section.", variant: "destructive" });
        return;
      }
    }
    setRegisterStep(prev => prev + 1);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regData.password !== regData.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({ email: regData.email, password: regData.password });
      if (error) throw error;
      
      if (data.user) {
        // Create Profile Logic
        try {
          await (supabase.rpc as any)('create_user_profile', {
            user_id: data.user.id,
            user_first_name: regData.firstName,
            user_last_name: regData.lastName,
            user_email: regData.email,
            user_ward_number: parseInt(regData.wardNumber),
            user_phone: regData.phone,
            user_age: parseInt(regData.age),
            user_sex: regData.sex,
            user_gender: regData.gender,
            user_role: userType,
          });
        } catch {
            await supabase.from("users").insert({
                id: data.user.id,
                first_name: regData.firstName,
                last_name: regData.lastName,
                email: regData.email,
                phone: regData.phone,
                age: parseInt(regData.age),
                sex: regData.sex as any,
                gender: regData.gender,
                ward_number: parseInt(regData.wardNumber),
                role: userType,
            } as any);
        }
        toast({ title: "Account Created", description: "Welcome to DelhiGrid!" });
        navigate("/citizen");
      }
    } catch (error: any) {
      toast({ title: "Registration Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // --- COMPACT INPUT HELPERS ---
  const CompactInput = ({ ...props }) => <Input {...props} className={`h-9 bg-background/50 ${props.className}`} />;
  
  const renderRegisterInputs = () => {
    switch(registerStep) {
      case 1:
        return (
          <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">First Name</Label>
                <CompactInput value={regData.firstName} onChange={(e: any) => updateRegData('firstName', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Last Name</Label>
                <CompactInput value={regData.lastName} onChange={(e: any) => updateRegData('lastName', e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Email</Label>
              <CompactInput type="email" value={regData.email} onChange={(e: any) => updateRegData('email', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Phone</Label>
              <CompactInput type="tel" value={regData.phone} onChange={(e: any) => updateRegData('phone', e.target.value)} />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-4 space-y-1">
                <Label className="text-xs">Age</Label>
                <CompactInput type="number" value={regData.age} onChange={(e: any) => updateRegData('age', e.target.value)} />
              </div>
              <div className="col-span-8 space-y-1">
                 <Label className="text-xs">Sex</Label>
                 <Select value={regData.sex} onValueChange={v => updateRegData('sex', v)}>
                    <SelectTrigger className="h-9 bg-background/50"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                 </Select>
              </div>
            </div>
            <div className="space-y-1">
                <Label className="text-xs">Gender (Optional)</Label>
                <CompactInput value={regData.gender} onChange={(e: any) => updateRegData('gender', e.target.value)} placeholder="Custom identity" />
            </div>
            <div className="space-y-1">
               <Label className="text-xs">Ward</Label>
               <div className="[&>button]:h-9 [&>button]:bg-background/50">
                   <WardSelector value={regData.wardNumber ? parseInt(regData.wardNumber) : undefined} onChange={v => updateRegData('wardNumber', v.toString())} />
               </div>
            </div>
          </div>
        );
      case 3:
        return (
           <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="space-y-1">
                <Label className="text-xs">Password</Label>
                <CompactInput type="password" value={regData.password} onChange={(e: any) => updateRegData('password', e.target.value)} />
             </div>
             <div className="space-y-1">
                <Label className="text-xs">Confirm Password</Label>
                <CompactInput type="password" value={regData.confirmPassword} onChange={(e: any) => updateRegData('confirmPassword', e.target.value)} />
             </div>
             <div className="p-2 text-[10px] text-muted-foreground bg-muted/30 rounded-lg">
                <p>By clicking Register, you agree to our Terms of Service.</p>
             </div>
           </div>
        );
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center animate-in fade-in duration-500">
        <div className="flex flex-col items-center gap-4 animate-in zoom-in-50 duration-500 delay-150">
          <div className="h-24 w-24 bg-primary rounded-full flex items-center justify-center shadow-2xl shadow-primary/20">
            <Leaf className="h-12 w-12 text-white animate-bounce" />
          </div>
          <h2 className="text-3xl font-heading font-bold mt-4">Welcome to DelhiGrid</h2>
        </div>
      </div>
    );
  }

  return (
    <Layout showFooter={false}>
      <style>{`
        @keyframes auth-shape-float {
            0% { transform: translate(0px, 0px) rotate(0deg); }
            33% { transform: translate(var(--tx), var(--ty)) rotate(10deg); }
            66% { transform: translate(calc(var(--tx) * -0.5), calc(var(--ty) * -0.5)) rotate(-5deg); }
            100% { transform: translate(0px, 0px) rotate(0deg); }
        }
      `}</style>

      {/* BACKGROUND SHAPES */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-background transition-colors duration-300">
          {shapes.map((shape) => (
              <div
                  key={shape.id}
                  className="absolute text-slate-800 dark:text-white"
                  style={{
                      top: `${shape.top}%`,
                      left: `${shape.left}%`,
                      zIndex: shape.zIndex === 1 ? 0 : shape.zIndex,
                      transform: `translate(${mousePos.x * -50 * shape.parallaxSpeed}px, ${mousePos.y * -50 * shape.parallaxSpeed}px)`,
                      transition: 'transform 0.1s ease-out',
                      // @ts-ignore
                      "--tx": `${shape.floatX}px`, 
                      "--ty": `${shape.floatY}px`
                  }}
              >
                  <div 
                      style={{ 
                          width: `${shape.size}px`, 
                          height: `${shape.size}px`,
                          opacity: shape.zIndex === 1 ? 0.3 : shape.zIndex === 2 ? 0.6 : 1,
                          animation: `auth-shape-float ${shape.floatDuration}s ease-in-out infinite`,
                          animationDelay: `${shape.floatDelay}s`
                      }}
                  >
                       <ShapeIcon type={shape.type} className="w-full h-full" />
                  </div>
              </div>
          ))}
      </div>

      {/* FIXED CONTAINER: 100dvh for fixed view */}
      <div className="fixed inset-0 w-full h-[100dvh] flex flex-col items-center justify-center p-4 z-10 overflow-hidden">
        <div className="w-full max-w-sm flex flex-col max-h-full">
          
          {/* Header */}
          <div className="text-center mb-4 shrink-0">
            <div className="inline-flex items-center gap-2 mb-1 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25 transition-transform group-hover:scale-110">
                <Leaf className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-xl font-heading font-bold tracking-tight">DelhiGrid</h1>
          </div>

          {showConfigWarning && (
            <Alert variant="destructive" className="mb-2 py-2 bg-destructive/10 border-destructive/20 shrink-0">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-xs">Config Error</AlertTitle>
              <AlertDescription className="text-xs">Missing Supabase .env</AlertDescription>
            </Alert>
          )}

          {/* MATTE CARD */}
          <Card className="border border-border/40 shadow-xl bg-white dark:bg-slate-950 ring-1 ring-black/5 shrink-0">
            <CardContent className="p-5">
              <Tabs defaultValue="login" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 bg-muted/40 h-9 p-0.5">
                  <TabsTrigger value="login" className="text-xs">Sign In</TabsTrigger>
                  <TabsTrigger value="signup" className="text-xs">Register</TabsTrigger>
                </TabsList>

                {/* --- LOGIN --- */}
                <TabsContent value="login" className="mt-0 space-y-4">
                  <form onSubmit={handleManualLogin} className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">I am a</Label>
                      <Select value={userType} onValueChange={(v: any) => setUserType(v)}>
                        <SelectTrigger className="h-9 bg-background/50"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="citizen">Citizen</SelectItem>
                          <SelectItem value="admin">Authority / Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <div className="space-y-0.5">
                        <Label className="text-xs">Email</Label>
                        <CompactInput name="email" type="email" placeholder="name@example.com" required />
                      </div>
                      <div className="space-y-0.5">
                        <Label className="text-xs">Password</Label>
                        <CompactInput name="password" type="password" placeholder="••••••••" required />
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-9 text-sm shadow-md" disabled={isLoading}>
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>

                  <div className="relative py-0">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-muted-foreground/10" /></div>
                    <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-white dark:bg-slate-950 px-2 text-muted-foreground">Or</span></div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => handleSocialLogin('google')} 
                      className="h-9 text-xs bg-background/50 border-muted-foreground/20 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 dark:hover:border-blue-800 transition-colors">
                      <GoogleIcon className="mr-2 h-3.5 w-3.5" /> Google
                    </Button>
                    <Button variant="outline" onClick={() => handleSocialLogin('github')} 
                      className="h-9 text-xs bg-background/50 border-muted-foreground/20 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 dark:hover:border-blue-800 transition-colors">
                      <Github className="mr-2 h-3.5 w-3.5" /> GitHub
                    </Button>
                  </div>
                </TabsContent>

                {/* --- REGISTER --- */}
                <TabsContent value="signup" className="mt-0">
                  <div className="mb-3 flex items-center justify-between">
                     <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Step {registerStep}/3</span>
                     <div className="flex gap-1">
                        {[1, 2, 3].map(s => (
                           <div key={s} className={`h-1 w-4 rounded-full transition-all ${s === registerStep ? 'bg-primary' : 'bg-muted'}`} />
                        ))}
                     </div>
                  </div>

                  <form className="min-h-[190px] flex flex-col justify-between" onSubmit={handleRegisterSubmit}>
                     <div className="py-1">
                      {renderRegisterInputs()}
                     </div>
                     <div className="flex gap-2 mt-4">
                        {registerStep > 1 && (
                          <Button type="button" variant="outline" size="sm" onClick={() => setRegisterStep(p => p - 1)} className="w-1/3 h-9 text-xs">
                            <ChevronLeft className="mr-1 h-3 w-3" /> Back
                          </Button>
                        )}
                        {registerStep < 3 ? (
                           <Button type="button" size="sm" onClick={handleNextStep} className="flex-1 h-9 text-xs">
                              Next <ChevronRight className="ml-1 h-3 w-3" />
                           </Button>
                        ) : (
                           <Button type="submit" size="sm" disabled={isLoading} className="flex-1 h-9 text-xs shadow-md">
                              {isLoading ? "..." : "Complete"}
                           </Button>
                        )}
                     </div>
                  </form>
                  {/* ... Social login for step 1 ... */}
                  {registerStep === 1 && (
                     <div className="mt-3 pt-3 border-t border-dashed">
                        <div className="grid grid-cols-2 gap-2">
                           <Button variant="outline" type="button" size="sm" onClick={() => handleSocialLogin('google')} className="h-8 text-[10px] border-dashed hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400">
                              <GoogleIcon className="mr-1.5 h-3 w-3" /> Google
                           </Button>
                           <Button variant="outline" type="button" size="sm" onClick={() => handleSocialLogin('github')} className="h-8 text-[10px] border-dashed hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400">
                              <Github className="mr-1.5 h-3 w-3" /> GitHub
                           </Button>
                        </div>
                     </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Test Credentials - FIXED: Direct Login Action */}
          <div className="mt-3 text-center shrink-0">
            <p className="text-[10px] text-muted-foreground/70">
               <Shield className="inline h-2.5 w-2.5 mr-1 align-middle" />
               Test: 
               <span 
                 className="font-mono text-primary font-medium cursor-pointer hover:underline mx-1" 
                 onClick={() => performLogin("sparshsparshaga@gmail.com", "Citizen@123", "citizen")}
               >
                  Citizen
               </span> 
               / 
               <span 
                 className="font-mono text-primary font-medium cursor-pointer hover:underline mx-1" 
                 onClick={() => performLogin("agarwalsparsh9898@gmail.com", "Admin@123", "admin")}
               >
                  Admin
               </span>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AuthPage;