import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PollutionScore, TrendIndicator } from "@/components/PollutionScore";
import { getWardById, getStatusFromScore } from "@/data/wards";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePollutionData } from "@/hooks/usePollutionData";
import {
  User,
  MapPin,
  Target,
  TreeDeciduous,
  Trash2,
  Droplets,
  BookOpen,
  Play,
  CheckCircle,
  Plus,
  Award,
  Calendar,
  TrendingUp,
  Gauge,
  RefreshCw,
  LogOut,
  Settings,
  ArrowRightLeft,
  Zap,
  CheckSquare,
  Trophy,
  Brain,
  MessageSquare,
  Car,
  AlertTriangle,
  Info
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { WardSelector } from "@/components/WardSelector";
import { TrafficIndicator } from "@/components/TrafficIndicator";

interface UserData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  age: number | null;
  sex: 'male' | 'female' | 'other' | null;
  gender: string | null;
  ward_number: number;
  role: 'citizen' | 'admin';
  score: number;
  created_at: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  points: number;
}

interface UserTask {
  id: string;
  user_id: string;
  task_id: string;
  status: 'pending' | 'submitted' | 'verified' | 'rejected';
  image_url: string | null;
  points_rewarded: number;
  submission_text: string | null;
  tasks: Task;
}

const getIconForCategory = (category: string | null) => {
  switch (category) {
    case 'waste': return Trash2;
    case 'tree': return TreeDeciduous;
    case 'water': return Droplets;
    case 'awareness': return BookOpen;
    case 'air': return Wind;
    default: return Target;
  }
};

