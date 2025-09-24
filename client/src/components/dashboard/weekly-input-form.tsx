import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { insertMicroplasticEntrySchema, type InsertMicroplasticEntry, type MicroplasticEntry } from "@shared/schema";
import { getWeekStart, getWeekLabel } from "@/lib/calculations";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { MICROPLASTIC_SOURCES, calculateTotalParticles } from "@/lib/microplastic-sources";

interface WeeklyInputFormProps {}

// Define the form schema with all the new sources - only whole numbers
const formSchema = z.object({
  bottledWater: z.number().int().min(0).default(0),
  seafood: z.number().int().min(0).default(0),
  salt: z.number().int().min(0).default(0),
  plasticPackaged: z.number().int().min(0).default(0),
  teaBags: z.number().int().min(0).default(0),
  householdDust: z.number().int().min(0).default(0),
  syntheticClothing: z.number().int().min(0).default(0),
  cannedFood: z.number().int().min(0).default(0),
  plasticKitchenware: z.number().int().min(0).default(0),
  coffeeCups: z.number().int().min(0).default(0),
  takeoutContainers: z.number().int().min(0).default(0),
});

export function WeeklyInputForm({}: WeeklyInputFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bottledWater: 0,
      seafood: 0,
      salt: 0,
      plasticPackaged: 0,
      teaBags: 0,
      householdDust: 0,
      syntheticClothing: 0,
      cannedFood: 0,
      plasticKitchenware: 0,
      coffeeCups: 0,
      takeoutContainers: 0,
    },
  });

  const createEntryMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      // Calculate total particles
      const totalParticles = calculateTotalParticles(data, MICROPLASTIC_SOURCES);
      
      // Create entry data with all fields
      const entryData: InsertMicroplasticEntry = {
        weekStart: getWeekStart(new Date()),
        bottledWater: data.bottledWater || 0,
        seafood: data.seafood || 0,
        salt: data.salt || 0,
        plasticPackaged: data.plasticPackaged || 0,
        teaBags: data.teaBags || 0,
        householdDust: data.householdDust || 0,
        syntheticClothing: data.syntheticClothing || 0,
        cannedFood: data.cannedFood || 0,
        plasticKitchenware: data.plasticKitchenware || 0,
        coffeeCups: data.coffeeCups || 0,
        takeoutContainers: data.takeoutContainers || 0,
      };

      const response = await apiRequest("POST", "/api/microplastic-entries", entryData);
      const result = await response.json();
      return result as MicroplasticEntry;
    },
    onSuccess: (data) => {
      toast({
        title: "Entry created successfully",
        description: `Week of ${getWeekLabel(new Date().toISOString())} recorded`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/microplastic-entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard-stats"] });
    },
    onError: (error) => {
      toast({
        title: "Error creating entry",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createEntryMutation.mutate(data);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
    const value = e.target.value;
    // Allow empty string for clearing, but prevent negative values and decimals
    if (value === '' || value === '0') {
      field.onChange(0);
    } else {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue >= 0 && Number.isInteger(numValue)) {
        field.onChange(numValue);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent negative signs, decimal points, and scientific notation
    if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.' || e.key === '+') {
      e.preventDefault();
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>, field: any) => {
    const value = e.target.value;
    const numValue = parseInt(value, 10);
    if (value === '' || isNaN(numValue) || numValue < 0 || !Number.isInteger(numValue)) {
      field.onChange(0);
      e.target.value = "0";
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-blue-800">Weekly Microplastic Input</CardTitle>
        <p className="text-sm text-blue-600">
          Enter your weekly consumption for each source. Only whole numbers allowed (no decimals).
        </p>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Scrollable container for all sources */}
            <div className="max-h-96 overflow-y-auto scrollbar-thin space-y-4 pr-2">
              {MICROPLASTIC_SOURCES.map((source) => (
                <FormField
                  key={source.key}
                  control={form.control}
                  name={source.key as keyof z.infer<typeof formSchema>}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <span className="text-lg">{source.icon}</span>
                        <span className="font-medium text-blue-800">{source.label}</span>
                        <span className="text-sm text-blue-600">({source.unit})</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          step="1"
                          placeholder="0"
                          value={field.value || ''}
                          onChange={(e) => handleInputChange(e, field)}
                          onKeyDown={handleKeyDown}
                          onBlur={(e) => handleBlur(e, field)}
                          className="w-full border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            {/* Submit Button */}
            <div className="pt-4 space-y-3">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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

export default WeeklyInputForm;