import { useEffect, useState } from "react";
import { Leaf } from "lucide-react";

export const LoadingScreen = ({ onComplete }: { onComplete?: () => void }) => {
    const [show, setShow] = useState(true);

    useEffect(() => {
        // Prevent scrolling while loading
        document.body.style.overflow = "hidden";

        const timer = setTimeout(() => {
            setShow(false);
            // Re-enable scrolling
            document.body.style.overflow = "unset";
            if (onComplete) onComplete();
        }, 5000); // 5.0s total animation time

        return () => {
            clearTimeout(timer);
            document.body.style.overflow = "unset";
        };
    }, [onComplete]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center animate-out fade-out [animation-duration:1000ms] [animation-delay:4000ms] fill-mode-forwards">
            <div className="flex flex-col items-center gap-6">
                <div className="relative">
                    <div className="h-24 w-24 rounded-3xl bg-primary flex items-center justify-center animate-in zoom-in [animation-duration:1000ms] ease-out">
                        <Leaf className="h-12 w-12 text-primary-foreground animate-pulse [animation-duration:3000ms]" />
                    </div>
                    {/* Ripple effect */}
                    <div className="absolute inset-0 rounded-3xl bg-primary/30 animate-ping [animation-duration:2000ms] -z-10" />
                </div>

                <div className="text-center space-y-2 overflow-hidden">
                    <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary translate-y-full animate-in slide-in-from-bottom [animation-duration:1000ms] fill-mode-forwards delay-700">
                        CleanWard
                    </h1>
                    <p className="text-lg text-muted-foreground translate-y-full animate-in slide-in-from-bottom [animation-duration:1000ms] fill-mode-forwards [animation-delay:1500ms]">
                        For a Cleaner Delhi
                    </p>
                </div>
            </div>
        </div>
    );
};
