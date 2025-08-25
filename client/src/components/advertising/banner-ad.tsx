import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, X } from "lucide-react";
import { useState } from "react";

interface BannerAdProps {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  targetUrl: string;
  sponsor: string;
  position: "header" | "sidebar" | "footer" | "in-feed";
  size?: "small" | "medium" | "large";
  dismissible?: boolean;
}

export default function BannerAd({ 
  id, 
  title, 
  description, 
  imageUrl, 
  targetUrl, 
  sponsor, 
  position,
  size = "medium",
  dismissible = false 
}: BannerAdProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const handleAdClick = () => {
    // Track ad click analytics here
    console.log(`Ad clicked: ${id} - ${title}`);
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const getSizeClasses = () => {
    switch (size) {
      case "small": return "h-20";
      case "large": return "h-40 md:h-32";
      default: return "h-28";
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case "header": return "mb-4";
      case "footer": return "mt-4";
      case "sidebar": return "mb-4";
      case "in-feed": return "my-4";
      default: return "";
    }
  };

  return (
    <Card 
      className={`bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 cursor-pointer hover:shadow-md transition-shadow ${getSizeClasses()} ${getPositionClasses()}`}
      onClick={handleAdClick}
      data-testid={`banner-ad-${id}`}
    >
      <CardContent className="p-3 h-full relative">
        {dismissible && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsDismissed(true);
            }}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 z-10"
            data-testid={`button-dismiss-ad-${id}`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
        
        <div className="flex items-center h-full space-x-3">
          {imageUrl && (
            <div className="flex-shrink-0">
              <img 
                src={imageUrl} 
                alt={sponsor}
                className="w-16 h-16 object-cover rounded"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900 text-xs">
                Sponsored
              </Badge>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                by {sponsor}
              </span>
            </div>
            
            <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">
              {title}
            </h3>
            
            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
              {description}
            </p>
            
            <div className="flex items-center mt-2">
              <ExternalLink className="w-3 h-3 mr-1 text-gray-400" />
              <span className="text-xs text-gray-400">Click to learn more</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}