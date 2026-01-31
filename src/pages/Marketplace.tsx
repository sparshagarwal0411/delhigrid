import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
    ShoppingBag,
    Ticket,
    Leaf,
    Coffee,
    Book,
    Smartphone,
    TreePine,
    Droplets,
    Wine,
    Trash2,
    Gem,
    Coins,
    ArrowRight
} from "lucide-react";

interface MarketplaceItem {
    id: string;
    title: string;
    description: string;
    points: number;
    category: string;
    icon: any;
    image: string;
}

const MARKETPLACE_ITEMS: MarketplaceItem[] = [
    {
        id: "item-1",
        title: "Delhi Metro Travel Pass",
        description: "Recharge your metro card with ₹50 balance for sustainable travel.",
        points: 500,
        category: "Travel",
        icon: Ticket,
        image: "https://img.republicworld.com/rimages/ANI-20240118224520-170652722990616_9.webp?q=75&format=webp"
    },
    {
        id: "item-2",
        title: "Bamboo Straw Set",
        description: "Handcrafted reusable bamboo straws with a cleaning brush.",
        points: 200,
        category: "Product",
        icon: Coffee,
        image: "https://images.squarespace-cdn.com/content/v1/5b277af875f9ee04f69775de/1548732779365-PBZ17M85HZ8BRVVE3Y0H/Jungle-Straws-Reusable-Straws-Set-Reusable-Bamboo-Straws-Eco-Friendly-Organic-Wholesale-Dishwasher-Safe-Washable.jpg?format=300w"
    },
    {
        id: "item-3",
        title: "Organic Cotton Tote Bag",
        description: "Durable, eco-friendly bag for all your shopping needs.",
        points: 150,
        category: "Product",
        icon: ShoppingBag,
        image: "https://www.intelligentchange.com/cdn/shop/products/4X5-WebRes-Intelligent-Change-Tote-Bags-1_301b012d-03b9-4917-96ff-e911c5783d56.jpg?v=1671127106&width=1120"
    },
    {
        id: "item-4",
        title: "Seed Paper Notebook",
        description: "A notebook made of seeds that you can plant after use.",
        points: 100,
        category: "Stationery",
        icon: Book,
        image: "https://seedballs.in/cdn/shop/files/Eco-friendly_seed_paper_notebook_-_Plantable_seed_paper_notebook_-_Sustainable_notebook_2.jpg?v=1740205177"
    },
    {
        id: "item-5",
        title: "Solar Power Bank",
        description: "Portable 10,000mAh power bank charged by the sun.",
        points: 1000,
        category: "Tech",
        icon: Smartphone,
        image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&q=80"
    },
    {
        id: "item-6",
        title: "Air Purifying Snake Plant",
        description: "A low-maintenance indoor plant that naturally purifies air.",
        points: 300,
        category: "Plant",
        icon: Leaf,
        image: "https://www.rainbowgardens.biz/wp-content/uploads/2020/06/99098332_2128802690598919_8123385291206557696_n-copy.jpg"
    },
    {
        id: "item-7",
        title: "Compostable Dustbin Bags",
        description: "Pack of 30 heavy-duty biodegradable waste bags.",
        points: 100,
        category: "Waste Management",
        icon: Trash2,
        image: "https://www.shalimargroupindia.com/shop/wp-content/uploads/2020/07/Compostable-Garbage-Bag-1200x1450-new-1-600x728.jpg"
    },
    {
        id: "item-8",
        title: "Recycled Glass Bottle",
        description: "Stylishly designed water bottle made from 100% recycled glass.",
        points: 250,
        category: "Product",
        icon: Wine,
        image: "https://hwestequipment.com/wp-content/uploads/2019/02/Things-Made-from-Recycled-Glass.jpg"
    },
    {
        id: "item-9",
        title: "Jute Wall Hanging",
        description: "Beautifully handcrafted jute art for your home decor.",
        points: 400,
        category: "Handicrafts",
        icon: Gem,
        image: "https://m.media-amazon.com/images/I/71lJOpqq8CL._AC_UF894,1000_QL80_.jpg"
    },
    {
        id: "item-10",
        title: "Eco Cleaning Kit",
        description: "Natural, chemical-free cleaning solutions for a greener home.",
        points: 350,
        category: "Product",
        icon: Droplets,
        image: "https://www.worthview.com/wp-content/uploads/2022/02/Eco-Friendly-Home-cleaning-products.png"
    },
    {
        id: "item-11",
        title: "Eco-Museum Ticket",
        description: "Access pass to the National Museum of Natural History, Delhi.",
        points: 150,
        category: "Travel",
        icon: Ticket,
        image: "https://www.distinctdestinations.in/DistinctDestinationsBackEndImg/downloads/Tibet-House-Museum.jpg"
    },
    {
        id: "item-12",
        title: "Plant a Tree in Your Name",
        description: "A tree will be planted in a Delhi park with your digital certificate.",
        points: 50,
        category: "Donation",
        icon: TreePine,
        image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&q=80"
    }
];

