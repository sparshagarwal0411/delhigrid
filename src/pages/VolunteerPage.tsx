import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Calendar, MapPin, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const VolunteerPage = () => {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSignup = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name");

        // Simulate processing
        setTimeout(() => {
            setIsSubmitting(false);
            toast({
                title: "Registration Successful!",
                description: `Welcome aboard, ${name}! We've added you to our volunteer community. You'll receive updates on upcoming drives soon.`,
            });
            e.currentTarget.reset();
        }, 2000);
    };

    return (
        <Layout>
            <div className="container py-12 md:py-20">
                <div className="max-w-4xl mx-auto space-y-12">
                    <div className="text-center space-y-4">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-success/10 mb-2">
                            <Users className="h-8 w-8 text-success" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-heading font-bold">Join as Volunteer</h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Be the change on the ground. Participate in clean-up drives, awareness campaigns, and community workshops.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold">Why Volunteer?</h3>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="h-5 w-5 text-success" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg">Direct Impact</h4>
                                        <p className="text-muted-foreground text-sm">See the immediate results of your efforts in your own neighborhood.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="h-5 w-5 text-success" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg">Community Building</h4>
                                        <p className="text-muted-foreground text-sm">Meet like-minded citizens committed to a cleaner Delhi.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="h-5 w-5 text-success" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg">Skill Development</h4>
                                        <p className="text-muted-foreground text-sm">Learn about waste management, pollution monitoring, and social advocacy.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-4 pt-4">
                                <div className="p-4 border rounded-lg bg-muted/50 flex items-center gap-4">
                                    <Calendar className="h-6 w-6 text-primary" />
                                    <div>
                                        <p className="font-medium text-sm">Next Clean-up Drive</p>
                                        <p className="text-xs text-muted-foreground">Jan 12, 2026 • 8:00 AM</p>
                                    </div>
                                </div>
                                <div className="p-4 border rounded-lg bg-muted/50 flex items-center gap-4">
                                    <MapPin className="h-6 w-6 text-primary" />
                                    <div>
                                        <p className="font-medium text-sm">Rohini Sector 7</p>
                                        <p className="text-xs text-muted-foreground">Meeting Point: City Park Main Gate</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Volunteer Registration</CardTitle>
                                <CardDescription>Register yourself to get updates on upcoming drives</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSignup} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input id="name" name="name" placeholder="John Doe" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input id="email" name="email" type="email" placeholder="john@example.com" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ward-select">Preferred Ward</Label>
                                        <Select name="ward">
                                            <SelectTrigger id="ward-select">
                                                <SelectValue placeholder="Select a ward" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[...Array(10)].map((_, i) => (
                                                    <SelectItem key={i + 1} value={(i + 1).toString()}>Ward {i + 1}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="interests">Interests</Label>
                                        <Select name="interest">
                                            <SelectTrigger id="interests">
                                                <SelectValue placeholder="What interests you?" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cleanup">Clean-up Drives</SelectItem>
                                                <SelectItem value="awareness">Awareness Campaigns</SelectItem>
                                                <SelectItem value="tree">Tree Plantation</SelectItem>
                                                <SelectItem value="monitoring">Pollution Monitoring</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button type="submit" variant="civic" className="w-full" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Registering...
                                            </>
                                        ) : "Sign Up to Volunteer"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="text-center">
                        <Link to="/">
                            <Button variant="ghost" className="gap-2">
                                <ArrowRight className="h-4 w-4 rotate-180" />
                                Back to Home
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default VolunteerPage;
