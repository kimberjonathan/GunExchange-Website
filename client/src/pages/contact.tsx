import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Mail } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Link href="/" className="hover:text-forum-accent transition-colors flex items-center" data-testid="link-home-breadcrumb">
            <Home className="w-4 h-4 mr-1" />
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white">Contact Support</span>
        </nav>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-gray-900 dark:text-white flex items-center justify-center">
              <Mail className="w-8 h-8 mr-3" />
              Contact Support
            </CardTitle>
            <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
              Get help and support for CA Gun Exchange
            </p>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none p-8">
            <div className="text-center py-12">
              <Mail className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Contact Support</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
                This page is under construction. Here you'll be able to contact our support team for help with your account, technical issues, or questions about the platform.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}