const Marketplace = () => {
    const [userScore, setUserScore] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [redeeming, setRedeeming] = useState<string | null>(null);
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        const fetchUserScore = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    navigate("/auth");
                    return;
                }

                const { data: profile, error } = await supabase
                    .from("users")
                    .select("score")
                    .eq("id", session.user.id)
                    .single();

                if (error) throw error;
                setUserScore(profile?.score ?? 0);
            } catch (error) {
                console.error("Error fetching score:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserScore();
    }, [navigate]);

    const handleRedeem = async (item: MarketplaceItem) => {
        if (userScore === null || userScore < item.points) {
            toast({
                title: "Insufficient Points",
                description: `You need ${item.points - (userScore || 0)} more points to redeem this item.`,
                variant: "destructive",
            });
            return;
        }

        setRedeeming(item.id);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("No session");

            const newScore = userScore - item.points;

            const { error } = await (supabase
                .from("users") as any)
                .update({ score: newScore })
                .eq("id", session.user.id);

            if (error) throw error;

            setUserScore(newScore);
            toast({
                title: "Redemption Successful!",
                description: `You have successfully redeemed ${item.title}. You will receive a confirmation email soon.`,
            });
        } catch (error) {
            console.error("Redemption error:", error);
            toast({
                title: "Error",
                description: "Failed to process redemption. Please try again later.",
                variant: "destructive",
            });
        } finally {
            setRedeeming(null);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="container py-12 flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container py-12 space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-heading font-bold text-foreground">Green Marketplace</h1>
                        <p className="text-lg text-muted-foreground max-w-2xl">
                            Redeem your hard-earned points for eco-friendly products, sustainable travel, and environmental causes.
                        </p>
                    </div>
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader className="py-4 px-6 flex flex-row items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                                <Coins className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Your Balance</p>
                                <p className="text-2xl font-bold text-primary">{userScore?.toLocaleString()} Points</p>
                            </div>
                        </CardHeader>
                    </Card>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {MARKETPLACE_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const canAfford = (userScore || 0) >= item.points;

                        return (
                            <Card key={item.id} className="group relative flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300 border-border/60">
                                <div className="aspect-[4/3] relative overflow-hidden">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                                    <Badge className="absolute top-3 right-3 bg-background/90 text-foreground backdrop-blur-sm border-none shadow-sm">
                                        {item.category}
                                    </Badge>
                                </div>

                                <CardHeader className="flex-1 pb-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-primary">
                                                <Icon className="h-4 w-4" />
                                                <span className="text-xs font-bold uppercase tracking-widest">{item.category}</span>
                                            </div>
                                            <CardTitle className="text-xl line-clamp-1 group-hover:text-primary transition-colors">
                                                {item.title}
                                            </CardTitle>
                                        </div>
                                    </div>
                                    <CardDescription className="line-clamp-2 mt-2 leading-relaxed">
                                        {item.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="pt-0 flex items-center gap-2">
                                    <div className="flex items-center gap-1.5 font-bold text-lg">
                                        <Coins className="h-4 w-4 text-primary" />
                                        <span>{item.points}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">Points needed</span>
                                </CardContent>

                                <CardFooter className="pt-2 border-t bg-muted/30">
                                    <Button
                                        variant={canAfford ? "civic" : "outline"}
                                        className="w-full transition-all group-hover:gap-3"
                                        onClick={() => handleRedeem(item)}
                                        disabled={redeeming === item.id}
                                    >
                                        {redeeming === item.id ? (
                                            <>
                                                <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent animate-spin rounded-full mr-2" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                {canAfford ? "Redeem Now" : "Earn More Points"}
                                                <ArrowRight className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 transition-all" />
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>

                <section className="bg-muted p-8 rounded-2xl border flex flex-col md:flex-row items-center gap-8 justify-between">
                    <div className="space-y-4 text-center md:text-left">
                        <h2 className="text-3xl font-bold font-heading">Want more points?</h2>
                        <p className="text-muted-foreground max-w-lg">
                            Each environmental action you take helps your ward and earns you points.
                            Start a new goal today and work towards your next reward!
                        </p>
                        <Button variant="outline" size="lg" onClick={() => navigate("/citizen")} className="rounded-full px-8">
                            Back to Dashboard
                        </Button>
                    </div>
                    <div className="relative">
                        <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full" />
                        <ShoppingBag className="h-32 w-32 text-primary relative" />
                    </div>
                </section>
            </div>
        </Layout>
    );
};

export default Marketplace;
