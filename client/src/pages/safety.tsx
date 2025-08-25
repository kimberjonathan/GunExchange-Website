import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Shield } from "lucide-react";

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Link href="/" className="hover:text-forum-accent transition-colors flex items-center" data-testid="link-home-breadcrumb">
            <Home className="w-4 h-4 mr-1" />
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white">Safe Handling</span>
        </nav>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-gray-900 dark:text-white flex items-center justify-center">
              <Shield className="w-8 h-8 mr-3" />
              Safe Handling
            </CardTitle>
            <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
              Firearm safety information and best practices
            </p>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none p-8">
            <div className="text-center py-12">
              <Shield className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Safe Handling</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
                This page is under construction. Here you'll find comprehensive information about safe firearm handling, storage, and best practices for California gun owners.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}