import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import Landing from "./pages/landing";
import Dashboard from "./pages/dashboard";
import PfaDashboard from "./pages/pfa-dashboard";
import About from "./pages/about";
import FurtherReading from "./pages/further-reading";
import NotFound from "./pages/not-found";
import ErrorBoundary from "./components/ErrorBoundary";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/pfa-dashboard" component={PfaDashboard} />
      <Route path="/about" component={About} />
      <Route path="/further-reading" component={FurtherReading} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
