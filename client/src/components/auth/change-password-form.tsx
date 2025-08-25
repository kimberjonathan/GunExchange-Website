import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { getPasswordRequirements } from "@shared/password-utils";

const passwordValidation = z.string()
  .min(10, "Password must be at least 10 characters long")
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
    "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)");

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordValidation,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New password and confirmation must match",
  path: ["confirmPassword"],
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export function ChangePasswordForm() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const newPassword = watch("newPassword");

  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordFormData) => {
      const userId = sessionStorage.getItem("userId");
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      return apiRequest("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-ID": userId,
        },
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      setSuccess(data.message);
      reset();
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    },
  });

  const onSubmit = (data: ChangePasswordFormData) => {
    setSuccess(null);
    changePasswordMutation.mutate(data);
  };

  const passwordRequirements = getPasswordRequirements();

  return (
    <Card className="w-full max-w-md mx-auto" data-testid="change-password-card">
      <CardHeader>
        <CardTitle data-testid="change-password-title">Change Password</CardTitle>
      </CardHeader>
      <CardContent>
        {success && (
          <Alert className="mb-4" data-testid="change-password-success">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {changePasswordMutation.error && (
          <Alert variant="destructive" className="mb-4" data-testid="change-password-error">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {(changePasswordMutation.error as Error).message}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword" data-testid="label-current-password">
              Current Password
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                {...register("currentPassword")}
                className={errors.currentPassword ? "border-red-500" : ""}
                data-testid="input-current-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                data-testid="toggle-current-password"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.currentPassword && (
              <p className="text-sm text-red-500" data-testid="error-current-password">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword" data-testid="label-new-password">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                {...register("newPassword")}
                className={errors.newPassword ? "border-red-500" : ""}
                data-testid="input-new-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
                data-testid="toggle-new-password"
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-red-500" data-testid="error-new-password">
                {errors.newPassword.message}
              </p>
            )}
            
            {/* Password Requirements */}
            <div className="mt-2 p-3 bg-muted rounded-md" data-testid="password-requirements">
              <p className="text-sm font-medium mb-2">Password Requirements:</p>
              <ul className="text-xs space-y-1">
                {passwordRequirements.map((req, index) => (
                  <li key={index} className="flex items-center gap-2" data-testid={`requirement-${index}`}>
                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" data-testid="label-confirm-password">
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                className={errors.confirmPassword ? "border-red-500" : ""}
                data-testid="input-confirm-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                data-testid="toggle-confirm-password"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500" data-testid="error-confirm-password">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={changePasswordMutation.isPending}
            data-testid="button-change-password"
          >
            {changePasswordMutation.isPending ? "Changing Password..." : "Change Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}