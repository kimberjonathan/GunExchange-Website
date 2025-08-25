import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface UsernameChangeFormProps {
  currentUsername: string;
  onSuccess: (newUser: any) => void;
}

export default function UsernameChangeForm({ currentUsername, onSuccess }: UsernameChangeFormProps) {
  const [newUsername, setNewUsername] = useState("");
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const changeUsernameMutation = useMutation({
    mutationFn: async (username: string) => {
      return await apiRequest("/api/profile/change-username", {
        method: "PUT",
        body: { newUsername: username }
      });
    },
    onSuccess: (data: any) => {
      toast({ 
        title: "Username Changed Successfully",
        description: "Your username has been updated and you can now continue using the platform."
      });
      onSuccess(data);
      navigate("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Error Changing Username",
        description: error.message || "Failed to change username. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) {
      toast({
        title: "Username Required",
        description: "Please enter a new username.",
        variant: "destructive",
      });
      return;
    }
    changeUsernameMutation.mutate(newUsername.trim());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-orange-500/10 rounded-full">
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Username Change Required</CardTitle>
          <CardDescription>
            Your current username has been flagged and must be changed before you can continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center space-x-2 text-orange-800 dark:text-orange-200">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">Current Username: {currentUsername}</span>
              </div>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-2">
                Your username has been flagged by an administrator and must be changed to continue using CA Gun Exchange.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newUsername">New Username</Label>
                <Input
                  id="newUsername"
                  type="text"
                  placeholder="Enter your new username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  required
                  data-testid="input-new-username"
                />
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={changeUsernameMutation.isPending}
                data-testid="button-change-username"
              >
                {changeUsernameMutation.isPending ? "Changing Username..." : "Change Username"}
              </Button>
            </form>
            
            <div className="text-center text-sm text-muted-foreground">
              <p>You must change your username to continue using the platform.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}