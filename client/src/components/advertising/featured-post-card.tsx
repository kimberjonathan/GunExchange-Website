import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, DollarSign, Eye, MessageSquare, TrendingUp, Star, Crown } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Post, User, FeaturedListing } from "@shared/schema";

interface FeaturedPostCardProps {
  post: Post;
  author?: User;
  replyCount?: number;
  category?: {
    name: string;
    type: string;
  };
  currentUser?: User | null;
  featuredListing: FeaturedListing;
}

export default function FeaturedPostCard({ 
  post, 
  author, 
  replyCount = 0, 
  category, 
  currentUser, 
  featuredListing 
}: FeaturedPostCardProps) {
  const { toast } = useToast();

  const bumpPostMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/posts/${post.id}/bump`, { method: "POST", body: { authorId: currentUser?.id } });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({ title: "Post bumped successfully!" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to bump post",
        variant: "destructive",
      });
    },
  });

  const canBump = currentUser && currentUser.id === post.authorId;
  const formatPrice = (priceInCents?: number | null) => {
    if (!priceInCents) return null;
    return `$${(priceInCents / 100).toLocaleString()}`;
  };

  const getTimeAgo = (date?: Date | string | null) => {
    if (!date) return "Unknown";
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Less than 1 hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  const getBadgeVariant = (type?: string) => {
    switch (type) {
      case "wts": return "default";
      case "wtb": return "secondary";
      case "discussion": return "outline";
      default: return "outline";
    }
  };

  const getBadgeText = (type?: string) => {
    switch (type) {
      case "wts": return "WTS";
      case "wtb": return "WTB";
      case "discussion": return "Discussion";
      default: return "Post";
    }
  };

  const isFeaturedActive = featuredListing.isActive && new Date(featuredListing.featuredUntil) > new Date();

  return (
    <Card 
      className={`transition-all duration-300 ${
        isFeaturedActive 
          ? "bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 border-2 border-yellow-300 dark:border-yellow-600 shadow-lg hover:shadow-xl" 
          : "hover:shadow-md"
      }`}
      data-testid={`card-featured-post-${post.id}`}
    >
      <CardContent className="p-6 relative">
        {/* Featured Badge */}
        {isFeaturedActive && (
          <div className="absolute -top-2 -right-2 z-10">
            <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-lg">
              <Crown className="w-3 h-3 mr-1" />
              Featured
            </div>
          </div>
        )}

        <div className="flex items-start space-x-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium ${
            isFeaturedActive 
              ? "bg-gradient-to-br from-yellow-500 to-amber-600 shadow-lg" 
              : "bg-forum-accent"
          }`}>
            <span data-testid={`text-author-initials-${post.id}`}>
              {author?.username?.slice(0, 2).toUpperCase() || "??"}
            </span>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              {author?.id ? (
                <Link href={`/user/${author.id}`}>
                  <span className={`font-medium cursor-pointer transition-colors ${
                    isFeaturedActive 
                      ? "text-amber-800 dark:text-amber-200 hover:text-amber-600 dark:hover:text-amber-300" 
                      : "text-forum-primary hover:text-forum-accent"
                  }`} data-testid={`text-author-${post.id}`}>
                    {author.username || "Unknown User"}
                  </span>
                </Link>
              ) : (
                <span className="font-medium text-forum-primary" data-testid={`text-author-${post.id}`}>
                  Unknown User
                </span>
              )}
              
              <Badge variant={getBadgeVariant(category?.type)} data-testid={`badge-type-${post.id}`}>
                {getBadgeText(category?.type)}
              </Badge>
              
              {isFeaturedActive && (
                <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  Promoted
                </Badge>
              )}
              
              <span className="text-xs text-gray-500 dark:text-gray-400" data-testid={`text-timestamp-${post.id}`}>
                {getTimeAgo(post.createdAt)}
              </span>
            </div>
            
            <Link href={`/posts/${post.id}`}>
              <h3 className={`text-xl font-bold mb-2 cursor-pointer transition-colors ${
                isFeaturedActive 
                  ? "text-amber-900 dark:text-amber-100 hover:text-amber-700 dark:hover:text-amber-200" 
                  : "text-forum-primary hover:text-forum-accent"
              }`} data-testid={`link-post-title-${post.id}`}>
                {post.title}
              </h3>
            </Link>
            
            <p className="text-gray-700 dark:text-gray-200 text-sm mb-3 line-clamp-3" data-testid={`text-content-${post.id}`}>
              {post.content.length > 200 ? `${post.content.slice(0, 200)}...` : post.content}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                {post.location && (
                  <span className="flex items-center" data-testid={`text-location-${post.id}`}>
                    <MapPin className="w-4 h-4 mr-1" />
                    {post.location}
                  </span>
                )}
                {post.price && (
                  <span className="flex items-center font-semibold text-green-600 dark:text-green-400" data-testid={`text-price-${post.id}`}>
                    <DollarSign className="w-4 h-4 mr-1" />
                    {formatPrice(post.price)}
                  </span>
                )}
                <span className="flex items-center" data-testid={`text-views-${post.id}`}>
                  <Eye className="w-4 h-4 mr-1" />
                  {post.views || 0} views
                </span>
                {replyCount > 0 && (
                  <span className="flex items-center" data-testid={`text-replies-${post.id}`}>
                    <MessageSquare className="w-4 h-4 mr-1" />
                    {replyCount} replies
                  </span>
                )}
              </div>
              
              {canBump && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => bumpPostMutation.mutate()}
                  disabled={bumpPostMutation.isPending}
                  data-testid={`button-bump-${post.id}`}
                  className="ml-4"
                >
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Bump
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}