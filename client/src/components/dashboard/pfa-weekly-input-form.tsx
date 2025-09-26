import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { useToast } from "../../hooks/use-toast";
import { getPfaWeekStart, getPfaWeekLabel } from "../../lib/pfa-calculations";
import { z } from "zod";
import { PFA_SOURCES } from "../../lib/pfa-sources";
import { useTrackerData } from "../../hooks/useTrackerData";
import { SaveDataPrompt } from "../SaveDataPrompt";

interface PfaWeeklyInputFormProps {
  onSuccess?: (entry: any) => void;
}

// Define the form schema with all PFA sources - only whole numbers
const formSchema = z.object({
  dentalFloss: z.number().int().min(0).default(0),
  toiletPaper: z.number().int().min(0).default(0),
  sweatResistantClothing: z.number().int().min(0).default(0),
  tapWater: z.number().int().min(0).default(0),
  nonStickPans: z.number().int().min(0).default(0),
});

export function PfaWeeklyInputForm({ onSuccess }: PfaWeeklyInputFormProps) {
  const { toast } = useToast();
  const { createEntry, isCreating, isGuest } = useTrackerData('pfa');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dentalFloss: 0,
      toiletPaper: 0,
      sweatResistantClothing: 0,
      tapWater: 0,
      nonStickPans: 0,
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const entryData = {
      weekStart: getPfaWeekStart(new Date()),
      ...data,
    };

    createEntry(entryData, {
      onSuccess: (entry: any) => {
        toast({
          title: "PFA entry created successfully",
          description: `Week of ${getPfaWeekLabel(new Date().toISOString())} recorded`,
        });
        form.reset();
        onSuccess?.(entry);
      },
      onError: (error: Error) => {
        toast({
          title: "Error creating PFA entry",
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
                          value={field.value === 0 ? '' : field.value}
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
                disabled={isCreating}
                data-testid="button-calculate-pfa-week"
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

export default PfaWeeklyInputForm;
