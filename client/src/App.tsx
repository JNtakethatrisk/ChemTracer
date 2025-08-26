import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useIPCacheInvalidation } from "@/hooks/use-ip-cache-invalidation";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import About from "@/pages/about";
import NotFound from "@/pages/not-found";

function Router() {
  // Initialize IP-based cache invalidation
  useIPCacheInvalidation();

  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/about" component={About} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
