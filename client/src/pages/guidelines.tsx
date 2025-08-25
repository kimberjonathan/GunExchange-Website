import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Users } from "lucide-react";

export default function GuidelinesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Link href="/" className="hover:text-forum-accent transition-colors flex items-center" data-testid="link-home-breadcrumb">
            <Home className="w-4 h-4 mr-1" />
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white">Community Guidelines</span>
        </nav>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-gray-900 dark:text-white flex items-center justify-center">
              <Users className="w-8 h-8 mr-3" />
              Community Guidelines
            </CardTitle>
            <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
              Building a safe and respectful community
            </p>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none p-8">
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Welcome to CA Gun Exchange! To maintain a safe, legal, and respectful community, all users must follow these guidelines when posting or interacting on the Website. Violations may result in content removal, account suspension, or permanent bans.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">1. Legal Compliance</h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>All firearm, ammunition, and accessory transactions must be conducted through a licensed California FFL in accordance with federal, state, and local laws.</p>
              <p>Users are responsible for ensuring all listings, purchases, and transfers comply with California firearm laws, including background checks, waiting periods, and restrictions on prohibited items.</p>
              <p>Posting content that encourages illegal activity, straw purchases, or sales to prohibited persons is strictly forbidden.</p>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">2. Listing Guidelines</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">When posting items for sale or trade:</p>
            <ul className="list-disc ml-8 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Include accurate descriptions, pricing, and condition of items.</li>
              <li>Only post items you legally own and are allowed to sell in California.</li>
              <li>Do not include personal contact info outside the platform unless you are comfortable sharing it publicly.</li>
              <li>Do not post duplicate listings or spam the forums.</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">3. Safety and Verification</h2>
            <ul className="list-disc ml-8 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Meet all buyers/sellers at a licensed FFL or follow FFL-required transfer procedures.</li>
              <li>Never attempt to complete a firearm transaction outside the legal framework.</li>
              <li>Report suspicious activity, scams, or illegal posts to the site administrators immediately.</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">4. Respectful Behavior</h2>
            <ul className="list-disc ml-8 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Treat all members with respect. Harassment, threats, hate speech, or discriminatory language will not be tolerated.</li>
              <li>Disagreements should be handled politely. Avoid personal attacks.</li>
              <li>Spam, trolling, or disruptive behavior is prohibited.</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">5. Prohibited Content</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">Do not post:</p>
            <ul className="list-disc ml-8 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Illegal firearms, ammunition, explosives, or restricted items.</li>
              <li>False, misleading, or fraudulent listings.</li>
              <li>Personal attacks, bullying, or harassment.</li>
              <li>Copyrighted material without permission.</li>
              <li>Offensive, inappropriate, or explicit profile pictures or images.</li>
              <li>Content that violates community standards or promotes illegal activity.</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">6. Reporting Violations</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">If you see content that violates these guidelines:</p>
            <ul className="list-disc ml-8 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Use the "Report" function on the Website.</li>
              <li>Provide clear details and links to the offending content.</li>
              <li>Administrators will review and take appropriate action.</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">7. Enforcement</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">CA Gun Exchange reserves the right to:</p>
            <ul className="list-disc ml-8 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Remove any content that violates these guidelines.</li>
              <li>Suspend or permanently ban accounts that fail to comply.</li>
              <li>Cooperate with law enforcement as required by law.</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">8. Updates</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Community Guidelines may be updated periodically. Users are responsible for reviewing updates to stay informed.
            </p>

            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-blue-800 dark:text-blue-300 font-medium">
                By participating on CA Gun Exchange, you agree to follow these guidelines and help maintain a safe, legal, and respectful community.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}