import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { loginSchema, type LoginData } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import { ForcedPasswordChange } from "@/components/auth/forced-password-change";
import UsernameChangeForm from "./username-change-form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useActivityTracker } from "@/lib/activity-tracker";
import { UsernameStorage } from "@/lib/username-storage";
import { queryClient } from "@/lib/queryClient";

interface LoginFormProps {
  onSuccess: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const { toast } = useToast();
  const { startTrackingUser } = useActivityTracker();
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [userRequiringReset, setUserRequiringReset] = useState<any>(null);
  const [showUsernameChange, setShowUsernameChange] = useState(false);
  const [userRequiringUsernameChange, setUserRequiringUsernameChange] = useState<any>(null);


  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: UsernameStorage.getMostRecentUsername(),
      password: "",
      rememberUsername: true,
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const response = await apiRequest("/api/auth/login", { method: "POST", body: credentials });
      return response;
    },
    onSuccess: (user) => {
      const formData = form.getValues();
      
      // Save username if remember username is checked
      if (formData.rememberUsername && formData.username) {
        UsernameStorage.saveUsername(formData.username);
      }
      
      // Check if user needs password reset
      if (user.requirePasswordReset) {
        setUserRequiringReset(user);
        setShowPasswordReset(true);
        toast({
          title: "Password Update Required",
          description: user.message || "Your password must be updated to meet new security requirements.",
          variant: "destructive",
        });
        return;
      }

      // Check if user needs username change
      if (user.requireUsernameChange) {
        setUserRequiringUsernameChange(user);
        setShowUsernameChange(true);
        toast({
          title: "Username Change Required",
          description: user.message || "Your username has been flagged and must be changed.",
          variant: "destructive",
        });
        return;
      }
      
      // Force immediate refetch of auth data after successful login
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
      
      // Start activity tracking for all sessions
      startTrackingUser();
      
      toast({
        title: "Login successful!",
        description: "Welcome back to CA Gun Exchange!",
      });
      onSuccess();
    },
    onError: (error: any) => {
      setError(error.message || "Login failed");
    },
  });

  const handlePasswordChanged = () => {
    setShowPasswordReset(false);
    setUserRequiringReset(null);
    
    // Login was successful, complete the authentication process
    if (userRequiringReset) {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
      startTrackingUser();
      
      toast({
        title: "Login successful!",
        description: "Welcome back to CA Gun Exchange!",
      });
      onSuccess();
    }
  };

  const handleUsernameChanged = (updatedUser: any) => {
    setShowUsernameChange(false);
    setUserRequiringUsernameChange(null);
    
    // Username change was successful, complete the authentication process
    setUser(updatedUser);
    startTrackingUser();
    
    toast({
      title: "Login successful!",
      description: "Welcome back to CA Gun Exchange!",
    });
    onSuccess();
  };

  const onSubmit = (data: LoginData) => {
    setError("");
    loginMutation.mutate(data);
  };

  if (showPasswordReset && userRequiringReset) {
    return <ForcedPasswordChange user={userRequiringReset} onPasswordChanged={handlePasswordChanged} />;
  }

  // Show username change form if user requires username change
  if (showUsernameChange && userRequiringUsernameChange) {
    return (
      <UsernameChangeForm
        currentUsername={userRequiringUsernameChange.username}
        onSuccess={handleUsernameChanged}
      />
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Welcome back to CA Gun Exchange
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              {...form.register("username")}
              data-testid="input-login-username"
            />
            {form.formState.errors.username && (
              <p className="text-sm text-destructive">
                {form.formState.errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...form.register("password")}
                className="pr-9"
                data-testid="input-login-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-7 w-7 p-0"
                onClick={() => setShowPassword(!showPassword)}
                data-testid="button-toggle-login-password"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="rememberUsername" 
              {...form.register("rememberUsername")}
              data-testid="checkbox-remember-username"
            />
            <Label 
              htmlFor="rememberUsername" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Remember my username
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full bg-forum-accent hover:bg-forum-accent/90"
            disabled={loginMutation.isPending}
            data-testid="button-login-submit"
          >
            {loginMutation.isPending ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
