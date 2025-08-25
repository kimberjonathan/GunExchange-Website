import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-forum-primary dark:bg-gray-800 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold mb-4">CA Gun Exchange</h3>
            <p className="text-gray-300 mb-4">
              California's premier firearms community forum. Connecting responsible gun owners across the state while ensuring full compliance with all applicable laws.
            </p>

          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300">
              <li><Link href="/terms" className="hover:text-white transition-colors" data-testid="link-terms">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors" data-testid="link-privacy">Privacy Policy</Link></li>
              <li><Link href="/guidelines" className="hover:text-white transition-colors" data-testid="link-guidelines">Community Guidelines</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors" data-testid="link-contact">Contact Support</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal Resources</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="https://oag.ca.gov/firearms" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" data-testid="link-ca-doj">CA DOJ Firearms</a></li>
              <li><a href="https://www.atf.gov" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" data-testid="link-atf">ATF Guidelines</a></li>
              <li><a href="https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=30515&lawCode=PEN" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" data-testid="link-penal-code">Penal Code 30515</a></li>
              <li><Link href="/safety" className="hover:text-white transition-colors" data-testid="link-safety">Safe Handling</Link></li>
              <li><Link href="/report" className="hover:text-white transition-colors" data-testid="link-report">Report Issues</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-600 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 CA Gun Exchange. All rights reserved. | Age verification required (18+) | Licensed dealer transfers mandatory</p>
        </div>
      </div>
    </footer>
  );
}
