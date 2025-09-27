import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { useToast } from "../../hooks/use-toast";
import { getWeekStart, getWeekLabel } from "../../lib/calculations";
import { z } from "zod";
import { MICROPLASTIC_SOURCES } from "../../lib/microplastic-sources";
import { useTrackerData } from "../../hooks/useTrackerData";
import { SaveDataPrompt } from "../SaveDataPrompt";

interface WeeklyInputFormProps {}

// Define the form schema with all the new sources - only whole numbers
const formSchema = z.object({
  bottledWater: z.number().int().min(0).default(0),
  seafood: z.number().int().min(0).default(0),
  salt: z.number().min(0).default(0),
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
  const { createEntry, isCreating, isGuest } = useTrackerData('microplastic');

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

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const entryData = {
      weekStart: getWeekStart(new Date()),
      ...data,
    };

    createEntry(entryData, {
      onSuccess: () => {
        toast({
          title: "Entry created successfully",
          description: `Week of ${getWeekLabel(new Date().toISOString())} recorded`,
        });
        form.reset();
      },
      onError: (error: Error) => {
        toast({
          title: "Error creating entry",
          description: error.message || "Unknown error",
          variant: "destructive",
        });
      },
    });
  };

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, field: any) => {
    const value = e.target.value;
    // Allow empty string for clearing, but prevent negative values and decimals
    if (value === '') {
      field.onChange(value); // Allow empty temporarily for better UX
    } else if (value === '0') {
      field.onChange(0);
    } else {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue >= 0) {
        field.onChange(numValue);
      }
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent negative signs, decimal points, and scientific notation
    if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.' || e.key === '+') {
      e.preventDefault();
    }
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>, field: any) => {
    const value = e.target.value;
    if (value === '') {
      field.onChange(0);
    } else {
      const numValue = parseInt(value, 10);
      if (isNaN(numValue) || numValue < 0) {
        field.onChange(0);
      } else {
        field.onChange(numValue);
      }
    }
  }, []);

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
            {/* Scrollable container for all sources - responsive height */}
            <div className="max-h-[50vh] sm:max-h-96 overflow-y-auto scrollbar-thin space-y-4 sm:space-y-4 pr-1 sm:pr-2">
              {MICROPLASTIC_SOURCES.map((source) => (
                <FormField
                  key={source.key}
                  control={form.control}
                  name={source.key as keyof z.infer<typeof formSchema>}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-base sm:text-sm">
                        <span className="text-xl sm:text-lg">{source.icon}</span>
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
                          value={field.value === 0 ? '' : field.value}
                          onChange={(e) => handleInputChange(e, field)}
                          onKeyDown={handleKeyDown}
                          onBlur={(e) => handleBlur(e, field)}
                          className="w-full border-blue-300 focus:border-blue-500 focus:ring-blue-500 h-12 sm:h-10 text-lg sm:text-base px-4"
                          inputMode="numeric"
                          pattern="[0-9]*"
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
                disabled={isCreating}
                data-testid="button-calculate-week"
              >
                {isCreating ? "Calculating..." : "Calculate This Week"}
              </Button>
              
              {/* Save Data Prompt for Guests */}
              {isGuest && <SaveDataPrompt variant="inline" />}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default WeeklyInputForm;