import { useLocation } from "wouter";
import { Navigation } from "./navigation";
import { MobileNav } from "./mobile-nav";
import { cn } from "../lib/utils";
import { useSwipeGesture } from "../hooks/useSwipeGesture";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function Layout({ children, className }: LayoutProps) {
  const [location, setLocation] = useLocation();
  
  // Setup swipe navigation between trackers
  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: () => {
      if (location === "/dashboard") {
        setLocation("/pfa-dashboard");
      } else if (location === "/") {
        setLocation("/dashboard");
      }
    },
    onSwipeRight: () => {
      if (location === "/pfa-dashboard") {
        setLocation("/dashboard");
      } else if (location === "/dashboard") {
        setLocation("/");
      }
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main 
        className={cn("pb-20 sm:pb-0 touch-pan-y", className)}
        onTouchStart={swipeHandlers.onTouchStart}
        onTouchMove={swipeHandlers.onTouchMove}
        onTouchEnd={swipeHandlers.onTouchEnd}
      >
        {/* Swipe indicator for mobile */}
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <div className="flex gap-1">
            <div className={cn(
              "h-1 w-8 rounded-full transition-colors",
              location === "/" ? "bg-green-600" : "bg-gray-300"
            )} />
            <div className={cn(
              "h-1 w-8 rounded-full transition-colors",
              location === "/dashboard" ? "bg-blue-600" : "bg-gray-300"
            )} />
            <div className={cn(
              "h-1 w-8 rounded-full transition-colors",
              location === "/pfa-dashboard" ? "bg-green-600" : "bg-gray-300"
            )} />
          </div>
        </div>
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
