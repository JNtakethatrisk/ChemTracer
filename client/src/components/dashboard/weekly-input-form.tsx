import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { insertMicroplasticEntrySchema, type InsertMicroplasticEntry } from "@shared/schema";
import { MICROPLASTIC_SOURCES, getWeekStart, getWeekLabel } from "@/lib/calculations";
import { apiRequest } from "@/lib/queryClient";

const formSchema = insertMicroplasticEntrySchema.extend({
  bottledWater: insertMicroplasticEntrySchema.shape.bottledWater.default(0),
  seafood: insertMicroplasticEntrySchema.shape.seafood.default(0),
  salt: insertMicroplasticEntrySchema.shape.salt.default(0),
  plasticPackaged: insertMicroplasticEntrySchema.shape.plasticPackaged.default(0),
  teaBags: insertMicroplasticEntrySchema.shape.teaBags.default(0),
  householdDust: insertMicroplasticEntrySchema.shape.householdDust.default(0),
  syntheticClothing: insertMicroplasticEntrySchema.shape.syntheticClothing.default(0),
  cannedFood: insertMicroplasticEntrySchema.shape.cannedFood.default(0),
  cosmetics: insertMicroplasticEntrySchema.shape.cosmetics.default(0),
  plasticKitchenware: insertMicroplasticEntrySchema.shape.plasticKitchenware.default(0),
});

export default function WeeklyInputForm() {
  const [showExpanded, setShowExpanded] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const currentWeekStart = getWeekStart(new Date());
  const weekLabel = getWeekLabel(currentWeekStart);

  const form = useForm<InsertMicroplasticEntry>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weekStart: currentWeekStart,
      bottledWater: 0,
      seafood: 0,
      salt: 0,
      plasticPackaged: 0,
      teaBags: 0,
      householdDust: 0,
      syntheticClothing: 0,
      cannedFood: 0,
      cosmetics: 0,
      plasticKitchenware: 0,
    },
  });

  const createEntryMutation = useMutation({
    mutationFn: async (data: InsertMicroplasticEntry) => {
      const response = await apiRequest("POST", "/api/microplastic-entries", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/microplastic-entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard-stats"] });
      toast({
        title: "Success",
        description: "Weekly data saved successfully",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save weekly data",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertMicroplasticEntry) => {
    createEntryMutation.mutate(data);
  };

  const primarySources = MICROPLASTIC_SOURCES.slice(0, 5);
  const expandedSources = MICROPLASTIC_SOURCES.slice(5);

  const renderSourceInput = (source: typeof MICROPLASTIC_SOURCES[0]) => (
    <FormField
      key={source.key}
      control={form.control}
      name={source.key as keyof InsertMicroplasticEntry}
      render={({ field }) => (
        <FormItem className="space-y-2">
          <FormLabel className="block text-sm font-medium text-gray-700">
            <i className={`${source.icon} ${source.color} mr-2`}></i>
            {source.label} ({source.unit})
          </FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder="0"
              value={field.value || 0}
              onChange={(e) => field.onChange(Number(e.target.value) || 0)}
              data-testid={`input-${source.key}`}
            />
          </FormControl>
          <p className="text-xs text-gray-500">{source.description}</p>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Weekly Input</CardTitle>
          <span className="text-sm text-gray-500" data-testid="text-current-week">
            Week of {weekLabel}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Primary Sources */}
            {primarySources.map((source) => renderSourceInput(source))}

            {/* Expand Toggle */}
            <div className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowExpanded(!showExpanded)}
                className="text-primary hover:text-primary/90 p-0 h-auto"
                data-testid="button-toggle-sources"
              >
                {showExpanded ? (
                  <>
                    <ChevronUp className="mr-2 h-4 w-4" />
                    Show fewer sources
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-2 h-4 w-4" />
                    Show {expandedSources.length} more sources
                  </>
                )}
              </Button>
            </div>

            {/* Expanded Sources */}
            {showExpanded && (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                {expandedSources.map((source) => renderSourceInput(source))}
              </div>
            )}

            {/* Submit Buttons */}
            <div className="pt-4 space-y-3">
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={createEntryMutation.isPending}
                data-testid="button-calculate-week"
              >
                {createEntryMutation.isPending ? "Calculating..." : "Calculate This Week"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
