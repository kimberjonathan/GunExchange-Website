import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Shield, Lock, Eye, EyeOff, ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { AdminSession } from "@/lib/session";
import { useActivityTracker } from "@/lib/activity-tracker";
import { UsernameStorage } from "@/lib/username-storage";

export default function AdminLogin() {
  const [username, setUsername] = useState(UsernameStorage.getSavedAdminUsername());
  const [password, setPassword] = useState("");
  const [rememberUsername, setRememberUsername] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const { startTrackingAdmin } = useActivityTracker();
  const [, navigate] = useLocation();

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      return await apiRequest("/api/admin/login", {
        method: "POST",
        body: credentials,
      });
    },
    onSuccess: (data: any) => {
      // Save admin username if remember username is checked
      if (rememberUsername && username) {
        UsernameStorage.saveAdminUsername(username);
      }
      
      AdminSession.setUser(data.user);
      
      // Start activity tracking for all sessions
      startTrackingAdmin();
      
      toast({ 
        title: "Admin Login Successful",
        description: "Welcome to the admin dashboard!"
      });
      navigate("/admin");
    },
    onError: () => {
      toast({
        title: "Login Failed",
        description: "Invalid admin credentials",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      loginMutation.mutate({ username, password });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
          <CardDescription>
            Secure access for CA Gun Exchange administrators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Admin Username</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter admin username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`pl-9 ${UsernameStorage.getSavedAdminUsername() ? "pr-10" : ""}`}
                  required
                  data-testid="input-admin-username"
                />
                {UsernameStorage.getSavedAdminUsername() && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-7 w-7 p-0"
                    onClick={() => {
                      setUsername(UsernameStorage.getSavedAdminUsername());
                    }}
                    data-testid="button-admin-username-fill"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Admin Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9"
                  required
                  data-testid="input-admin-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-7 w-7 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="button-toggle-password"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="rememberAdminUsername" 
                checked={rememberUsername}
                onCheckedChange={(checked) => setRememberUsername(!!checked)}
                data-testid="checkbox-remember-admin-username"
              />
              <Label 
                htmlFor="rememberAdminUsername" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember my username
              </Label>
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
              data-testid="button-admin-login"
            >
              {loginMutation.isPending ? "Signing In..." : "Sign In to Admin Portal"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              This portal is restricted to authorized administrators only.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}