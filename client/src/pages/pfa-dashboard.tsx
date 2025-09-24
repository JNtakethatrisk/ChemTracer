import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import Navigation from "../components/navigation";
import { PfaWeeklyInputForm } from "../components/dashboard/pfa-weekly-input-form";
import { PfaOverviewCards } from "../components/dashboard/pfa-overview-cards";
import { PfaChartsSection } from "../components/dashboard/pfa-charts-section";
import { PfaHistoricalTable } from "../components/dashboard/pfa-historical-table";
import { PfaInsightsSection } from "../components/dashboard/pfa-insights-section";
import { PfaLearnMoreModal } from "../components/dashboard/pfa-learn-more-modal";
import { Button } from "../components/ui/button";
import { Download } from "lucide-react";
import { useSessionCacheInvalidation } from "../hooks/use-ip-cache-invalidation";

export function PfaDashboard() {
  // Enable IP-based cache invalidation for clean slate on new IPs
  useSessionCacheInvalidation();

  const { data: entries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ["/api/pfa-entries"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/pfa-entries");
      return response.json();
    },
  });

  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/pfa-dashboard-stats"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/pfa-dashboard-stats");
      return response.json();
    },
  });

  const handleExportData = () => {
    if (!entries || entries.length === 0) {
      alert("No data to export");
      return;
    }

    const csvContent = [
      ["Week Start", "Dental Floss", "Toilet Paper", "Sweat/Water Resistant Clothing", "Tap Water", "Non-Stick Pans", "Total PFAs", "Risk Level", "Created At"],
      ...entries.map((entry: any) => [
        entry.weekStart,
        entry.dentalFloss || 0,
        entry.toiletPaper || 0,
        entry.sweatResistantClothing || 0,
        entry.tapWater || 0,
        entry.nonStickPans || 0,
        entry.totalPfas || 0,
        entry.riskLevel || "",
        new Date(entry.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `pfa-data-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  };

  if (entriesLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center no-pull-refresh">
        <div className="text-center px-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-green-600 text-sm sm:text-base">Loading PFA dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 no-pull-refresh">
      {/* Navigation */}
      <Navigation />
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-4 sm:space-y-0">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-green-800">PFA Tracker</h1>
              <p className="text-sm sm:text-base text-green-600">Monitor your exposure to forever chemicals</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Button 
                onClick={handleExportData}
                data-testid="button-export-pfa-data"
                className="bg-green-600 hover:bg-green-700 text-white touch-target"
                size="sm"
              >
                <Download className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Export Data</span>
                <span className="sm:hidden">Export</span>
              </Button>
              <PfaLearnMoreModal />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Input Form */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <PfaWeeklyInputForm />
          </div>

          {/* Right Column - Charts and Data */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Overview Cards */}
            {dashboardStats && <PfaOverviewCards stats={dashboardStats} />}

            {/* Charts Section */}
            <PfaChartsSection entries={entries} />

            {/* Historical Table */}
            <PfaHistoricalTable entries={entries} />

            {/* Insights Section */}
            {dashboardStats && (
              <PfaInsightsSection
                entries={entries}
                currentRiskLevel={dashboardStats.currentRiskLevel}
                weeklyIntake={dashboardStats.weeklyIntake}
                monthlyAverage={dashboardStats.monthlyAverage}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PfaDashboard;
