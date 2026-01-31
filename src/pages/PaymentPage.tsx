import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Smartphone, Building2, ShieldCheck, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const PaymentPage = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handlePayment = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        // Simulate payment gateway processing
        setTimeout(() => {
            setIsProcessing(false);
            setIsSuccess(true);
            toast({
                title: "Payment Successful!",
                description: "Welcome to CleanWard Premium! Your account has been upgraded.",
            });

            // Redirect after a short delay
            setTimeout(() => {
                navigate("/");
            }, 3000);
        }, 2500);
    };

    if (isSuccess) {
        return (
            <Layout>
                <div className="container py-20 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                    <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-12 w-12 text-success animate-in zoom-in duration-300" />
                    </div>
                    <h1 className="text-4xl font-heading font-bold">Payment Confirmed!</h1>
                    <p className="text-xl text-muted-foreground max-w-md">
                        Your transaction of ₹99 was successful. You now have full access to all Premium features.
                    </p>
                    <p className="text-sm text-muted-foreground">Redirecting you to the home page...</p>
                    <Link to="/">
                        <Button variant="civic">Go to Home Now</Button>
                    </Link>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container py-12 md:py-20">
                <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
                    {/* Order Summary */}
                    <div className="md:col-span-1 space-y-6">
                        <Card className="bg-muted/30">
                            <CardHeader>
                                <CardTitle className="text-xl">Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center pb-4 border-b">
                                    <span className="font-medium">Premium Plan</span>
                                    <span>₹99.00</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 text-lg font-bold">
                                    <span>Total Amount</span>
                                    <span className="text-primary">₹99.00</span>
                                </div>
                                <div className="pt-4 flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <ShieldCheck className="h-4 w-4 text-success" />
                                        Secure 256-bit SSL encryption
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <CheckCircle2 className="h-4 w-4 text-success" />
                                        Instant activation
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="text-center p-4">
                            <Link to="/">
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <ArrowRight className="h-4 w-4 rotate-180" />
                                    Cancel & Return
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <Card className="md:col-span-2 border-2 shadow-xl overflow-hidden">
                        <CardHeader className="bg-muted/20 border-b">
                            <CardTitle>Select Payment Method</CardTitle>
                            <CardDescription>All major Indian payment apps and cards supported</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <Tabs defaultValue="upi" className="w-full">
                                <TabsList className="grid w-full grid-cols-3 mb-8">
                                    <TabsTrigger value="upi" className="gap-2">
                                        <Smartphone className="h-4 w-4" />
                                        UPI
                                    </TabsTrigger>
                                    <TabsTrigger value="card" className="gap-2">
                                        <CreditCard className="h-4 w-4" />
                                        Card
                                    </TabsTrigger>
                                    <TabsTrigger value="netbanking" className="gap-2">
                                        <Building2 className="h-4 w-4" />
                                        NetBanking
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="upi" className="space-y-6 mt-0">
                                    <form onSubmit={handlePayment} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="upi-id">UPI ID (Google Pay, PhonePe, BHIM)</Label>
                                            <Input id="upi-id" placeholder="yourname@upi" required />
                                        </div>
                                        <div className="p-4 bg-muted/30 rounded-lg text-center">
                                            <p className="text-sm text-muted-foreground mb-2">Scan QR Code to pay</p>
                                            <div className="h-32 w-32 bg-white border-2 border-dashed border-muted mx-auto flex items-center justify-center mb-2">
                                                <Smartphone className="h-10 w-10 text-muted" />
                                            </div>
                                            <p className="text-xs font-mono">BHIM UPI 2.0 Enabled</p>
                                        </div>
                                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 py-6" disabled={isProcessing}>
                                            {isProcessing ? (
                                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing UPI Request...</>
                                            ) : "Pay ₹99 Securely"}
                                        </Button>
                                    </form>
                                </TabsContent>

                                <TabsContent value="card" className="space-y-4 mt-0">
                                    <form onSubmit={handlePayment} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="card-number">Card Number</Label>
                                            <div className="relative">
                                                <Input id="card-number" placeholder="XXXX XXXX XXXX XXXX" required />
                                                <CreditCard className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="expiry">Expiry Date</Label>
                                                <Input id="expiry" placeholder="MM/YY" required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="cvv">CVV</Label>
                                                <Input id="cvv" type="password" placeholder="***" maxLength={3} required />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="card-name">Name on Card</Label>
                                            <Input id="card-name" placeholder="Full Name as per card" required />
                                        </div>
                                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 py-6" disabled={isProcessing}>
                                            {isProcessing ? (
                                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Authorizing via Gateway...</>
                                            ) : "Pay ₹99 Securely"}
                                        </Button>
                                    </form>
                                </TabsContent>

                                <TabsContent value="netbanking" className="space-y-4 mt-0">
                                    <form onSubmit={handlePayment} className="space-y-6">
                                        <div className="grid grid-cols-2 gap-3">
                                            {["SBI", "HDFC", "ICICI", "Axis", "KOTAK", "PNB"].map(bank => (
                                                <Button key={bank} type="button" variant="outline" className="justify-start gap-2 h-14">
                                                    <div className="h-6 w-6 rounded bg-muted/50 flex items-center justify-center text-[10px] font-bold">{bank[0]}</div>
                                                    {bank}
                                                </Button>
                                            ))}
                                        </div>
                                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 py-6" disabled={isProcessing}>
                                            {isProcessing ? (
                                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting to Bank...</>
                                            ) : "Pay ₹99 Securely"}
                                        </Button>
                                    </form>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                        <div className="bg-muted/50 p-4 text-center border-t">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-2">
                                Powered by <span className="font-bold text-foreground">CleanWard Payments</span> <ShieldCheck className="h-3 w-3" /> PCI DSS Compliant
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </Layout>
    );
};

export default PaymentPage;
