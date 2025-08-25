import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");

  const handleAuthSuccess = () => {
    // Redirect handled by auth forms
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" data-testid="tab-login">Sign In</TabsTrigger>
              <TabsTrigger value="register" data-testid="tab-register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <LoginForm onSuccess={handleAuthSuccess} />
            </TabsContent>
            
            <TabsContent value="register">
              <RegisterForm onSuccess={handleAuthSuccess} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
}
