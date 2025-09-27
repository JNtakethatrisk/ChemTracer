import { Link, useLocation } from "wouter";
import { Droplets, Leaf, Info, Home, User } from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "../contexts/AuthContext";

export function MobileNav() {
  const [location] = useLocation();
  const { isAuthenticated, user } = useAuth();

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: "Home",
      active: location === "/"
    },
    {
      href: "/dashboard",
      icon: Droplets,
      label: "Micro",
      active: location === "/dashboard"
    },
    {
      href: "/pfa-dashboard",
      icon: Leaf,
      label: "PFAS",
      active: location === "/pfa-dashboard"
    },
    {
      href: "/about",
      icon: Info,
      label: "About",
      active: location === "/about" || location === "/further-reading"
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 pb-safe sm:hidden z-50">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <a
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-3 min-w-[64px] min-h-[56px] transition-colors",
                  item.active
                    ? "text-green-600"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <Icon className={cn(
                  "h-6 w-6 mb-1",
                  item.active && "animate-in zoom-in-50 duration-200"
                )} />
                <span className={cn(
                  "text-xs font-medium",
                  item.active && "font-semibold"
                )}>
                  {item.label}
                </span>
              </a>
            </Link>
          );
        })}
        
        {/* User icon */}
        <div className="flex flex-col items-center justify-center py-2 px-3 min-w-[64px] min-h-[56px]">
          {isAuthenticated ? (
            <div className="flex flex-col items-center">
              {user?.picture ? (
                <img 
                  src={user.picture} 
                  alt="Profile" 
                  className="h-6 w-6 rounded-full mb-1"
                />
              ) : (
                <User className="h-6 w-6 mb-1 text-gray-600" />
              )}
              <span className="text-xs font-medium text-gray-600">Profile</span>
            </div>
          ) : (
            <button 
              onClick={() => window.location.href = '/auth/google'}
              className="flex flex-col items-center text-gray-600 hover:text-gray-900"
            >
              <User className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">Sign In</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
