
import { useEffect, useState } from "react";
import { ArrowUp, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export const FloatingActionButtons = () => {
    const [isVisible, setIsVisible] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);

        return () => {
            window.removeEventListener("scroll", toggleVisibility);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "CleanWard",
                    text: "Check out this ward's pollution data!",
                    url: window.location.href,
                });
            } catch (error) {
                console.error("Error sharing:", error);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast({
                title: "Link copied",
                description: "The link has been copied to your clipboard.",
            });
        }
    };

    // Only render if we want them to be always visible or conditionally visible.
    // Requirement: "add back to top sticky button ... along with share button under it"
    // Usually back to top is only useful when scrolled. Share might be useful always?
    // User asked for "Back to top ... along with share".
    // I will show both ONLY when scrolled to avoid clutter on hero sections,
    // OR show Share always and Back To Top only when scrolled?
    // Let's keep them together for consistency as requested "along with".
    // So I'll hide both derived from scroll, OR show Share always?
    // "Back to top sticky button ... along with share button under it"
    // Interpreting as a group.
    // I'll make the group visible when scrolled down > 300px.
    // Actually, Share is useful even at the top.
    // Let's make "Back To Top" conditionally visible, but Share always visible?
    // But they are "sticky buttons" at "bottom right".
    // If I have one always visible and one popping in, it might look jumpy.
    // Let's make both appear/disappear or just 'Back To Top' appears.
    // Commonly, FABs are always there or appear on scroll.
    // If I hide Share at top, user can't share instantly.
    // I will make Share ALWAYS visible, and Back To Top conditionally visible *above* it.

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-center">
            <Button
                variant="secondary"
                size="icon"
                className={cn(
                    "h-14 w-14 rounded-full shadow-lg transition-all duration-300",
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                )}
                onClick={scrollToTop}
                aria-label="Back to top"
            >
                <ArrowUp className="h-7 w-7" />
            </Button>

            <Button
                variant="default"
                size="icon"
                className="h-14 w-14 rounded-full shadow-lg"
                onClick={handleShare}
                aria-label="Share page"
            >
                <Share2 className="h-7 w-7" />
            </Button>
        </div>
    );
};
