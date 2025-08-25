import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, DollarSign, Eye, MessageSquare, TrendingUp, Trash2, Pin, PinOff, Ban, UserX, Key } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isModerator } from "@/lib/moderator";
import ImageModal from "@/components/ui/image-modal";
import { useState } from "react";
import type { Post, User } from "@shared/schema";

interface PostCardProps {
  post: Post;
  author?: User;
  replyCount?: number;
  category?: {
    name: string;
    type: string;
  };
  currentUser?: User | null;
}

export default function PostCard({ post, author, replyCount = 0, category, currentUser }: PostCardProps) {
  const { toast } = useToast();
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  // Moderator mutations
  const deletePostMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/posts/${post.id}/moderate`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete post");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Success",
        description: "Post has been deleted",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete post",
        variant: "destructive",
      });
    },
  });

  const pinPostMutation = useMutation({
    mutationFn: async () => {
      // Capture the current pin state before the toggle
      const wasAlreadyPinned = post.isPinned;
      
      const response = await fetch(`/api/posts/${post.id}/pin`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to pin/unpin post");
      }

      const updatedPost = await response.json();
      return { updatedPost, wasAlreadyPinned };
    },
    onSuccess: ({ updatedPost, wasAlreadyPinned }) => {
      // Invalidate all relevant caches
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/category"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts", updatedPost.id] });
      toast({
        title: "Success",
        description: wasAlreadyPinned ? "Post has been unpinned" : "Post has been pinned",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to pin/unpin post",
        variant: "destructive",
      });
    },
  });

  const suspendUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/users/${userId}/suspend`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to suspend/unsuspend user");
      }

      return response.json();
    },
    onSuccess: (updatedUser) => {
      toast({
        title: "Success",
        description: updatedUser.isSuspended ? "User has been suspended" : "User has been unsuspended",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to suspend/unsuspend user",
        variant: "destructive",
      });
    },
  });

  const flagUsernameChangeMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/users/${userId}/flag-username-change`, {
        method: "PUT",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to flag user for username change");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User has been flagged for username change",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to flag user for username change",
        variant: "destructive",
      });
    },
  });

  const flagPasswordResetMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/users/${userId}/flag-password-reset`, {
        method: "PUT",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to flag user for password reset");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User has been flagged for password reset",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to flag user for password reset",
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

  return (
    <>
      <Card className={`hover:shadow-md transition-shadow ${post.isPinned ? 'border-l-4 border-l-forum-accent bg-forum-accent/5 dark:bg-forum-accent/10' : ''}`} data-testid={`card-post-${post.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-forum-accent rounded-full flex items-center justify-center text-white font-medium">
            <span data-testid={`text-author-initials-${post.id}`}>
              {author?.username?.slice(0, 2).toUpperCase() || "??"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              {author?.id ? (
                <Link href={`/user/${author.id}`}>
                  <span className="font-medium text-forum-primary hover:text-forum-accent cursor-pointer transition-colors" data-testid={`text-author-${post.id}`}>
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
              <span className="text-xs text-gray-500 dark:text-gray-400" data-testid={`text-timestamp-${post.id}`}>
                {getTimeAgo(post.createdAt)}
              </span>
            </div>
            <Link href={`/posts/${post.id}`}>
              <h3 className="text-lg font-medium text-forum-primary mb-2 hover:text-forum-accent cursor-pointer flex items-center gap-2" data-testid={`link-post-title-${post.id}`}>
                {post.isPinned && <span className="text-forum-accent">📌</span>}
                {post.title}
              </h3>
            </Link>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-3" data-testid={`text-content-${post.id}`}>
              {post.content.length > 200 ? `${post.content.slice(0, 200)}...` : post.content}
            </p>
            
            {/* Travel, Shipping, and Trade Options - Only show for marketplace posts */}
            {(category?.type === "wts" || category?.type === "wtb" || category?.type === "wtt") && (post.willingToTravel || post.willingToShip || post.willingToTrade) && (
              <div className="flex gap-2 mb-3">
                {post.willingToTravel && (
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-600" data-testid={`badge-willing-to-travel-${post.id}`}>
                    Willing to Travel
                  </Badge>
                )}
                {post.willingToShip && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-600" data-testid={`badge-willing-to-ship-${post.id}`}>
                    Willing to Ship
                  </Badge>
                )}
                {post.willingToTrade && (
                  <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-600" data-testid={`badge-willing-to-trade-${post.id}`}>
                    Willing to Trade
                  </Badge>
                )}
              </div>
            )}
            
            {/* Post Images Preview */}
            {post.images && post.images.length > 0 && (
              <div className="mb-3">
                <div className="flex space-x-2 overflow-x-auto">
                  {post.images.slice(0, 3).map((imageUrl, index) => (
                    <img
                      key={index}
                      src={imageUrl}
                      alt={`Post preview ${index + 1}`}
                      className="w-12 h-12 object-cover rounded border border-gray-200 flex-shrink-0 cursor-pointer hover:border-forum-accent transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                        setImageModalOpen(true);
                      }}
                      data-testid={`img-preview-${post.id}-${index}`}
                      title="Click to view full size"
                    />
                  ))}
                  {post.images.length > 3 && (
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 flex items-center justify-center text-xs text-gray-500 flex-shrink-0">
                      +{post.images.length - 3}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                {post.location && (
                  <span className="flex items-center" data-testid={`text-location-${post.id}`}>
                    <MapPin className="w-4 h-4 mr-1" />
                    {post.location}
                  </span>
                )}
                {post.price && (
                  <span className="flex items-center" data-testid={`text-price-${post.id}`}>
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
              <div className="flex items-center space-x-2 ml-4">
                {canBump && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => bumpPostMutation.mutate()}
                    disabled={bumpPostMutation.isPending}
                    data-testid={`button-bump-${post.id}`}
                  >
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Bump
                  </Button>
                )}

                {/* Moderator actions for admins */}
                {currentUser && isModerator(currentUser) && (
                  <>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          data-testid={`button-delete-post-${post.id}`}
                          disabled={deletePostMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Post</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this post? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deletePostMutation.mutate()}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Post
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => pinPostMutation.mutate()}
                      disabled={pinPostMutation.isPending}
                      data-testid={`button-pin-post-${post.id}`}
                    >
                      {post.isPinned ? (
                        <PinOff className="w-4 h-4" />
                      ) : (
                        <Pin className="w-4 h-4" />
                      )}
                    </Button>

                    {post.authorId !== currentUser.id && author && (
                      <>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              data-testid={`button-suspend-user-${post.id}`}
                              disabled={suspendUserMutation.isPending}
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Suspend User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to suspend {author.username}? They will not be able to create new posts or replies.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => suspendUserMutation.mutate(post.authorId)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Suspend User
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              data-testid={`button-flag-username-${post.id}`}
                              disabled={flagUsernameChangeMutation.isPending}
                            >
                              <UserX className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Flag User for Username Change</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will require {author.username} to change their username on their next login. Use this for inappropriate or offensive usernames.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => flagUsernameChangeMutation.mutate(post.authorId)}
                                className="bg-orange-600 text-white hover:bg-orange-700"
                              >
                                Flag Username
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              data-testid={`button-flag-password-${post.id}`}
                              disabled={flagPasswordResetMutation.isPending}
                            >
                              <Key className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Flag User for Password Reset</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will require {author.username} to change their password on their next login. Use this for security concerns or compromised accounts.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => flagPasswordResetMutation.mutate(post.authorId)}
                                className="bg-blue-600 text-white hover:bg-blue-700"
                              >
                                Flag Password
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      </Card>
      
      {/* Image Modal */}
      {post.images && (
        <ImageModal
          images={post.images}
          currentIndex={currentImageIndex}
          isOpen={imageModalOpen}
          onClose={() => setImageModalOpen(false)}
          onNavigate={setCurrentImageIndex}
        />
      )}
    </>
  );
}