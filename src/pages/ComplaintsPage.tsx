import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Droplets,
  Volume2,
  Car,
  TreeDeciduous,
  MapPin,
  Wind,
  Bot,
  Send,
  ImagePlus,
  X,
  Loader2,
  AlertCircle,
  Sparkles,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { analyzeComplaint, isGeminiConfigured, type ComplaintCategory, type GeminiAnalysis } from "@/lib/gemini";

const CATEGORY_CONFIG: Record<
  ComplaintCategory,
  { label: string; icon: typeof Wind; color: string }
> = {
  air: { label: "Air", icon: Wind, color: "bg-sky-500/20 text-sky-700 dark:text-sky-300" },
  water: { label: "Water", icon: Droplets, color: "bg-blue-500/20 text-blue-700 dark:text-blue-300" },
  noise: { label: "Noise", icon: Volume2, color: "bg-amber-500/20 text-amber-700 dark:text-amber-300" },
  transport: { label: "Transport", icon: Car, color: "bg-orange-500/20 text-orange-700 dark:text-orange-300" },
  soil: { label: "Soil", icon: TreeDeciduous, color: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300" },
  land: { label: "Land", icon: MapPin, color: "bg-stone-500/20 text-stone-700 dark:text-stone-300" },
};

interface UserData {
  id: string;
  ward_number: number;
  role: "citizen" | "admin";
}

function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      if (!base64) reject(new Error("Failed to read file"));
      else resolve({ base64, mimeType: file.type || "image/jpeg" });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const ComplaintsPage = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [analysis, setAnalysis] = useState<GeminiAnalysis | null>(null);
  const [suggestionOpen, setSuggestionOpen] = useState(false);

  // Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userComplaints, setUserComplaints] = useState<any[]>([]);
  const [communityComplaints, setCommunityComplaints] = useState<any[]>([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  const geminiOk = isGeminiConfigured();

  const handlePhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image (JPG, PNG, WebP)", variant: "destructive" });
      return;
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }, [toast]);

  const removePhoto = useCallback(() => {
    setPhoto(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
  }, [photoPreview]);

  const handleAnalyze = async () => {
    // If we already have analysis, just open the popup
    if (analysis) {
      setSuggestionOpen(true);
      return;
    }
    const trimmed = description.trim();
    if (!trimmed && !photo) {
      toast({ title: "Empty complaint", description: "Describe the problem or upload a photo.", variant: "destructive" });
      return;
    }
    if (!geminiOk) {
      toast({ title: "AI not configured", description: "Add VITE_GEMINI_API_KEY to .env", variant: "destructive" });
      return;
    }

    setAnalyzing(true);
    setSuggestionOpen(false);
    try {
      let imageBase64: string | undefined;
      let imageMimeType: string | undefined;
      if (photo) {
        const { base64, mimeType } = await fileToBase64(photo);
        imageBase64 = base64;
        imageMimeType = mimeType;
      }
      const result = await analyzeComplaint(
        trimmed || "See attached image for the environmental issue.",
        imageBase64,
        imageMimeType,
        location.trim() || undefined,
        userData?.ward_number
      );
      setAnalysis(result);
      setSuggestionOpen(true);
      toast({ title: "Analysis complete", description: "Review the suggestion in the popup." });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Analysis failed";
      toast({ title: "Analysis failed", description: msg, variant: "destructive" });
      setAnalysis(null);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReportComplaint = async () => {
    if (!userData || !analysis) return;
    const trimmed = description.trim();
    if (!trimmed) {
      toast({ title: "Description required", description: "Add a short description before reporting.", variant: "destructive" });
      return;
    }

    setReporting(true);
    try {
      let photoUrl: string | null = null;
      if (photo && userData) {
        const fileExt = photo.name.split(".").pop() || "jpg";
        const fileName = `complaints/${userData.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("task-verifications")
          .upload(fileName, photo);

        if (!uploadError) {
          const { data } = supabase.storage.from("task-verifications").getPublicUrl(fileName);
          photoUrl = data.publicUrl;
        }
      }

      const { error } = await (supabase.from("complaints") as any).insert({
        user_id: userData.id,
        ward_number: analysis.wardId,
        location_text: location.trim() ? location.trim() : null,
        description: trimmed,
        photo_url: photoUrl,
        category: analysis.category,
        ai_suggestion: analysis.suggestion,
        status: "received",
      });

      if (error) throw error;

      toast({ title: "Complaint reported", description: "Authorities will review it shortly." });
      setDescription("");
      setLocation("");
      removePhoto();
      setAnalysis(null);
      setSuggestionOpen(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to report";
      toast({ title: "Report failed", description: msg, variant: "destructive" });
    } finally {
      setReporting(false);
    }
  };

  const handleCloseSuggestion = () => {
    setSuggestionOpen(false);
  };

  const handleStartOver = () => {
    setAnalysis(null);
    setDescription("");
    setLocation("");
    removePhoto();
    setSuggestionOpen(false);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        toast({ title: "Sign in required", description: "Please log in to file complaints.", variant: "destructive" });
        navigate("/auth");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("id, ward_number, role")
        .eq("id", session.user.id)
        .single();

      if (profileError || !profile) {
        toast({ title: "Profile error", description: "Could not load your profile.", variant: "destructive" });
        navigate("/auth");
        return;
      }

      const role = (profile as { role: string }).role;
      if (role !== "citizen") {
        toast({ title: "Access denied", description: "This page is for citizens only.", variant: "destructive" });
        navigate("/");
        return;
      }

      setUserData(profile as unknown as UserData);
      setLoading(false);

      // Fetch complaints
      setLoadingComplaints(true);
      const { data: complaints, error: complaintsError } = await supabase
        .from("complaints")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (complaints) {
        setUserComplaints(complaints);
      }
      setLoadingComplaints(false);

      // Fetch community complaints
      const { data: commComplaints } = await supabase
        .from("complaints")
        .select("*")
        // .eq("ward_number", profile.ward_number) // Optional: filter by ward
        .order("created_at", { ascending: false })
        .limit(50);

      if (commComplaints) {
        setCommunityComplaints(commComplaints);
      }
    };

    init();
  }, [navigate, toast]);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  if (loading) {
    return (
      <Layout>
        <div className="container py-12 flex items-center justify-center min-h-[400px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </motion.div>
        </div>
      </Layout>
    );
  }

  if (!userData) return null;

  const catConfig = analysis ? CATEGORY_CONFIG[analysis.category] : null;
  const CatIcon = catConfig?.icon ?? Wind;

  return (
    <Layout>
      <div className="container py-8 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25"
            >
              <AlertCircle className="h-6 w-6 text-primary-foreground" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-heading font-bold tracking-tight">File a Complaint</h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                AI-powered analysis • Location-based ward assignment
              </p>
            </div>
          </div>
          <p className="text-muted-foreground max-w-xl">
            Describe the problem, add a photo if you have one. AI will categorize and suggest next steps. Report to authorities when the suggestion doesn&apos;t help.
          </p>
        </motion.div>

        {!geminiOk && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Alert variant="destructive" className="mb-6 shadow-sm">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Add <code className="text-xs bg-destructive/20 px-1 rounded">VITE_GEMINI_API_KEY</code> to your <code className="text-xs bg-destructive/20 px-1 rounded">.env</code> for AI analysis.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="overflow-hidden border-2 shadow-xl shadow-black/5 dark:shadow-none">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
            <CardHeader className="relative pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="h-5 w-5 text-primary" />
                Report an issue
              </CardTitle>
              <CardDescription>
                Be specific. Include location for accurate ward assignment.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-5">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="space-y-2"
              >
                <Label htmlFor="complaint-location" className="text-sm font-medium">Location</Label>
                <Input
                  id="complaint-location"
                  placeholder="e.g. Rohini Sector 5, near Connaught Place..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-11 bg-background/60 border-2 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <Label htmlFor="complaint-desc" className="text-sm font-medium">Problem description</Label>
                <Textarea
                  id="complaint-desc"
                  placeholder="e.g. Garbage is being dumped on the street near Block A. Strong smell and flies..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="resize-none bg-background/60 border-2 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="space-y-2"
              >
                <Label className="text-sm font-medium">Photo (optional)</Label>
                <label className="flex flex-col items-center justify-center w-full min-h-[140px] border-2 border-dashed rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  {photoPreview ? (
                    <div className="relative w-full h-full min-h-[140px] rounded-xl overflow-hidden group">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                      />
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="h-9 w-9 rounded-full shadow-lg"
                          onClick={(e) => { e.preventDefault(); removePhoto(); }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground group-hover:text-foreground transition-colors">
                      <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <ImagePlus className="h-7 w-7" />
                      </div>
                      <span className="text-sm font-medium">Click to upload or drag & drop</span>
                      <span className="text-xs">JPG, PNG or WebP</span>
                    </div>
                  )}
                </label>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  size="lg"
                  className="w-full h-12 text-base font-semibold gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                  onClick={handleAnalyze}
                  disabled={analyzing || (!analysis && !description.trim() && !photo) || !geminiOk}
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Analyzing with AI...
                    </>
                  ) : analysis ? (
                    <>
                      <Bot className="h-5 w-5" />
                      View suggestion again
                    </>
                  ) : (
                    <>
                      <Bot className="h-5 w-5" />
                      Get AI suggestion
                    </>
                  )}
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Suggestion Popup Dialog */}
        <Dialog open={suggestionOpen && !!analysis} onOpenChange={(open) => !open && handleCloseSuggestion()}>
          <DialogContent className="sm:max-w-md overflow-hidden p-0 gap-0 border-2">
            <AnimatePresence>
              {analysis && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-6"
                >
                  <DialogHeader className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <DialogTitle className="text-lg">AI Suggestion</DialogTitle>
                        <DialogDescription>Review and take action</DialogDescription>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Badge className={catConfig?.color}>
                        <CatIcon className="h-3 w-3 mr-1" />
                        {catConfig?.label}
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <MapPin className="h-3 w-3" />
                        Ward {analysis.wardId}: {analysis.wardName}
                      </Badge>
                    </div>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {analysis.suggestion}
                    </p>
                  </div>
                  <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                    <Button variant="outline" className="w-full sm:w-auto" onClick={handleStartOver}>
                      Start over
                    </Button>
                    <Button
                      className="w-full sm:w-auto gap-2"
                      onClick={handleReportComplaint}
                      disabled={reporting || !description.trim()}
                    >
                      {reporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      Report complaint
                    </Button>
                  </DialogFooter>
                  <p className="text-xs text-muted-foreground mt-4 pt-2 border-t">
                    Use &quot;Report complaint&quot; when the AI suggestion doesn&apos;t help — your complaint will be sent to authorities.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </DialogContent>
        </Dialog>
      </div>

      {/* Floating Action Button for Tracker */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-6 left-6 z-50"
      >
        <Button
          onClick={() => setSidebarOpen(true)}
          size="lg"
          className="h-14 w-14 rounded-full shadow-xl shadow-primary/30 flex items-center justify-center p-0 hover:scale-105 transition-transform"
        >
          <Sparkles className="h-6 w-6" />
        </Button>
      </motion.div>

      {/* Complaints Tracker Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            />
            {/* Sidebar Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-full sm:w-[400px] bg-background border-r shadow-2xl flex flex-col"
            >
              <div className="p-4 border-b flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ClipboardList className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="font-semibold text-lg">Complaints</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col">
                <Tabs defaultValue="my" className="flex-1 flex flex-col">
                  <div className="px-4 pt-4">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="my">My Complaints</TabsTrigger>
                      <TabsTrigger value="community">Community</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="my" className="flex-1 flex flex-col m-0 overflow-hidden">
                    <Tabs defaultValue="active" className="flex-1 flex flex-col">
                      <div className="px-4 py-2 border-b">
                        <TabsList className="grid w-full grid-cols-2 h-8">
                          <TabsTrigger value="active" className="text-xs">Active Issues</TabsTrigger>
                          <TabsTrigger value="closed" className="text-xs">Past Reports</TabsTrigger>
                        </TabsList>
                      </div>

                      <TabsContent value="active" className="flex-1 overflow-y-auto p-4 space-y-4 m-0">
                        {loadingComplaints ? (
                          <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                            <p className="text-muted-foreground">Loading history...</p>
                          </div>
                        ) : userComplaints.filter(c => c.status !== 'solved').length > 0 ? (
                          userComplaints.filter(c => c.status !== 'solved').map((comp) => {
                            const stages = ['received', 'reported', 'working', 'solved'];
                            const currentIndex = stages.indexOf(comp.status);

                            return (
                              <Card key={comp.id} className="overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-all">
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between mb-3">
                                    <div>
                                      <Badge variant="outline" className="capitalize mb-1">{comp.category}</Badge>
                                      <p className="text-xs text-muted-foreground">{new Date(comp.created_at).toLocaleDateString()}</p>
                                    </div>
                                    {comp.points_rewarded > 0 && (
                                      <Badge variant="secondary" className="bg-success/10 text-success border-success/20 gap-1">
                                        <CheckCircle2 className="h-3 w-3" />
                                        +{comp.points_rewarded} Pts
                                      </Badge>
                                    )}
                                  </div>

                                  <p className="text-sm font-medium line-clamp-2 mb-4">{comp.description}</p>

                                  {/* Progress Timeline */}
                                  <div className="relative mb-4 px-2">
                                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2" />
                                    <div
                                      className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 transition-all duration-500"
                                      style={{ width: `${Math.max(0, currentIndex) / (stages.length - 1) * 100}%` }}
                                    />
                                    <div className="relative flex justify-between">
                                      {stages.map((stage, idx) => (
                                        <div key={stage} className="flex flex-col items-center group">
                                          <div className={`h-2.5 w-2.5 rounded-full border-2 z-10 transition-colors ${idx <= currentIndex ? "bg-primary border-primary" : "bg-background border-muted"
                                            }`} />
                                          <span className={`absolute -bottom-5 text-[9px] font-bold uppercase tracking-tighter transition-colors ${idx <= currentIndex ? "text-primary" : "text-muted-foreground"
                                            }`}>
                                            {stage.slice(0, 3)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {comp.admin_feedback && (
                                    <div className="mt-6 p-3 bg-muted/50 rounded-lg text-xs">
                                      <span className="font-semibold block mb-1">Feedback:</span>
                                      <span className="text-muted-foreground">{comp.admin_feedback}</span>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          })
                        ) : (
                          <div className="text-center py-12">
                            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                              <Wind className="h-8 w-8 text-muted-foreground/50" />
                            </div>
                            <p className="text-muted-foreground">No active complaints.</p>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="closed" className="flex-1 overflow-y-auto p-4 space-y-4 m-0 bg-muted/5">
                        {loadingComplaints ? (
                          <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                            <p className="text-muted-foreground">Loading history...</p>
                          </div>
                        ) : userComplaints.filter(c => c.status === 'solved').length > 0 ? (
                          userComplaints.filter(c => c.status === 'solved').map((comp) => (
                            <Card key={comp.id} className="overflow-hidden border border-success/20 shadow-sm opacity-90 hover:opacity-100 transition-all">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <Badge variant="outline" className="capitalize mb-1">{comp.category}</Badge>
                                    <p className="text-xs text-muted-foreground">{new Date(comp.created_at).toLocaleDateString()}</p>
                                  </div>
                                  <Badge className="bg-success text-success-foreground gap-1">
                                    <CheckCircle2 className="h-3 w-3" />
                                    SOLVED
                                  </Badge>
                                </div>

                                <p className="text-sm text-muted-foreground line-through decoration-muted-foreground/30 mb-4">{comp.description}</p>

                                {comp.admin_feedback && (
                                  <div className="mt-2 p-3 bg-muted/50 rounded-lg text-xs border">
                                    <span className="font-semibold block mb-1 text-primary">Resolution:</span>
                                    <span className="text-muted-foreground">{comp.admin_feedback}</span>
                                  </div>
                                )}

                                {comp.points_rewarded > 0 && (
                                  <div className="mt-2 flex items-center justify-end text-xs text-success font-medium">
                                    Earned +{comp.points_rewarded} Points
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))
                        ) : (
                          <div className="text-center py-12">
                            <CheckCircle2 className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                            <p className="text-muted-foreground">No solved complaints yet.</p>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </TabsContent>

                  <TabsContent value="community" className="flex-1 overflow-y-auto p-4 space-y-4 m-0">
                    {loadingComplaints ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">Loading community reports...</p>
                      </div>
                    ) : communityComplaints.length > 0 ? (
                      communityComplaints.map((comp) => (
                        <Card key={comp.id} className="overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-all">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <Badge variant="outline" className="capitalize">{comp.category}</Badge>
                              <Badge variant="secondary" className="gap-1">
                                <MapPin className="h-3 w-3" />
                                Ward {comp.ward_number}
                              </Badge>
                            </div>

                            <p className="text-sm font-medium line-clamp-2 mb-3">{comp.description}</p>

                            <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
                              <span className="capitalize font-semibold text-primary/80 px-2 py-0.5 bg-primary/5 rounded-full">
                                {comp.status}
                              </span>
                              <span>{new Date(comp.created_at).toLocaleDateString()}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No community complaints found.</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Layout>

  );
};

export default ComplaintsPage;
