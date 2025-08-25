import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

interface RegisterFormProps {
  onSuccess: () => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { toast } = useToast();
  const { setUser } = useAuth();
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: InsertUser) => {
      const response = await apiRequest("/api/auth/register", { method: "POST", body: userData });
      return response;
    },
    onSuccess: (user) => {
      setUser(user);
      toast({
        title: "Registration successful!",
        description: "Welcome to CA Gun Exchange.",
      });
      onSuccess();
    },
    onError: (error: any) => {
      setError(error.message || "Registration failed");
    },
  });

  const onSubmit = (data: InsertUser) => {
    setError("");
    registerMutation.mutate(data);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>
          Join the CA Gun Exchange community. You must be 18 or older to register.
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
              data-testid="input-username"
            />
            {form.formState.errors.username && (
              <p className="text-sm text-destructive">
                {form.formState.errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              data-testid="input-email"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                {...form.register("firstName")}
                data-testid="input-first-name"
              />
              {form.formState.errors.firstName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                {...form.register("lastName")}
                data-testid="input-last-name"
              />
              {form.formState.errors.lastName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...form.register("password")}
                className="pr-9"
                data-testid="input-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-7 w-7 p-0"
                onClick={() => setShowPassword(!showPassword)}
                data-testid="button-toggle-register-password"
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

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              {...form.register("dateOfBirth")}
              data-testid="input-date-of-birth"
            />
            {form.formState.errors.dateOfBirth && (
              <p className="text-sm text-destructive">
                {form.formState.errors.dateOfBirth.message}
              </p>
            )}
            <p className="text-xs text-gray-500">
              You must be 18 or older to register
            </p>
          </div>

          <div className="bg-forum-warning/10 border border-forum-warning/20 rounded-lg p-3">
            <p className="text-xs text-forum-warning font-medium">
              By registering, you acknowledge that you are 18 years or older and agree to comply with all federal, state, and local laws regarding firearm transactions.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-forum-accent hover:bg-forum-accent/90"
            disabled={registerMutation.isPending}
            data-testid="button-register-submit"
          >
            {registerMutation.isPending ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
