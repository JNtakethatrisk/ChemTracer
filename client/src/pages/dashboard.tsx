import { Download } from "lucide-react";
import { Button } from "../components/ui/button";
import Navigation from "../components/navigation";
import OverviewCards from "../components/dashboard/overview-cards";
import WeeklyInputForm from "../components/dashboard/weekly-input-form";
import ChartsSection from "../components/dashboard/charts-section";
import HistoricalTable from "../components/dashboard/historical-table";
import InsightsSection from "../components/dashboard/insights-section";
import { useTrackerData } from "../hooks/useTrackerData";
import { GuestBanner } from "../components/GuestBanner";
import { SaveDataPrompt } from "../components/SaveDataPrompt";

export default function Dashboard() {
  const { entries, isLoading, error, isGuest } = useTrackerData('microplastic');

  if (error) {
    console.error("Dashboard query error:", error);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center no-pull-refresh">
        <div className="text-center px-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-600 text-sm sm:text-base">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const handleExportData = () => {
    if (entries.length === 0) {
      alert("No data to export");
      return;
    }

    const csvContent = [
      "Week,Bottled Water,Seafood,Salt,Plastic Packaged,Tea Bags,Household Dust,Synthetic Clothing,Canned Food,Plastic Kitchenware,Coffee Cups,Takeout Containers,Total Particles,Risk Level",
      ...entries.map((entry: any) => 
        `${entry.weekStart},${entry.bottledWater || 0},${entry.seafood || 0},${entry.salt || 0},${entry.plasticPackaged || 0},${entry.teaBags || 0},${entry.householdDust || 0},${entry.syntheticClothing || 0},${entry.cannedFood || 0},${entry.plasticKitchenware || 0},${entry.coffeeCups || 0},${entry.takeoutContainers || 0},${entry.totalParticles || 0},${entry.riskLevel || ''}`
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "microplastic-data.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-blue-50 no-pull-refresh">
      {/* Navigation */}
      <Navigation />
      <GuestBanner />
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-4 sm:space-y-0">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-blue-800">MicroPlastic Tracker™</h1>
              <p className="text-sm sm:text-base text-blue-600">Monitor your microplastic intake based on peer reviewed studies</p>
            </div>
            <div className="flex justify-center sm:justify-end">
              <Button 
                onClick={handleExportData}
                data-testid="button-export-data"
                className="bg-primary hover:bg-primary/90 touch-target"
                size="sm"
              >
                <Download className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Export Data</span>
                <span className="sm:hidden">Export</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Input Form */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <WeeklyInputForm />
            {/* Save Data Prompt for Guests with Data */}
            {isGuest && entries.length > 0 && (
              <SaveDataPrompt variant="card" />
            )}
          </div>

          {/* Right Column - Charts and Data */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Overview Cards */}
            <OverviewCards />

            {/* Charts Section */}
            <ChartsSection />

            {/* Historical Table */}
            <HistoricalTable />

            {/* Insights Section */}
            <InsightsSection />
          </div>
        </div>

        {/* FDA Disclaimer */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center px-4">
            These statements have not been evaluated by the FDA nor are we medical professionals.
          </p>
        </div>
      </div>
    </div>
  );
}