const educationalVideos = [
  { id: "1", title: "How to Reduce Air Pollution in Your Ward", duration: "8:45", thumbnail: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400&q=80" },
  { id: "2", title: "Water Conservation Tips for Delhi Homes", duration: "6:30", thumbnail: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&q=80" },
  { id: "3", title: "Proper Waste Segregation Guide", duration: "5:15", thumbnail: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&q=80" },
  { id: "4", title: "Noise Pollution: What Can You Do?", duration: "7:20", thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80" },
];

const STATIC_TASKS: Task[] = [
  { id: "sapling-001", title: "Plant a Sapling", description: "Plant a tree or shrub in your locality", category: "tree", points: 50 },
  { id: "waste-001", title: "Waste Segregation", description: "Properly segregate waste for 7 days", category: "waste", points: 30 },
  { id: "carpool-001", title: "Carpool to Work", description: "Reduce air pollution by carpooling", category: "air", points: 20 },
  { id: "burning-001", title: "Report Burning", description: "Report illegal open burning", category: "air", points: 40 },
  { id: "cleanup-001", title: "Clean-up Drive", description: "Participate in a local clean-up event", category: "waste", points: 60 },
  { id: "custom-goal", title: "Custom Goal...", description: "Propose your own environmental action for review", category: "awareness", points: 0 },
];

const getAQICategory = (aqi: number) => {
  if (aqi <= 50) return { label: 'Good', color: 'text-success', bg: 'bg-success/10' };
  if (aqi <= 100) return { label: 'Moderate', color: 'text-info', bg: 'bg-info/10' };
  if (aqi <= 150) return { label: 'Unhealthy for Sensitive', color: 'text-warning', bg: 'bg-warning/10' };
  if (aqi <= 200) return { label: 'Unhealthy', color: 'text-destructive', bg: 'bg-destructive/10' };
  if (aqi <= 300) return { label: 'Very Unhealthy', color: 'text-destructive', bg: 'bg-destructive/20' };
  return { label: 'Hazardous', color: 'text-destructive', bg: 'bg-destructive/30' };
};

import { Wind, Loader2, Camera, Upload } from "lucide-react";

const CitizenDashboard = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userTasks, setUserTasks] = useState<UserTask[]>([]);
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [leaderboard, setLeaderboard] = useState<{ name: string; score: number; isMe?: boolean }[]>([]);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { wards, isLoading: pollutionLoading, refetch, isUsingRealData } = usePollutionData();

  const [isChangeWardOpen, setIsChangeWardOpen] = useState(false);
  const [newWardNumber, setNewWardNumber] = useState("");
  const [updatingWard, setUpdatingWard] = useState(false);

  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [submittingGoal, setSubmittingGoal] = useState(false);

  const [isSubmitActionOpen, setIsSubmitActionOpen] = useState(false);
  const [activeUserTaskId, setActiveUserTaskId] = useState<string | null>(null);
  const [submissionImage, setSubmissionImage] = useState<File | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);
  const [customGoalTitle, setCustomGoalTitle] = useState("");

  // Feature states
  const [comparisonWardId, setComparisonWardId] = useState<number | null>(null);

  const [weeklyActions, setWeeklyActions] = useState([
    { id: 1, title: "Use public transport once", completed: false, participants: 850 },
    { id: 2, title: "Avoid vehicle idling", completed: false, participants: 1240 },
    { id: 3, title: "Practice waste segregation", completed: false, participants: 2100 },
  ]);

  const [quizStarted, setQuizStarted] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Derived variables
  const baseWard = userData ? getWardById(userData.ward_number) : null;
  const wardWithAQI = userData ? wards.find(w => w.id === userData.ward_number) || baseWard : null;
  const ward = wardWithAQI || baseWard;

  const comparisonWard = comparisonWardId ? wards.find(w => w.id === comparisonWardId) || getWardById(comparisonWardId) : null;

  // Calculate dynamic rank
  const sortedWardsByScore = [...wards].sort((a, b) => b.pollutionScore - a.pollutionScore);
  const wardRank = ward ? sortedWardsByScore.findIndex(w => w.id === ward.id) + 1 : 0;
  const totalWards = wards.length;
  const rankPercentile = totalWards > 0 ? Math.max(1, Math.round((wardRank / totalWards) * 100)) : 0;

  const quizQuestions = [
    {
      question: `What is the primary source of pollution in ${ward?.name || 'this ward'}?`,
      options: ward?.sources || ["Vehicles", "Industry", "Waste Burning", "Construction"],
      answer: 0
    },
    {
      question: "Which of these is most effective in reducing local air pollution?",
      options: ["Planting trees", "Using public transport", "Proper waste disposal", "All of the above"],
      answer: 3
    },
    {
      question: "What does AQI stand for?",
      options: ["Air Quality Index", "Atmospheric Quota Indicator", "Air Quantity Increment", "Aero Quality Item"],
      answer: 0
    }
  ];

  const handleUpdateWard = async () => {
    if (!userData) return;

    const wardNum = parseInt(newWardNumber);
    if (isNaN(wardNum) || wardNum < 1 || wardNum > 250) {
      toast({
        title: "Invalid Ward Number",
        description: "Please enter a valid ward number between 1 and 250",
        variant: "destructive",
      });
      return;
    }

    setUpdatingWard(true);
    try {
      const { error } = await (supabase
        .from("users") as any)
        .update({ ward_number: wardNum })
        .eq("id", userData.id);

      if (error) throw error;

      setUserData({ ...userData, ward_number: wardNum });
      setIsChangeWardOpen(false);

      toast({
        title: "Ward Updated",
        description: `Your ward has been updated to Ward ${wardNum}`,
      });
    } catch (error) {
      console.error("Error updating ward:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update ward number. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingWard(false);
    }
  };

  const fetchDashboardData = async (userId: string, wardNumber?: number) => {
    try {
      console.log("Fetching dashboard data for user:", userId, "Ward:", wardNumber);
      // 1. Fetch user tasks (joined with tasks)
      const { data: utasks, error: utasksError } = await (supabase
        .from("user_tasks") as any)
        .select(`
          *,
          tasks (*)
        `)
        .eq("user_id", userId);

      if (utasksError) {
        console.error("Error fetching user tasks:", utasksError);
        throw utasksError;
      }
      console.log("User tasks fetched:", utasks?.length);
      setUserTasks(utasks as any);

      const pickedTaskIds = (utasks as any[])?.map(ut => ut.task_id) || [];

      // Using static tasks combined with any custom ones in the DB
      const availableStatic = STATIC_TASKS.filter(st => !pickedTaskIds.includes(st.id));
      setAvailableTasks(availableStatic);

      // 3. Fetch leaderboard (Filtered by Ward and Role)
      let query = (supabase.from("users") as any).select("first_name, last_name, score, id");

      if (wardNumber) {
        query = query.eq("ward_number", wardNumber);
      }

      const { data: topUsers, error: lError } = await query
        .eq("role", "citizen")
        .order("score", { ascending: false })
        .limit(10);

      if (lError) {
        console.error("Error fetching leaderboard:", lError);
        throw lError;
      }
      setLeaderboard(topUsers.map(u => ({
        name: `${u.first_name} ${u.last_name}`,
        score: u.score || 0,
        isMe: u.id === userId
      })));

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const handleAddGoal = async () => {
    if (!userData || !selectedTaskId) return;

    // For custom goal, check if title is provided
    if (selectedTaskId === 'custom-goal' && !customGoalTitle.trim()) {
      toast({
        title: "Title Required",
        description: "Please provide a title for your custom goal.",
        variant: "destructive",
      });
      return;
    }

    setSubmittingGoal(true);
    try {
      // If it's a custom goal, we might need a placeholder task in the DB OR just handle it via user_tasks
      // For simplicity, we'll assume the 'custom-goal' ID task exists in the DB or we use a hardcoded UUID if we can't create on the fly
      // Better approach: Since seeding might fail, let's just use the selectedTaskId.

      const { error } = await (supabase
        .from("user_tasks") as any)
        .insert({
          user_id: userData.id,
          task_id: selectedTaskId,
          status: 'pending',
          submission_text: selectedTaskId === 'custom-goal' ? customGoalTitle : null
        });

      if (error) throw error;

      toast({
        title: "Goal Added",
        description: selectedTaskId === 'custom-goal' ? "Your custom goal has been proposed!" : "Focus on your new goal and mark it as done once completed!",
      });

      setIsAddGoalOpen(false);
      setSelectedTaskId(null);
      setCustomGoalTitle("");
      await fetchDashboardData(userData.id, userData.ward_number);
    } catch (error) {
      console.error("Error adding goal:", error);
      toast({
        title: "Error",
        description: "Failed to add goal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingGoal(false);
    }
  };

  const handleSubmitAction = async () => {
    if (!userData || !activeUserTaskId || !submissionImage) {
      toast({
        title: "Missing Information",
        description: "Please provide both an image and details of your work.",
        variant: "destructive",
      });
      return;
    }

    setSubmittingAction(true);
    try {
      // 1. Upload image to Supabase Storage
      const fileExt = submissionImage.name.split('.').pop();
      const fileName = `${userData.id}/${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('task-verifications')
        .upload(fileName, submissionImage);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('task-verifications')
        .getPublicUrl(fileName);

      // 2. Update user_task record
      const { error: updateError } = await (supabase
        .from("user_tasks") as any)
        .update({
          status: 'submitted',
          image_url: publicUrl,
          submission_text: submissionText,
          submitted_at: new Date().toISOString()
        })
        .eq("id", activeUserTaskId);

      if (updateError) throw updateError;

      toast({
        title: "Action Submitted",
        description: "Your work has been submitted for verification. Points will be awarded soon!",
      });

      setIsSubmitActionOpen(false);
      setActiveUserTaskId(null);
      setSubmissionImage(null);
      setSubmissionText("");
      await fetchDashboardData(userData.id, userData.ward_number);
    } catch (error) {
      console.error("Error submitting action:", error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit your work. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingAction(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          toast({
            title: "Authentication Required",
            description: "Please log in to access your dashboard",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }

        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profileError || !profile) {
          console.error("Error fetching user profile:", profileError);
          toast({
            title: "Error",
            description: "Failed to load user data",
            variant: "destructive",
          });
        } else {
          const typedProfile = profile as unknown as UserData;
          setUserData(typedProfile);
          await fetchDashboardData(session.user.id, typedProfile.ward_number);
        }
      } catch (error) {
        console.error("Error:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, toast]);

  const userName = userData ? `${userData.first_name} ${userData.last_name}` : "User";

  const impactGoals = userTasks.filter(ut => ut.status === 'pending' || ut.status === 'submitted');
  const verifiedActions = userTasks.filter(ut => ut.status === 'verified' || ut.status === 'submitted' || ut.status === 'pending');

  if (loading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-lg font-semibold mb-2">Loading your dashboard...</div>
              <div className="text-sm text-muted-foreground">Please wait</div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!userData || !ward) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-lg font-semibold mb-2">Unable to load dashboard</div>
              <div className="text-sm text-muted-foreground mb-4">Please try logging in again</div>
              <Button onClick={() => navigate("/auth")}>Go to Login</Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-6 items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold mb-2">Citizen Dashboard</h1>
            <p className="text-muted-foreground">
              Track your progress and take action for a cleaner {ward?.name || "ward"}
            </p>
          </div>
          <Dialog open={isChangeWardOpen} onOpenChange={setIsChangeWardOpen}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Card className="p-4 cursor-pointer hover:bg-accent/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">{userName}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Ward {userData?.ward_number}
                      </div>
                    </div>
                  </div>
                </Card>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  setNewWardNumber(userData?.ward_number.toString() || "");
                  setIsChangeWardOpen(true);
                }}>
                  <Settings className="mr-2 h-4 w-4" />
                  Change Ward
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  supabase.auth.signOut().then(() => navigate("/auth"));
                }} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Ward</DialogTitle>
                <DialogDescription>
                  Enter your new ward number (1-250) to update your location.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ward" className="text-right">
                    Ward
                  </Label>
                  <div className="col-span-3">
                    <WardSelector
                      value={newWardNumber ? parseInt(newWardNumber) : undefined}
                      onChange={(val) => setNewWardNumber(val.toString())}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsChangeWardOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdateWard} disabled={updatingWard}>
                  {updatingWard ? "Updating..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Ward Pollution Summary */}
            {ward && (
              <div className="space-y-4">
                <Card variant="civic">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Your Ward: {ward.name}
                    </CardTitle>
                    <div className="flex items-center justify-between">
                      <CardDescription>Current pollution status and trends</CardDescription>
                      {ward.trafficStatus && (
                        <TrafficIndicator status={ward.trafficStatus} className="scale-90 origin-right" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                      <PollutionScore score={ward.pollutionScore} size="lg" />
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Air Quality</div>
                          <div className="text-xl font-semibold">{ward.airQuality}/100</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Water Quality</div>
                          <div className="text-xl font-semibold">{ward.waterQuality}/100</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Waste Management</div>
                          <div className="text-xl font-semibold">{ward.wasteManagement}/100</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Noise Level</div>
                          <div className="text-xl font-semibold">{ward.noiseLevel}/100</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <TrendIndicator value={ward.trend7Days} label="7 days" />
                        <TrendIndicator value={ward.trend30Days} label="30 days" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Live AQI Display */}
                {wardWithAQI && wardWithAQI.aqi !== undefined && wardWithAQI.aqi !== null && (
                  <Card className="border-2 border-primary/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Gauge className="h-5 w-5 text-primary" />
                          Live Air Quality Index (AQI)
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {isUsingRealData && (
                            <Badge variant="default" className="bg-success text-success-foreground">
                              Live
                            </Badge>
                          )}
                          <Button variant="ghost" size="icon" onClick={refetch} disabled={pollutionLoading}>
                            <RefreshCw className={`h-4 w-4 ${pollutionLoading ? 'animate-spin' : ''}`} />
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
                                {wardWithAQI.lastUpdated && (
                                  <div className="text-xs text-muted-foreground mt-2">
                                    Updated: {new Date(wardWithAQI.lastUpdated).toLocaleString()}
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
            )}

            {/* Tabs for Content */}
            <Tabs defaultValue="goals" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="goals" className="gap-2">
                  <Target className="h-4 w-4" />
                  My Goals
                </TabsTrigger>
                <TabsTrigger value="videos" className="gap-2">
                  <Play className="h-4 w-4" />
                  Learn
                </TabsTrigger>
                <TabsTrigger value="actions" className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Actions
                </TabsTrigger>
              </TabsList>

              {/* Goals Tab */}
              <TabsContent value="goals" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-lg font-semibold">Your Green Goals</h3>
                  <Dialog open={isAddGoalOpen} onOpenChange={setIsAddGoalOpen}>
                    <Button variant="civic-outline" size="sm" className="gap-2" onClick={() => setIsAddGoalOpen(true)}>
                      <Plus className="h-4 w-4" />
                      Add Goal
                    </Button>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add a New Goal</DialogTitle>
                        <DialogDescription>
                          Choose a task to focus on and earn impact points.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <Select onValueChange={(val) => setSelectedTaskId(val)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a task" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTasks.length > 0 ? (
                              availableTasks.map(t => (
                                <SelectItem key={t.id} value={t.id}>
                                  {t.title} {t.points > 0 ? `(${t.points} pts)` : ""}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="none" disabled>No more tasks available</SelectItem>
                            )}
                          </SelectContent>
                        </Select>

                        {selectedTaskId === 'custom-goal' && (
                          <div className="space-y-2 mt-2">
                            <Label htmlFor="custom-title">What is your goal?</Label>
                            <Input
                              id="custom-title"
                              placeholder="e.g., Organize a solar energy workshop"
                              value={customGoalTitle}
                              onChange={(e) => setCustomGoalTitle(e.target.value)}
                            />
                          </div>
                        )}

                        {selectedTaskId && selectedTaskId !== 'custom-goal' && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {availableTasks.find(t => t.id === selectedTaskId)?.description}
                          </p>
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => {
                          setIsAddGoalOpen(false);
                          setSelectedTaskId(null);
                          setCustomGoalTitle("");
                        }}>Cancel</Button>
                        <Button onClick={handleAddGoal} disabled={!selectedTaskId || submittingGoal}>
                          {submittingGoal && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Add to My Goals
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {impactGoals.length > 0 ? (
                    impactGoals.map((ut) => {
                      const Icon = getIconForCategory(ut.tasks.category);
                      return (
                        <Card key={ut.id} className="hover:shadow-lg transition-shadow">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Icon className="h-5 w-5 text-primary" />
                                </div>
                                <CardTitle className="text-base">
                                  {ut.task_id === 'custom-goal' ? (ut.submission_text || "Custom Goal") : (ut.tasks?.title || "Goal")}
                                </CardTitle>
                              </div>
                              <Badge variant={ut.status === 'submitted' ? 'secondary' : 'outline'}>
                                {ut.status === 'submitted' ? 'Verifying' : (ut.tasks?.points ? `${ut.tasks.points} pts` : 'Score Pending')}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-3">
                              {ut.task_id === 'custom-goal' ? "A unique action proposed by you." : (ut.tasks?.description || "")}
                            </p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Status: {ut.status.charAt(0).toUpperCase() + ut.status.slice(1)}</span>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  ) : (
                    <div className="col-span-2 text-center py-12 border-2 border-dashed rounded-xl text-muted-foreground">
                      No active goals. Click "Add Goal" to get started!
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Videos Tab */}
              <TabsContent value="videos" className="space-y-4">
                <h3 className="font-heading text-lg font-semibold">Educational Videos</h3>
                <p className="text-muted-foreground">
                  Learn how to reduce pollution in your ward with these guides
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  {educationalVideos.map((video) => (
                    <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                      <div className="relative">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-foreground/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center">
                            <Play className="h-6 w-6 text-primary-foreground ml-1" />
                          </div>
                        </div>
                        <Badge className="absolute bottom-2 right-2 bg-foreground/80">
                          {video.duration}
                        </Badge>
                      </div>
                      <CardContent className="pt-4">
                        <h4 className="font-semibold group-hover:text-primary transition-colors">
                          {video.title}
                        </h4>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Actions Tab */}
              <TabsContent value="actions" className="space-y-4">
                <h3 className="font-heading text-lg font-semibold">Submit Proof of Action</h3>
                <p className="text-muted-foreground">
                  Mark your goals as completed by submitting a photo for verification.
                </p>

                <div className="space-y-3">
                  {verifiedActions.map((ut) => {
                    const isSubmitted = ut.status === 'submitted' || ut.status === 'verified';
                    return (
                      <Card key={ut.id} className={ut.status === 'verified' ? "border-success/30 bg-success/5" : ""}>
                        <CardContent className="py-4">
                          <div className="flex items-start gap-4">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${ut.status === 'verified'
                              ? "bg-success text-success-foreground"
                              : isSubmitted ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
                              }`}>
                              {ut.status === 'verified' ? (
                                <CheckCircle className="h-5 w-5" />
                              ) : isSubmitted ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : (
                                <Camera className="h-5 w-5" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{ut.tasks.title}</h4>
                              <p className="text-sm text-muted-foreground">{ut.tasks.description}</p>
                              {ut.status === 'submitted' && (
                                <p className="text-xs text-secondary italic mt-1 font-medium italic">Pending Verification...</p>
                              )}
                              {ut.status === 'verified' && (
                                <p className="text-xs text-success font-medium mt-1">Verified! {ut.points_rewarded} points earned.</p>
                              )}
                            </div>
                            {!isSubmitted && (
                              <Button
                                variant="civic"
                                size="sm"
                                onClick={() => {
                                  setActiveUserTaskId(ut.id);
                                  setIsSubmitActionOpen(true);
                                }}
                              >
                                Mark Done
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  {verifiedActions.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl text-muted-foreground">
                      Pick a goal first to start taking action!
                    </div>
                  )}
                </div>

                <Dialog open={isSubmitActionOpen} onOpenChange={setIsSubmitActionOpen}>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Verify Action</DialogTitle>
                      <DialogDescription>
                        Upload a photo of your completed work to earn points.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Proof Image</Label>
                        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => setSubmissionImage(e.target.files?.[0] || null)}
                          />
                          {submissionImage ? (
                            <div className="flex flex-col items-center">
                              <CheckCircle className="h-8 w-8 text-success mb-2" />
                              <span className="text-sm font-medium">{submissionImage.name}</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                              <span className="text-sm text-muted-foreground">Click to upload or drag & drop</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Details (Optional)</Label>
                        <Input
                          placeholder="Describe what you did..."
                          value={submissionText}
                          onChange={(e) => setSubmissionText(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsSubmitActionOpen(false)}>Cancel</Button>
                      <Button onClick={handleSubmitAction} disabled={!submissionImage || submittingAction}>
                        {submittingAction && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit for Verification
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TabsContent>
            </Tabs>

            {/* Ward Comparison Section */}
            <Card className="border-2 border-primary/10">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ArrowRightLeft className="h-5 w-5 text-primary" />
                  Compare My Ward
                </CardTitle>
                <CardDescription>Compare your ward's metrics with another ward in Delhi</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex-1 w-full">
                    <Label className="text-xs mb-1 block">My Ward</Label>
                    <div className="p-2 bg-muted rounded border text-sm font-medium">
                      {ward?.name} (Ward {userData?.ward_number})
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 w-full">
                    <Label className="text-xs mb-1 block">Compare With</Label>
                    <WardSelector
                      value={comparisonWardId || undefined}
                      onChange={(val) => setComparisonWardId(val)}
                    />
                  </div>
                </div>

                {comparisonWard && ward && (
                  <div className="grid gap-4 mt-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-3 gap-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <div>Metric</div>
                      <div className="text-center">{ward.name}</div>
                      <div className="text-center">{comparisonWard.name}</div>
                    </div>

                    {[
                      { label: 'AQI', key: 'aqi', icon: Wind, iconColor: 'text-info', higherIsBetter: false },
                      { label: 'PM2.5', key: 'pm25', icon: Info, iconColor: 'text-primary', higherIsBetter: false, defaultValue: 150 },
                      { label: 'Traffic', key: 'trafficStatus', icon: Car, iconColor: 'text-warning', higherIsBetter: false },
                      { label: 'CleanScore', key: 'pollutionScore', icon: Zap, iconColor: 'text-accent', higherIsBetter: true },
                      { label: 'Water Quality', key: 'waterQuality', icon: Droplets, iconColor: 'text-info', higherIsBetter: true },
                      { label: 'Waste Mgmt', key: 'wasteManagement', icon: Trash2, iconColor: 'text-warning', higherIsBetter: true },
                      { label: 'Noise Level', key: 'noiseLevel', icon: AlertTriangle, iconColor: 'text-destructive', higherIsBetter: false },
                    ].map((metric) => {
                      const getVal = (w: any) => {
                        if (metric.key === 'trafficStatus') {
                          const map: any = { low: 1, moderate: 2, heavy: 3 };
                          return map[w.trafficStatus] || 2;
                        }
                        return w[metric.key] || (metric.defaultValue || 0);
                      };

                      const val1 = getVal(ward);
                      const val2 = getVal(comparisonWard);
                      const isBetter1 = metric.higherIsBetter ? val1 > val2 : val1 < val2;
                      const isBetter2 = metric.higherIsBetter ? val2 > val1 : val2 < val1;
                      const Icon = metric.icon;

                      // Display values
                      const disp1 = metric.key === 'trafficStatus' ? ward.trafficStatus : val1;
                      const disp2 = metric.key === 'trafficStatus' ? comparisonWard.trafficStatus : val2;

                      return (
                        <div key={metric.key} className="grid grid-cols-3 gap-2 p-2 bg-muted/30 rounded-lg items-center text-sm border border-transparent">
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${metric.iconColor}`} />
                            <span className="text-xs font-medium">{metric.label}</span>
                          </div>
                          <div className={`text-center py-1 rounded capitalize ${isBetter1 ? 'bg-success/10 border border-success/20 font-bold text-success' : 'text-muted-foreground'}`}>
                            {disp1}
                          </div>
                          <div className={`text-center py-1 rounded capitalize ${isBetter2 ? 'bg-success/10 border border-success/20 font-bold text-success' : 'text-muted-foreground'}`}>
                            {disp2}
                          </div>
                        </div>
                      );
                    })}

                    <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg flex gap-3 items-start">
                      <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <p className="text-sm">
                        {ward.pollutionScore > comparisonWard.pollutionScore
                          ? `Good news! Your ward (${ward.name}) is ranking cleaner than ${comparisonWard.name} overall.`
                          : `Insights: ${comparisonWard.name} is performing better overall. Check their Green Actions for inspiration!`}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ward CleanScore & Rank Section */}
            <Card className="border-2 border-accent/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-accent" />
                  Ward CleanScore & Rank
                </CardTitle>
                <CardDescription>How your ward performs against others in Delhi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="p-6 bg-accent/5 rounded-2xl border border-accent/10 flex flex-col items-center justify-center text-center">
                      <div className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">CleanScore</div>
                      <div className="text-6xl font-bold text-accent">{ward?.pollutionScore}</div>
                      <div className="mt-2 text-sm text-muted-foreground font-medium">
                        {ward?.pollutionScore! > 80 ? "Excellent" : ward?.pollutionScore! > 60 ? "Good" : "Needs Action"}
                      </div>
                      <Progress value={ward?.pollutionScore} className="h-2 w-full mt-4" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted rounded-xl border">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Trophy className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground font-medium">Your Ward Rank</div>
                          <div className="text-xl font-bold">#{wardRank} of {totalWards}</div>
                        </div>
                      </div>
                      <Badge variant="success">Top {rankPercentile}%</Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-warning" />
                      Cleanest Wards Leaderboard
                    </h4>
                    <div className="space-y-2">
                      {wards.sort((a, b) => b.pollutionScore - a.pollutionScore).slice(0, 5).map((w, idx) => (
                        <div key={w.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-muted">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-muted-foreground w-4">{idx + 1}</span>
                            <span className="text-sm font-medium">{w.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] font-bold">{w.pollutionScore} pts</Badge>
                            {idx === 0 && <Zap className="h-3 w-3 text-accent fill-accent" />}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t mt-4">
                      <h4 className="font-semibold text-sm flex items-center gap-2 mb-3">
                        <TrendingUp className="h-4 w-4 text-success" />
                        Most Improved This Week
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-success/5 rounded border border-success/10 text-xs">
                          <div className="font-bold">Ward 42 (Rohini)</div>
                          <div className="text-success">+12 points</div>
                        </div>
                        <div className="p-2 bg-success/5 rounded border border-success/10 text-xs">
                          <div className="font-bold">Ward 108 (Dwarka)</div>
                          <div className="text-success">+8 points</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>



          </div>

          {/* Reorganized Sidebar */}
          <div className="space-y-6">
            {/* Achievement Card */}
            <Card variant="civic">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-accent" />
                  Your Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">{userData?.score || 0}</div>
                  <div className="text-sm text-muted-foreground">Impact Points</div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-xl font-semibold">{userTasks.filter(t => t.status === 'verified' && t.tasks.category === 'tree').length}</div>
                    <div className="text-xs text-muted-foreground">Trees Planted</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-xl font-semibold">{userTasks.filter(t => t.status === 'verified' && t.tasks.category === 'waste').length}</div>
                    <div className="text-xs text-muted-foreground">Tasks Done</div>
                  </div>
                </div>
                <div className="p-4 bg-accent/10 rounded-xl border border-accent/20 flex items-center gap-3">
                  <Award className="h-8 w-8 text-accent" />
                  <div>
                    <div className="text-xs font-bold uppercase text-accent">Current Badge</div>
                    <div className="font-bold">{(userData?.score || 0) > 200 ? 'Green Master' : (userData?.score || 0) > 50 ? 'Green Warrior' : 'Environmentalist'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-l-4 border-l-primary pl-3">
                  <div className="font-medium">Ward Clean-up Drive</div>
                  <div className="text-sm text-muted-foreground">Jan 28, 2025 • 8:00 AM</div>
                </div>
                <div className="border-l-4 border-l-secondary pl-3">
                  <div className="font-medium">Tree Plantation Event</div>
                  <div className="text-sm text-muted-foreground">Feb 5, 2025 • 9:00 AM</div>
                </div>
                <Button variant="civic-outline" className="w-full">
                  View All Events
                </Button>
              </CardContent>
            </Card>

            {/* Weekly Green Actions Section - Moved from Main Content */}
            <Card className="border-2 border-primary/20 overflow-hidden">
              <CardHeader className="bg-primary/5 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <CheckSquare className="h-4 w-4 text-primary" />
                      Weekly Green Actions
                    </CardTitle>
                    <CardDescription className="text-xs">Small habits, big impact. Complete these this week!</CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-[10px] px-2 py-0">Week 1</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {weeklyActions.map((action) => (
                    <div key={action.id} className="flex items-center justify-between p-3 rounded-lg border border-transparent hover:border-primary/10 hover:bg-muted/30 transition-all group">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setWeeklyActions(actions => actions.map(a => a.id === action.id ? { ...a, completed: !a.completed } : a));
                            if (!action.completed) {
                              toast({ title: "Action Completed!", description: "You've earned 10 impact points!" });
                            }
                          }}
                          className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors ${action.completed ? "bg-primary border-primary" : "border-muted-foreground/30 group-hover:border-primary/50"}`}
                        >
                          {action.completed && <CheckCircle className="h-3 w-3 text-white" />}
                        </button>
                        <div>
                          <div className={`text-sm font-semibold ${action.completed ? "line-through text-muted-foreground" : ""}`}>
                            {action.title}
                          </div>
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <User className="h-2 w-2" />
                            {action.participants} citizens
                          </div>
                        </div>
                      </div>
                      <Badge variant={action.completed ? "success" : "outline"} className="text-[10px] px-1.5 py-0">
                        {action.completed ? "+10" : "10"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pollution Awareness Quiz Section - Re-prioritized */}
            <Card className="border-2 border-accent/20 bg-accent/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Brain className="h-4 w-4 text-accent" />
                  Ward Quiz
                </CardTitle>
                <CardDescription className="text-xs">Test your knowledge</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                {!quizStarted && !quizCompleted ? (
                  <div className="text-center py-2">
                    <div className="h-12 w-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Brain className="h-6 w-6 text-accent" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Earn the "CleanWard Aware" badge!
                    </p>
                    <Button size="sm" onClick={() => setQuizStarted(true)} className="bg-accent hover:bg-accent/90 w-full text-xs h-8">
                      Start Quiz
                    </Button>
                  </div>
                ) : quizCompleted ? (
                  <div className="text-center py-2 animate-in zoom-in duration-300">
                    <Trophy className="h-8 w-8 text-success mx-auto mb-1" />
                    <div className="text-sm font-bold">Score: {quizScore}/3</div>
                    <div className="text-[10px] text-muted-foreground mb-2 italic">CleanWard Aware Citizen</div>
                    <Button variant="outline" size="sm" className="w-full h-7 text-[10px]" onClick={() => {
                      setQuizCompleted(false);
                      setQuizStarted(false);
                      setQuizStep(0);
                      setQuizScore(0);
                    }}>
                      Retake
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-medium">
                      <span>Q{quizStep + 1} of 3</span>
                      <span>Score: {quizScore}</span>
                    </div>
                    <Progress value={(quizStep + 1) * 33.3} className="h-1" />
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold leading-tight line-clamp-2">
                        {quizQuestions[quizStep].question}
                      </h4>
                      <div className="grid gap-1.5">
                        {quizQuestions[quizStep].options.map((option, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              if (idx === quizQuestions[quizStep].answer) {
                                setQuizScore(s => s + 1);
                                toast({ title: "Correct!", variant: "default" });
                              } else {
                                toast({ title: "Incorrect", description: `Correct: ${quizQuestions[quizStep].options[quizQuestions[quizStep].answer]}`, variant: "destructive" });
                              }

                              if (quizStep < 2) {
                                setQuizStep(s => s + 1);
                              } else {
                                setQuizCompleted(true);
                              }
                            }}
                            className="w-full text-left p-2 rounded-lg border border-muted hover:border-accent hover:bg-accent/5 transition-all text-[10px] font-medium"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Old Goals/Actions (Moved to Sidebar for less clutter) */}
            <Card className="border-dashed border-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">My Custom Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {impactGoals.length > 0 ? (
                    impactGoals.slice(0, 2).map((ut) => (
                      <div key={ut.id} className="text-xs p-2 bg-muted rounded">
                        {ut.task_id === 'custom-goal' ? (ut.submission_text || "Custom Goal") : (ut.tasks?.title || "Goal")}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No custom goals set.</p>
                  )}
                  <Button variant="ghost" size="sm" className="w-full text-xs h-7" onClick={() => setIsAddGoalOpen(true)}>
                    + Add Goal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Chatbot Access Section - Full Width */}
        <div className="mt-12 mb-8">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="h-20 w-20 rounded-3xl bg-primary flex items-center justify-center shrink-0 shadow-xl rotate-3 group-hover:rotate-0 transition-transform">
                  <MessageSquare className="h-10 w-10 text-white" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-2">Need real-time help?</h3>
                  <p className="text-muted-foreground text-base max-w-2xl">
                    Our CleanWard AI Assistant is available 24/7 to answer your questions about pollution, waste disposal, and local policies.
                    Get instant guidance tailored to {ward?.name || "your ward"}.
                  </p>
                </div>
                <Button size="lg" className="shrink-0 gap-3 px-8 h-14 text-lg shadow-lg hover:shadow-primary/20 transition-all" onClick={() => {
                  const chatbot = document.querySelector('elevenlabs-convai');
                  if (chatbot) {
                    // @ts-ignore
                    chatbot.shadowRoot.querySelector('button')?.click();
                  }
                }}>
                  Chat with CleanBot
                  <ArrowRightLeft className="h-5 w-5 rotate-90" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Spacer/Padding */}
        <div className="h-20" />
      </div>
    </Layout>
  );
};

export default CitizenDashboard;
