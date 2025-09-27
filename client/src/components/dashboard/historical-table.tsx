import { useState } from "react";
import { Filter, Search, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { getWeekLabel } from "../../lib/calculations";
import { getSourceBreakdown } from "../../lib/microplastic-sources";
import { useTrackerData } from "../../hooks/useTrackerData";

export default function HistoricalTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { entries, isLoading } = useTrackerData('microplastic');

  const filteredEntries = entries.filter((entry: any) => {
    const weekLabel = getWeekLabel(entry.weekStart);
    const matchesSearch = weekLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.riskLevel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRiskLevel = riskLevelFilter === "all" || entry.riskLevel === riskLevelFilter;
    return matchesSearch && matchesRiskLevel;
  });

  // Reset to first page when filters change
  const handleFilterChange = (newFilter: string) => {
    setRiskLevelFilter(newFilter);
    setCurrentPage(1);
  };

  const handleSearchChange = (newSearch: string) => {
    setSearchTerm(newSearch);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEntries = filteredEntries.slice(startIndex, startIndex + itemsPerPage);

  const getTopSource = (entry: any) => {
    const sources = getSourceBreakdown({
      bottledWater: entry.bottledWater || 0,
      seafood: entry.seafood || 0,
      salt: entry.salt || 0,
      plasticPackaged: entry.plasticPackaged || 0,
      teaBags: entry.teaBags || 0,
      householdDust: entry.householdDust || 0,
      syntheticClothing: entry.syntheticClothing || 0,
      cannedFood: entry.cannedFood || 0,
      plasticKitchenware: entry.plasticKitchenware || 0,
    });
    return sources[0]?.label || "None";
  };

  const getChangeFromPrevious = (currentEntry: any, index: number) => {
    if (index === entries.length - 1) return null;
    const previousEntry = entries[index + 1];
    if (!previousEntry) return null;
    
    const change = ((currentEntry.totalParticles - previousEntry.totalParticles) / previousEntry.totalParticles) * 100;
    return change;
  };

  const getRiskLevelBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case "Low":
        return "default";
      case "Normal":
        return "secondary";
      case "High":
        return "destructive";
      case "Extreme":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historical Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-historical-data">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Historical Data</CardTitle>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search weeks or risk levels..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 w-64"
                data-testid="input-search"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>
        
        {/* Filter Bar */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">Filters</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-700">Risk Level:</label>
                <Select value={riskLevelFilter} onValueChange={handleFilterChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Extreme">Extreme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setRiskLevelFilter("all");
                  setCurrentPage(1);
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {paginatedEntries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {entries.length === 0 ? "No data available. Start by adding your first weekly entry." : "No entries match your search."}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="sm:hidden space-y-4">
              {paginatedEntries.map((entry: any, index: number) => {
                const globalIndex = startIndex + index;
                const change = getChangeFromPrevious(entry, globalIndex);
                const topSource = getTopSource(entry);
                
                return (
                  <div key={entry.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Week of</p>
                        <p className="text-base font-semibold text-gray-900">{getWeekLabel(entry.weekStart)}</p>
                      </div>
                      <Badge 
                        variant={getRiskLevelBadgeVariant(entry.riskLevel)}
                        data-testid={`badge-risk-${entry.id}`}
                      >
                        {entry.riskLevel}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Intake</p>
                        <p className="text-lg font-semibold text-gray-900">{entry.totalParticles.toFixed(1)} p/mL</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Change</p>
                        <p className={`text-lg font-semibold ${
                          change === null ? 'text-gray-500' :
                          change > 0 ? 'text-red-600' : 
                          change < 0 ? 'text-green-600' : 
                          'text-gray-600'
                        }`}>
                          {change === null ? '—' : 
                           change === 0 ? 'No change' :
                           `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Top Source</p>
                      <p className="text-base text-gray-900">{topSource || 'No data'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Week</TableHead>
                    <TableHead>Total Intake</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Top Source</TableHead>
                    <TableHead>Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEntries.map((entry: any, index: number) => {
                    const globalIndex = startIndex + index;
                    const change = getChangeFromPrevious(entry, globalIndex);
                    
                    return (
                      <TableRow key={entry.id} className="hover:bg-gray-50">
                        <TableCell className="text-sm text-gray-900">
                          {getWeekLabel(entry.weekStart)}
                        </TableCell>
                        <TableCell className="text-sm font-medium text-gray-900">
                          {entry.totalParticles.toFixed(1)} p/mL
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={getRiskLevelBadgeVariant(entry.riskLevel)}
                            data-testid={`badge-risk-${entry.id}`}
                          >
                            {entry.riskLevel}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-900">
                          {getTopSource(entry)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {change !== null ? (
                            <span className={change >= 0 ? "text-red-600" : "text-green-600"}>
                              {change >= 0 ? "+" : ""}{change.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredEntries.length)}</span> of{" "}
                <span className="font-medium">{filteredEntries.length}</span> results
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  data-testid="button-previous-page"
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    data-testid={`button-page-${page}`}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  data-testid="button-next-page"
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
