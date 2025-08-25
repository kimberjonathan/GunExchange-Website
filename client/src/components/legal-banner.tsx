import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export function LegalBanner() {
  return (
    <Alert className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30 rounded-none border-l-0 border-r-0 border-t-0">
      <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      <AlertDescription className="font-medium text-orange-800 dark:text-orange-200">
        <strong>⚠️ Notice:</strong> CA Gun Exchange does not sell firearms. All firearm transfers must be completed in person through a licensed California FFL in accordance with federal, state, and local laws.
      </AlertDescription>
    </Alert>
  );
}