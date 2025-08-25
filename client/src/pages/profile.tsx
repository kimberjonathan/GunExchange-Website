import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Settings, Shield, Bell, Mail, Eye, EyeOff, MapPin, Lock, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { updateUserProfileSchema, updateUserPreferencesSchema } from "@shared/schema";
import type { User as UserType, UserPreferences, UpdateUserProfile, UpdateUserPreferences } from "@shared/schema";
import { ProfilePictureUploader } from "@/components/ProfilePictureUploader";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { useTheme } from "@/components/theme/theme-provider";
import { useAuth } from "@/lib/auth";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const { toast } = useToast();
  const { setTheme } = useTheme();
  const { user: currentUser } = useAuth();

  const { data: user, isLoading: userLoading } = useQuery<UserType>({
    queryKey: ["/api/user/profile"],
    enabled: !!currentUser?.id,
  });

  const { data: preferences, isLoading: preferencesLoading } = useQuery<UserPreferences>({
    queryKey: ["/api/user/preferences"],
    enabled: !!currentUser?.id,
  });

  const profileForm = useForm<UpdateUserProfile>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      location: user?.location || "",
      bio: user?.bio || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const preferencesForm = useForm<UpdateUserPreferences>({
    resolver: zodResolver(updateUserPreferencesSchema),
    defaultValues: {
      emailNotifications: preferences?.emailNotifications || true,
      messageNotifications: preferences?.messageNotifications || true,
      marketingEmails: preferences?.marketingEmails || false,
      profileVisibility: preferences?.profileVisibility || "public",
      showEmail: preferences?.showEmail || false,
      showLocation: preferences?.showLocation || true,
      theme: preferences?.theme || "system",
    },
  });

  // Update form defaults when data loads
  React.useEffect(() => {
    if (user) {
      profileForm.reset({
        username: user.username || "",
        email: user.email || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        location: user.location || "",
        bio: user.bio || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [user, profileForm]);

  React.useEffect(() => {
    if (preferences) {
      preferencesForm.reset({
        emailNotifications: preferences.emailNotifications ?? true,
        messageNotifications: preferences.messageNotifications ?? true,
        marketingEmails: preferences.marketingEmails ?? false,
        profileVisibility: preferences.profileVisibility ?? "public",
        showEmail: preferences.showEmail ?? false,
        showLocation: preferences.showLocation ?? true,
        theme: preferences.theme ?? "system",
      });
    }
  }, [preferences, preferencesForm]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateUserProfile) => {
      console.log("Mutation starting with data:", data);
      console.log("Current user for API call:", currentUser);
      try {
        const result = await apiRequest("/api/user/profile", {
          method: "PUT",
          body: data
        });
        console.log("API call successful:", result);
        return result;
      } catch (error) {
        console.error("API call failed:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Profile update successful:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      // Clear password fields
      profileForm.setValue("currentPassword", "");
      profileForm.setValue("newPassword", "");
      profileForm.setValue("confirmPassword", "");
    },
    onError: (error: Error) => {
      console.error("Profile update error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: UpdateUserPreferences) => {
      return await apiRequest("/api/user/preferences", {
        method: "PUT",
        body: data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/preferences"] });
      toast({
        title: "Preferences updated",
        description: "Your preferences have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const onProfileSubmit = (data: UpdateUserProfile) => {
    console.log("=== PROFILE FORM SUBMISSION DEBUG ===");
    console.log("Profile form submitted with data:", data);
    console.log("Form errors:", profileForm.formState.errors);
    console.log("Form is valid:", profileForm.formState.isValid);
    console.log("Current user:", currentUser);
    
    // Debug authentication state
    const authState = JSON.parse(localStorage.getItem('auth-storage') || '{}');
    console.log("Auth state from localStorage:", authState);
    console.log("Current user from auth state:", authState?.state?.user);
    console.log("User ID being sent in header:", authState?.state?.user?.id);
    console.log("=== CALLING MUTATION ===");
    
    updateProfileMutation.mutate(data);
  };

  const onPreferencesSubmit = (data: UpdateUserPreferences) => {
    // Apply theme change immediately
    if (data.theme) {
      setTheme(data.theme as any);
    }
    updatePreferencesMutation.mutate(data);
  };

  if (userLoading || preferencesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <User className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Link href="/" className="hover:text-forum-accent transition-colors flex items-center" data-testid="link-home-breadcrumb">
          <Home className="w-4 h-4 mr-1" />
          Home
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white">Profile</span>
      </nav>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Account Settings</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" data-testid="profile-tab">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="preferences" data-testid="preferences-tab">
            <Settings className="h-4 w-4 mr-2" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="security" data-testid="security-tab">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                  {/* Profile Picture Section */}
                  <div className="flex justify-center">
                    <ProfilePictureUploader
                      currentProfilePicture={user?.profilePicture || undefined}
                      userInitials={`${user?.firstName?.[0] || user?.username?.[0] || 'U'}${user?.lastName?.[0] || ''}`}
                      userId={currentUser?.id || ""}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-username" disabled />
                          </FormControl>
                          <FormDescription className="text-xs text-muted-foreground">
                            Username cannot be changed. Contact an administrator if needed.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" data-testid="input-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} data-testid="input-first-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} data-testid="input-last-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={profileForm.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="City, State" data-testid="input-location" />
                        </FormControl>
                        <FormDescription>
                          Your general location (city, state) for local buyers/sellers
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value || ""} rows={3} data-testid="input-bio" />
                        </FormControl>
                        <FormDescription>
                          Tell others about yourself and your interests
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    data-testid="save-profile-btn"
                    disabled={updateProfileMutation.isPending}
                    onClick={() => console.log("=== SAVE PROFILE BUTTON CLICKED ===", profileForm.formState.errors)}
                  >
                    {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Communication & Privacy Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...preferencesForm}>
                <form onSubmit={preferencesForm.handleSubmit(onPreferencesSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Notifications
                    </h3>
                    
                    <FormField
                      control={preferencesForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Email Notifications</FormLabel>
                            <FormDescription>
                              Receive email notifications for messages and important updates
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value ?? true}
                              onCheckedChange={field.onChange}
                              data-testid="toggle-email-notifications"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={preferencesForm.control}
                      name="messageNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Message Notifications</FormLabel>
                            <FormDescription>
                              Get notified when you receive new messages
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value ?? true}
                              onCheckedChange={field.onChange}
                              data-testid="toggle-message-notifications"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={preferencesForm.control}
                      name="marketingEmails"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Marketing Emails</FormLabel>
                            <FormDescription>
                              Receive emails about new features and community updates
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value ?? false}
                              onCheckedChange={field.onChange}
                              data-testid="toggle-marketing-emails"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Privacy
                    </h3>

                    <FormField
                      control={preferencesForm.control}
                      name="profileVisibility"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profile Visibility</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? "public"}>
                            <FormControl>
                              <SelectTrigger data-testid="select-profile-visibility">
                                <SelectValue placeholder="Select visibility" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="public">Public - Anyone can view</SelectItem>
                              <SelectItem value="registered">Registered Users Only</SelectItem>
                              <SelectItem value="private">Private - Hidden from others</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Control who can view your profile information
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={preferencesForm.control}
                      name="showEmail"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              Show Email Address
                            </FormLabel>
                            <FormDescription>
                              Display your email address on your profile
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value ?? false}
                              onCheckedChange={field.onChange}
                              data-testid="toggle-show-email"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={preferencesForm.control}
                      name="showLocation"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              Show Location
                            </FormLabel>
                            <FormDescription>
                              Display your location on your profile
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value ?? true}
                              onCheckedChange={field.onChange}
                              data-testid="toggle-show-location"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Appearance
                    </h3>

                    <FormField
                      control={preferencesForm.control}
                      name="theme"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Theme Preference</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? "system"}>
                            <FormControl>
                              <SelectTrigger data-testid="select-theme">
                                <SelectValue placeholder="Select theme" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="light">Light</SelectItem>
                              <SelectItem value="dark">Dark</SelectItem>
                              <SelectItem value="system">System (Auto)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose your preferred color theme. System will automatically match your device settings.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    data-testid="save-preferences-btn"
                    disabled={updatePreferencesMutation.isPending}
                  >
                    {updatePreferencesMutation.isPending ? "Saving..." : "Save Preferences"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <div className="flex justify-center">
            <ChangePasswordForm />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}