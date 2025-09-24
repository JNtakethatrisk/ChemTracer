import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { User, Save, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { insertUserProfileSchema, type UserProfile } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

type UserProfileForm = {
  age: number;
  gender: string;
  location: string;
};

export default function UserProfile() {
  const [showProfileForm, setShowProfileForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery<UserProfile | null>({
    queryKey: ["/api/user-profile"],
  });

  const { data: percentileData } = useQuery<{
    message: string;
    percentile: number;
    totalCount: number;
  }>({
    queryKey: ["/api/percentile-comparison", profile?.age],
    enabled: !!profile?.age,
  });

  const form = useForm({
    resolver: zodResolver(insertUserProfileSchema),
    defaultValues: {
      age: profile?.age || 0,
      gender: profile?.gender || "",
      location: profile?.location || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UserProfileForm) => {
      return apiRequest("POST", "/api/user-profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/percentile-comparison"] });
      setShowProfileForm(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UserProfileForm) => {
    updateProfileMutation.mutate(data);
  };


  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Profile
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowProfileForm(!showProfileForm)}
          >
            {showProfileForm ? "Cancel" : "Edit Profile"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!profile ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No profile information available</p>
            <Button onClick={() => setShowProfileForm(true)}>
              Create Profile
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Age</Label>
                <p className="text-lg font-semibold">{profile.age || "Not set"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Gender</Label>
                <p className="text-lg font-semibold">{profile.gender || "Not set"}</p>
              </div>
            </div>
            
            {profile.location && (
              <div>
                <Label className="text-sm font-medium text-gray-700">Location</Label>
                <p className="text-lg font-semibold">{profile.location}</p>
              </div>
            )}

            {percentileData && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center mb-2">
                  <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Your Comparison</h3>
                </div>
                <p className="text-blue-800 mb-2">
                  {percentileData.message}
                </p>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-blue-700">
                    {percentileData.percentile}th percentile
                  </Badge>
                  <span className="text-sm text-blue-600">
                    {percentileData.totalCount} users in comparison
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {showProfileForm && (
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  min="1"
                  max="120"
                  {...form.register("age", { valueAsNumber: true })}
                />
                {form.formState.errors.age && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.age.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={form.watch("gender")}
                  onValueChange={(value) => form.setValue("gender", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                placeholder="e.g., California, USA"
                {...form.register("location")}
              />
            </div>

            <div className="flex space-x-2">
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="flex items-center"
              >
                <Save className="mr-2 h-4 w-4" />
                {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowProfileForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
