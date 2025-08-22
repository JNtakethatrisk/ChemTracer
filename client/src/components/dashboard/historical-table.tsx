import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye, Filter, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MicroplasticEntry } from "@shared/schema";
import { getWeekLabel, getSourceBreakdown } from "@/lib/calculations";

export default function HistoricalTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: entries = [], isLoading } = useQuery<MicroplasticEntry[]>({
    queryKey: ["/api/microplastic-entries"],
  });

  const filteredEntries = entries.filter(entry => {
    const weekLabel = getWeekLabel(entry.weekStart);
    return weekLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
           entry.riskLevel.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEntries = filteredEntries.slice(startIndex, startIndex + itemsPerPage);

  const getTopSource = (entry: MicroplasticEntry) => {
    const sources = getSourceBreakdown({
      bottledWater: entry.bottledWater || 0,
      seafood: entry.seafood || 0,
      salt: entry.salt || 0,
      plasticPackaged: entry.plasticPackaged || 0,
      teaBags: entry.teaBags || 0,
      householdDust: entry.householdDust || 0,
      syntheticClothing: entry.syntheticClothing || 0,
      cannedFood: entry.cannedFood || 0,
      cosmetics: entry.cosmetics || 0,
      plasticKitchenware: entry.plasticKitchenware || 0,
    });
    return sources[0]?.label || "None";
  };

  const getChangeFromPrevious = (currentEntry: MicroplasticEntry, index: number) => {
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
      case "Medium":
        return "secondary";
      case "High":
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
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-48"
                data-testid="input-search"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Week</TableHead>
                    <TableHead>Total Intake</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Top Source</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEntries.map((entry, index) => {
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
                        <TableCell>
                          <Button variant="ghost" size="sm" data-testid={`button-view-${entry.id}`}>
                            <Eye className="h-4 w-4" />
                          </Button>
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
