import { Navigation } from "./navigation";
import { MobileNav } from "./mobile-nav";
import { cn } from "../lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function Layout({ children, className }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className={cn("pb-20 sm:pb-0", className)}>
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
