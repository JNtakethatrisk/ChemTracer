import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Microscope, User, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import OverviewCards from "@/components/dashboard/overview-cards";
import WeeklyInputForm from "@/components/dashboard/weekly-input-form";
import ChartsSection from "@/components/dashboard/charts-section";
import HistoricalTable from "@/components/dashboard/historical-table";
import InsightsSection from "@/components/dashboard/insights-section";
import HighRiskWarning from "@/components/dashboard/high-risk-warning";
import { MicroplasticEntry } from "@shared/schema";

export default function Dashboard() {
  const { data: entries = [] } = useQuery<MicroplasticEntry[]>({
    queryKey: ["/api/microplastic-entries"],
  });

  const handleExportData = () => {
    if (entries.length === 0) {
      alert("No data to export");
      return;
    }

    const csvContent = [
      "Week,Bottled Water,Seafood,Salt,Plastic Packaged,Tea Bags,Household Dust,Synthetic Clothing,Canned Food,Cosmetics,Plastic Kitchenware,Total Particles,Risk Level",
      ...entries.map(entry => 
        `${entry.weekStart},${entry.bottledWater},${entry.seafood},${entry.salt},${entry.plasticPackaged},${entry.teaBags},${entry.householdDust},${entry.syntheticClothing},${entry.cannedFood},${entry.cosmetics},${entry.plasticKitchenware},${entry.totalParticles},${entry.riskLevel}`
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
    <div className="min-h-screen bg-background">
      {/* High Risk Warning Modal */}
      <HighRiskWarning />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Microscope className="text-primary text-2xl mr-3 h-6 w-6" />
              <h1 className="text-xl font-semibold text-gray-900">MicroPlastic Tracker™</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/about">
                <Button 
                  data-testid="button-about-us"
                  className="gap-2 bg-slate-700 hover:bg-slate-800 text-white"
                >
                  <Info className="h-4 w-4" />
                  About Us
                </Button>
              </Link>
              <Button 
                onClick={handleExportData}
                data-testid="button-export-data"
                className="bg-primary hover:bg-primary/90"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Overview Cards */}
        <OverviewCards />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
          {/* Weekly Input Form */}
          <div className="xl:col-span-1">
            <WeeklyInputForm />
          </div>

          {/* Charts Section */}
          <div className="xl:col-span-2">
            <ChartsSection />
          </div>
        </div>

        {/* Historical Data Table */}
        <div className="mt-8">
          <HistoricalTable />
        </div>

        {/* Insights and Recommendations */}
        <div className="mt-8">
          <InsightsSection />
        </div>

        {/* FDA Disclaimer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            These statements have not been evaluated by the FDA nor are we medical professionals.
          </p>
        </div>
      </div>
    </div>
  );
}
