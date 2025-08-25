import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Home } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Link href="/" className="hover:text-forum-accent transition-colors flex items-center" data-testid="link-home-breadcrumb">
            <Home className="w-4 h-4 mr-1" />
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white">Terms of Service</span>
        </nav>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-gray-900 dark:text-white">
              Terms and Conditions
            </CardTitle>
            <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
              Effective Date: January 1, 2025
            </p>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none p-8">
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Welcome to CA Gun Exchange (the "Website"), accessible at cagunexchange.com. By accessing or using this Website, you agree to comply with and be bound by the following Terms and Conditions. If you do not agree, you may not use this Website.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">1. Purpose of Website</h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>CA Gun Exchange is an online listing and discussion forum where users may post advertisements for firearms, ammunition, and related accessories.</p>
              <p><strong>CA Gun Exchange is not a firearms dealer and does not sell, broker, or facilitate transactions.</strong></p>
              <p>All actual firearm sales and transfers must be completed through a licensed Federal Firearms Licensee (FFL) in California and must comply with all applicable federal, state, and local laws.</p>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">2. User Responsibilities</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">By using CA Gun Exchange, you agree that:</p>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p><strong>1.</strong> You are at least 18 years old (or 21 years old if required for the firearm or item).</p>
              <p><strong>2.</strong> You will comply with all federal, state, and local firearm laws, including but not limited to:</p>
              <ul className="list-disc ml-8 space-y-2">
                <li>Completing all firearm transfers through a licensed California FFL.</li>
                <li>Complying with the 10-day waiting period and required background checks.</li>
                <li>Following all restrictions on "assault weapons," ammunition, and magazine capacities under California law.</li>
              </ul>
              <p><strong>3.</strong> You are solely responsible for ensuring that any listing, purchase, or transfer is legal in your jurisdiction.</p>
              <p><strong>4.</strong> You will not use CA Gun Exchange for unlawful purposes, including but not limited to:</p>
              <ul className="list-disc ml-8 space-y-2">
                <li>Attempting to buy, sell, or trade firearms without an FFL.</li>
                <li>Engaging in straw purchases or selling to prohibited persons.</li>
                <li>Posting fraudulent, misleading, or illegal content.</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">3. Prohibited Content</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">Users may not post content that:</p>
            <ul className="list-disc ml-8 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Promotes or facilitates illegal activity.</li>
              <li>Contains threats, harassment, or discriminatory language.</li>
              <li>Involves explosives, restricted devices, or items illegal under California law.</li>
              <li>Infringes on intellectual property rights.</li>
              <li>Includes offensive, inappropriate, explicit, or sexually suggestive profile pictures or images.</li>
              <li>Contains images that violate community standards or depict illegal activities.</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">4. Disclaimer of Liability</h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>CA Gun Exchange and its owners do not verify user listings, identities, criminal histories, or legal eligibility to own firearms.</p>
              <p>The Website and its owners are not responsible for the accuracy, legality, or safety of listings.</p>
              <p><strong>All use of CA Gun Exchange is at your own risk. The Website and its owners assume no liability for any damages, losses, injuries, or legal consequences arising from use of the Website.</strong></p>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">5. Moderation and Termination</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">CA Gun Exchange reserves the right to:</p>
            <ul className="list-disc ml-8 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Edit or remove any content at any time.</li>
              <li>Suspend or terminate accounts for violations of these Terms.</li>
              <li>Cooperate with law enforcement as required by law.</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">6. Privacy</h2>
            <p className="text-gray-700 dark:text-gray-300">
              CA Gun Exchange may collect limited user data necessary for account functionality. Information will not be sold to third parties but may be shared if legally required.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">7. Governing Law</h2>
            <p className="text-gray-700 dark:text-gray-300">
              These Terms are governed by the laws of the State of California and applicable federal law.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">8. Updates to Terms</h2>
            <p className="text-gray-700 dark:text-gray-300">
              CA Gun Exchange may update these Terms and Conditions at any time. Continued use of the Website constitutes acceptance of the updated Terms.
            </p>

            <div className="mt-12 p-6 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p className="text-center font-medium text-gray-900 dark:text-white">
                By using CA Gun Exchange, you acknowledge that you have read, understood, and agree to these Terms and Conditions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}