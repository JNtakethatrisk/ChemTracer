// import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { useToast } from "../../hooks/use-toast";
import { type InsertPfaEntry, type PfaEntry } from "../../../../shared/schema";
import { getPfaWeekStart, getPfaWeekLabel } from "../../lib/pfa-calculations";
import { apiRequest } from "../../lib/queryClient";
import { z } from "zod";
import { PFA_SOURCES } from "../../lib/pfa-sources";

interface PfaWeeklyInputFormProps {
  onSuccess?: (entry: PfaEntry) => void;
}

// Define the form schema with all PFA sources - only whole numbers
const formSchema = z.object({
  dentalFloss: z.number().int().min(0).default(0),
  toiletPaper: z.number().int().min(0).default(0),
  yogaPants: z.number().int().min(0).default(0),
  sportsBras: z.number().int().min(0).default(0),
  tapWater: z.number().int().min(0).default(0),
  nonStickPans: z.number().int().min(0).default(0),
});

export function PfaWeeklyInputForm({ onSuccess }: PfaWeeklyInputFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dentalFloss: 0,
      toiletPaper: 0,
      yogaPants: 0,
      sportsBras: 0,
      tapWater: 0,
      nonStickPans: 0,
    },
  });

  const createEntryMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      // Calculate total PFAs
      // const totalPfas = calculateTotalPfas(data);
      
      // Create entry data with all fields
      const entryData: InsertPfaEntry = {
        weekStart: getPfaWeekStart(new Date()),
        dentalFloss: data.dentalFloss || 0,
        toiletPaper: data.toiletPaper || 0,
        yogaPants: data.yogaPants || 0,
        sportsBras: data.sportsBras || 0,
        tapWater: data.tapWater || 0,
        nonStickPans: data.nonStickPans || 0,
      };

      const response = await apiRequest("POST", "/api/pfa-entries", entryData);
      const result = await response.json();
      return result as PfaEntry;
    },
    onSuccess: (data) => {
      toast({
        title: "PFA entry created successfully",
        description: `Week of ${getPfaWeekLabel(new Date().toISOString())} recorded`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/pfa-entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pfa-dashboard-stats"] });
      onSuccess?.(data);
    },
    onError: (error) => {
      toast({
        title: "Error creating PFA entry",
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
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-green-800">Weekly PFA Input</CardTitle>
        <p className="text-sm text-green-600">
          Enter your weekly PFA exposure for each source. Only whole numbers allowed (no decimals).
        </p>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Scrollable container for all sources */}
            <div className="max-h-96 overflow-y-auto scrollbar-thin space-y-4 pr-2">
              {PFA_SOURCES.map((source) => (
                <FormField
                  key={source.key}
                  control={form.control}
                  name={source.key as keyof z.infer<typeof formSchema>}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <span className="text-lg">{source.icon}</span>
                        <span className="font-medium text-green-800">{source.label}</span>
                        <span className="text-sm text-green-600">({source.unit})</span>
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
                          className="w-full border-green-300 focus:border-green-500 focus:ring-green-500"
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
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={createEntryMutation.isPending}
                data-testid="button-calculate-pfa-week"
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

export default PfaWeeklyInputForm;
