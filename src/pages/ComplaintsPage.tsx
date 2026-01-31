import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
} from "lucide-react";
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
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [analysis, setAnalysis] = useState<GeminiAnalysis | null>(null);
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
    setAnalysis(null);
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
        imageMimeType
      );
      setAnalysis(result);
      toast({ title: "Analysis complete", description: "Review the suggestion below." });
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

      const { error } = await supabase.from("complaints").insert({
        user_id: userData.id,
        ward_number: userData.ward_number,
        description: trimmed,
        photo_url: photoUrl,
        category: analysis.category,
        ai_suggestion: analysis.suggestion,
        status: "pending",
      });

      if (error) throw error;

      toast({ title: "Complaint reported", description: "Authorities will review it shortly." });
      setDescription("");
      removePhoto();
      setAnalysis(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to report";
      toast({ title: "Report failed", description: msg, variant: "destructive" });
    } finally {
      setReporting(false);
    }
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
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2">File a Complaint</h1>
          <p className="text-muted-foreground">
            Describe the problem, add a photo if you have one. AI will categorize and suggest next steps. If the suggestion doesn&apos;t help, report it to authorities.
          </p>
        </div>

        {!geminiOk && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Add <code className="text-xs bg-destructive/20 px-1 rounded">VITE_GEMINI_API_KEY</code> to your <code className="text-xs bg-destructive/20 px-1 rounded">.env</code> for AI analysis.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Describe the problem</CardTitle>
            <CardDescription>
              Be specific. Include location if possible.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="complaint-desc">Problem description</Label>
              <Textarea
                id="complaint-desc"
                placeholder="e.g. Garbage is being dumped on the street near Block A. Strong smell and flies..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label>Photo (optional)</Label>
              <div className="flex items-center gap-3">
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  {photoPreview ? (
                    <div className="relative w-full h-full rounded-lg overflow-hidden">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7"
                        onClick={(e) => { e.preventDefault(); removePhoto(); }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 py-4">
                      <ImagePlus className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Click to upload</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <Button
              className="w-full gap-2"
              onClick={handleAnalyze}
              disabled={analyzing || (!description.trim() && !photo) || !geminiOk}
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Bot className="h-4 w-4" />
                  Get AI suggestion
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {analysis && (
          <Card className="mt-6 border-primary/30 bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Suggestion by AI</CardTitle>
                <Badge className={catConfig?.color}>
                  <CatIcon className="h-3 w-3 mr-1" />
                  {catConfig?.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {analysis.suggestion}
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAnalysis(null);
                    setDescription("");
                    removePhoto();
                  }}
                >
                  Start over
                </Button>
                <Button
                  className="gap-2"
                  onClick={handleReportComplaint}
                  disabled={reporting || !description.trim()}
                >
                  {reporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Report complaint
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Use &quot;Report complaint&quot; when the AI suggestion doesn&apos;t help — your complaint will be sent to authorities.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default ComplaintsPage;
