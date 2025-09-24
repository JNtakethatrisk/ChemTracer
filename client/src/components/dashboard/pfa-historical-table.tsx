import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X, Eye } from "lucide-react";
import { getPfaWeekLabel, formatPfaValue } from "@/lib/pfa-calculations";
import { getPfaSourceBreakdown } from "@/lib/pfa-sources";
import { PFA_RISK_LEVELS } from "@shared/schema";

interface PfaHistoricalTableProps {
  entries: any[];
}

const riskLevelColors = {
  "Low": "bg-green-100 text-green-800 border-green-300",
  "Normal": "bg-green-200 text-green-900 border-green-400", 
  "High": "bg-orange-100 text-orange-800 border-orange-300",
  "Extreme": "bg-red-100 text-red-800 border-red-300",
};

export function PfaHistoricalTable({ entries }: PfaHistoricalTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 10;

  const getRiskLevelBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case "Low":
        return "bg-green-100 text-green-800 border-green-300";
      case "Normal":
        return "bg-green-200 text-green-900 border-green-400";
      case "High":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "Extreme":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch = 
      getPfaWeekLabel(entry.weekStart).toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.riskLevel.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRiskLevel = riskLevelFilter === "All" || entry.riskLevel === riskLevelFilter;
    
    return matchesSearch && matchesRiskLevel;
  });

  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEntries = filteredEntries.slice(startIndex, startIndex + itemsPerPage);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleRiskLevelChange = (value: string) => {
    setRiskLevelFilter(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setRiskLevelFilter("All");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm !== "" || riskLevelFilter !== "All";

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-green-800">PFA Exposure History</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="border-green-300 text-green-700 hover:bg-green-100"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        {showFilters && (
          <div className="space-y-4 p-4 bg-green-100 rounded-lg border border-green-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 h-4 w-4" />
                  <Input
                    placeholder="Search by week or risk level..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10 border-green-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={riskLevelFilter} onValueChange={handleRiskLevelChange}>
                  <SelectTrigger className="border-green-300 focus:border-green-500">
                    <SelectValue placeholder="Risk Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Risk Levels</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Extreme">Extreme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="border-green-300 text-green-700 hover:bg-green-100"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {filteredEntries.length === 0 ? (
          <div className="text-center py-8 text-green-600">
            <p>No PFA entries found matching your criteria.</p>
          </div>
        ) : (
          <>
            <div className="rounded-md border border-green-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-green-100">
                    <TableHead className="text-green-800 font-semibold">Week</TableHead>
                    <TableHead className="text-green-800 font-semibold">PFA Level</TableHead>
                    <TableHead className="text-green-800 font-semibold">Risk Level</TableHead>
                    <TableHead className="text-green-800 font-semibold">Top Sources</TableHead>
                    <TableHead className="text-green-800 font-semibold">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEntries.map((entry) => {
                    const sourceBreakdown = getPfaSourceBreakdown(entry);
                    const topSources = sourceBreakdown
                      .filter(source => source.value > 0)
                      .sort((a, b) => b.pfas - a.pfas)
                      .slice(0, 2)
                      .map(source => source.source)
                      .join(", ");

                    return (
                      <TableRow key={entry.id} className="hover:bg-green-50">
                        <TableCell className="font-medium text-green-800">
                          {getPfaWeekLabel(entry.weekStart)}
                        </TableCell>
                        <TableCell className="text-green-700 font-mono">
                          {formatPfaValue(entry.totalPfas)} ppt
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={getRiskLevelBadgeVariant(entry.riskLevel)}
                          >
                            {entry.riskLevel}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-green-700 text-sm">
                          {topSources || "No sources"}
                        </TableCell>
                        <TableCell className="text-green-600 text-sm">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-green-600">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredEntries.length)} of {filteredEntries.length} entries
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-green-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default PfaHistoricalTable;
