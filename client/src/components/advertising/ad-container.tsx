import { useQuery } from "@tanstack/react-query";
import BannerAd from "./banner-ad";
import type { Advertisement } from "@shared/schema";

interface AdContainerProps {
  position: "header" | "sidebar" | "footer" | "in-feed";
  className?: string;
}

export default function AdContainer({ position, className = "" }: AdContainerProps) {
  const { data: ads = [] } = useQuery<Advertisement[]>({
    queryKey: ["/api/advertisements", position],
  });

  const activeAds = ads.filter(ad => {
    if (!ad.isActive) return false;
    if (ad.endDate && new Date(ad.endDate) < new Date()) return false;
    return true;
  });

  if (activeAds.length === 0) return null;

  // For now, show the first active ad. Could implement rotation logic here
  const currentAd = activeAds[0];

  return (
    <div className={className}>
      <BannerAd
        id={currentAd.id}
        title={currentAd.title}
        description={currentAd.description}
        imageUrl={currentAd.imageUrl || undefined}
        targetUrl={currentAd.targetUrl}
        sponsor={currentAd.sponsor}
        position={position}
        size={currentAd.size as "small" | "medium" | "large"}
        dismissible={position === "sidebar"}
      />
    </div>
  );
}