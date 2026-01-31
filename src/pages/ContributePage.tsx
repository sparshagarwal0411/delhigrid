import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HeartHandshake, IndianRupee, ArrowRight, ShieldCheck, Target, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const ContributePage = () => {
    const { toast } = useToast();
    const [amount, setAmount] = useState("");
    const [ward, setWard] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleDonate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount) {
            toast({
                title: "Error",
                description: "Please enter or select a donation amount.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        // Simulate processing
        setTimeout(() => {
            setIsSubmitting(false);
            toast({
                title: "Contribution Successful!",
                description: `Thank you for your contribution of ₹${amount}${ward ? ` for Ward ${ward}` : ""}. Together, we can make Delhi cleaner!`,
            });
            setAmount("");
            setWard("");
        }, 2000);
    };

    return (
        <Layout>
            <div className="container py-12 md:py-20">
                <div className="max-w-4xl mx-auto space-y-12">
                    <div className="text-center space-y-4">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-2">
                            <HeartHandshake className="h-8 w-8 text-primary" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-heading font-bold">Contribute to the Cause</h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Your financial support directly funds ward-level pollution reduction initiatives and environmental improvements in Delhi.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <Card className="border-2 border-primary/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5 text-primary" />
                                    Where your money goes
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <ShieldCheck className="h-5 w-5 text-success shrink-0 mt-0.5" />
                                        <span>Deployment of local IoT air quality sensors</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <ShieldCheck className="h-5 w-5 text-success shrink-0 mt-0.5" />
                                        <span>Ward-level tree plantation and greening drives</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <ShieldCheck className="h-5 w-5 text-success shrink-0 mt-0.5" />
                                        <span>Educational workshops for school children</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <ShieldCheck className="h-5 w-5 text-success shrink-0 mt-0.5" />
                                        <span>Purchase of waste segregation equipment</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="p-6 bg-muted/30">
                            <form onSubmit={handleDonate} className="space-y-6">
                                <div className="text-center mb-4">
                                    <IndianRupee className="h-10 w-10 text-primary mx-auto mb-2" />
                                    <h3 className="text-2xl font-bold">Make a Contribution</h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Select Amount</Label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {["500", "1000", "2000"].map((val) => (
                                                <Button
                                                    key={val}
                                                    type="button"
                                                    variant={amount === val ? "civic" : "outline"}
                                                    onClick={() => setAmount(val)}
                                                >
                                                    ₹{val}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="custom-amount">Custom Amount (₹)</Label>
                                        <Input
                                            id="custom-amount"
                                            type="number"
                                            placeholder="Enter amount"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="ward">Target Ward (Optional)</Label>
                                        <Select value={ward} onValueChange={setWard}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Ward" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">General Delhi Fund</SelectItem>
                                                {[...Array(10)].map((_, i) => (
                                                    <SelectItem key={i + 1} value={(i + 1).toString()}>Ward {i + 1}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Button type="submit" variant="civic" size="lg" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : "Contribute Now"}
                                </Button>
                                <p className="text-center text-xs text-muted-foreground mt-2">
                                    Your donation is secure and encrypted.
                                </p>
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

export default ContributePage;
