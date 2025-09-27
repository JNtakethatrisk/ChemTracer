import { Link, useLocation } from "wouter";
import { Button } from "./ui/button";
import { Home, Leaf, Info, LogIn, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Logo from "./logo";
import PlasticLogo from "./plastic-logo";
import { useAuth } from "../contexts/AuthContext";

export function Navigation() {
  const [location] = useLocation();
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 hidden sm:block">
      <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/">
              <div className="flex items-center space-x-1 cursor-pointer">
                <Logo size="sm" className="text-green-900 flex items-center sm:hidden" />
                <Logo size="md" className="text-green-900 flex items-center hidden sm:block" />
                <span className="text-lg sm:text-xl font-bold text-green-800 italic">ChemTracer™</span>
              </div>
            </Link>
          </div>

          {/* Navigation Buttons - Mobile Optimized */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Link href="/">
              <Button
                variant={location === "/" ? "default" : "outline"}
                size="sm"
                className={`gap-1 sm:gap-2 px-2 sm:px-3 text-xs sm:text-sm ${
                  location === "/" 
                    ? "bg-white hover:bg-gray-50 text-green-800 border border-green-600" 
                    : "border border-green-600 text-green-700 hover:bg-green-100"
                }`}
              >
                <Home className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </Link>
            
            <Link href="/dashboard">
              <Button
                variant={location === "/dashboard" ? "default" : "outline"}
                size="sm"
                className="gap-1 sm:gap-2 border-blue-300 text-blue-700 hover:bg-blue-100 px-2 sm:px-3 text-xs sm:text-sm"
              >
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-100 rounded-full flex items-center justify-center border border-blue-300">
                  <PlasticLogo size="sm" className="text-blue-600" />
                </div>
                <span className="hidden sm:inline">Microplastic Tracker</span>
                <span className="sm:hidden">Micro</span>
              </Button>
            </Link>
            
            <Link href="/pfa-dashboard">
              <Button
                variant={location === "/pfa-dashboard" ? "default" : "outline"}
                size="sm"
                className={`gap-1 sm:gap-2 px-2 sm:px-3 text-xs sm:text-sm ${
                  location === "/pfa-dashboard" 
                    ? "bg-white hover:bg-gray-50 text-green-800 border border-green-600" 
                    : "border border-green-600 text-green-700 hover:bg-green-100"
                }`}
              >
                <Leaf className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">PFAS Tracker</span>
                <span className="sm:hidden">PFAS</span>
              </Button>
            </Link>
            
            <Link href="/about">
              <Button
                variant={location === "/about" ? "default" : "outline"}
                size="sm"
                className="gap-1 sm:gap-2 border-slate-300 text-slate-700 hover:bg-slate-100 px-2 sm:px-3 text-xs sm:text-sm"
              >
                <Info className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">About Us</span>
                <span className="sm:hidden">About</span>
              </Button>
            </Link>

            {/* Auth Section */}
            <div className="flex items-center ml-1 sm:ml-2">
              {isLoading ? (
                <div className="h-8 w-8 animate-pulse bg-gray-200 rounded-full" />
              ) : isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-1">
                      <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                        <AvatarImage src={user.picture} alt={user.name} />
                        <AvatarFallback className="bg-green-100 text-green-700 text-xs">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logout()} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={login}
                  size="sm"
                  variant="default"
                  className="bg-green-600 hover:bg-green-700 text-white gap-1 sm:gap-2 px-2 sm:px-3 text-xs sm:text-sm"
                >
                  <LogIn className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Sign in</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
