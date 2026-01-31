import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, FileText, CheckCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const NGOPage = () => {
    return (
        <Layout>
            <div className="container py-12 md:py-20">
                <div className="max-w-4xl mx-auto space-y-12">
                    <div className="text-center space-y-4">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-warning/10 mb-2">
                            <Building2 className="h-8 w-8 text-warning" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-heading font-bold">Register Your NGO</h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Partner with the Delhi Municipal Corporation to implement impactful environmental projects at the ward level.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <Card className="bg-muted/30">
                            <CardHeader className="text-center pb-2">
                                <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
                                <CardTitle className="text-lg">1. Apply</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-center text-muted-foreground">
                                Submit organization details, registration certificate, and focus areas.
                            </CardContent>
                        </Card>
                        <Card className="bg-muted/30">
                            <CardHeader className="text-center pb-2">
                                <ShieldCheck className="h-8 w-8 text-success mx-auto mb-2" />
                                <CardTitle className="text-lg">2. Verify</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-center text-muted-foreground">
                                Our team will review your application and previous work impact.
                            </CardContent>
                        </Card>
                        <Card className="bg-muted/30">
                            <CardHeader className="text-center pb-2">
                                <CheckCircle className="h-8 w-8 text-info mx-auto mb-2" />
                                <CardTitle className="text-lg">3. Partner</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-center text-muted-foreground">
                                Get listed as a partner and start receiving ward-level project opportunities.
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border-2">
                        <CardHeader className="text-center">
                            <CardTitle>Organization Application</CardTitle>
                            <CardDescription>Complete the partnership proposal form</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 max-w-2xl mx-auto">
                            <p className="text-center text-muted-foreground">
                                We are looking for NGOs with expertise in waste management, air quality monitoring, and community outreach.
                                Partners get access to Delhi Government support and ward-level resources.
                            </p>
                            <Button variant="civic" size="xl" className="w-full">Start Application Process</Button>
                        </CardContent>
                    </Card>

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

export default NGOPage;
