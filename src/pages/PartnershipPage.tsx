import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Briefcase, Zap, ArrowRight, MessageSquare, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const PartnershipPage = () => {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleContact = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        const companyName = formData.get("companyName");

        // Simulate processing
        setTimeout(() => {
            setIsSubmitting(false);
            toast({
                title: "Consultation Scheduled!",
                description: `Thank you, ${companyName}. Our partnership cell has received your request and will contact you within 48 hours for a consultation.`,
            });
            e.currentTarget.reset();
        }, 2000);
    };

    return (
        <Layout>
            <div className="container py-12 md:py-20">
                <div className="max-w-4xl mx-auto space-y-12">
                    <div className="text-center space-y-4">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-info/10 mb-2">
                            <Shield className="h-8 w-8 text-info" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-heading font-bold">Partner with Municipality</h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Corporate Social Responsibility (CSR) and public-private partnerships for a cleaner, greener Delhi.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 items-start">
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold">Partnership Models</h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-background border rounded-xl hover:border-info transition-colors">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Briefcase className="h-5 w-5 text-info" />
                                        <h4 className="font-semibold">CSR Ward Adoption</h4>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Adopt a ward and fund its environmental transformation over a 2-year period.</p>
                                </div>
                                <div className="p-4 bg-background border rounded-xl hover:border-info transition-colors">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Zap className="h-5 w-5 text-info" />
                                        <h4 className="font-semibold">Technology Innovation</h4>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Collaborate on smart waste management and IoT-based pollution monitoring.</p>
                                </div>
                            </div>
                        </div>

                        <Card className="bg-info/5 border-info/20 p-6">
                            <form onSubmit={handleContact} className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <MessageSquare className="h-6 w-6 text-info" />
                                    <h3 className="text-xl font-bold">Schedule a Consultation</h3>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Discuss how your organization can contribute to Delhi's sustainable future through a formal partnership with the Municipal Corporation.
                                </p>

                                <div className="space-y-2">
                                    <Label htmlFor="company-name">Company/Organization Name</Label>
                                    <Input id="company-name" name="companyName" placeholder="Acme Corp" required />
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="contact-person">Contact Person</Label>
                                        <Input id="contact-person" name="contactPerson" placeholder="Jane Smith" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="business-email">Business Email</Label>
                                        <Input id="business-email" name="email" type="email" placeholder="jane@acme.com" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="message">Message/Inquiry</Label>
                                    <Textarea id="message" name="message" placeholder="How can we help you together?" className="min-h-[100px]" required />
                                </div>

                                <Button type="submit" variant="hero" className="w-full bg-info hover:bg-info/90" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Requesting...
                                        </>
                                    ) : "Contact Partnership Cell"}
                                </Button>
                            </form>
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

export default PartnershipPage;
