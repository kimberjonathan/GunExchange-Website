import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { ArrowLeft, MapPin, DollarSign, Eye, Calendar, Edit, MessageCircle, Send, Trash2, Pin, PinOff, Shield, Ban, UserX, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { isModerator, canDeletePost, canPinPost } from "@/lib/moderator";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ImageModal from "@/components/ui/image-modal";
import type { Post, Category, User, Reply } from "@shared/schema";
import { useState } from "react";

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: post } = useQuery<Post>({
    queryKey: ["/api/posts", id],
  });

  const { data: replies = [] } = useQuery<Reply[]>({
    queryKey: ["/api/posts", id, "replies"],
    enabled: !!id,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Comment submission mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/posts/${id}/replies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          authorId: user?.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to post comment");
      }

      return response.json();
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["/api/posts", id, "replies"] });
      toast({
        title: "Success",
        description: "Your comment has been posted!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post comment",
        variant: "destructive",
      });
    },
  });

  // Moderator mutations
  const deletePostMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/posts/${id}/moderate`, {
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
      toast({
        title: "Success",
        description: "Post has been deleted",
      });
      navigate("/");
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
      const wasAlreadyPinned = post?.isPinned || false;
      
      const response = await fetch(`/api/posts/${id}/pin`, {
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
      queryClient.invalidateQueries({ queryKey: ["/api/posts", id] });
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

  const handleSubmitComment = () => {
    if (newComment.trim() && user) {
      addCommentMutation.mutate(newComment.trim());
    }
  };

  // Helper functions
  const formatPrice = (priceInCents?: number | null) => {
    if (!priceInCents) return null;
    return `$${(priceInCents / 100).toLocaleString()}`;
  };

  const formatDate = (date?: Date | null) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBadgeVariant = (type?: string) => {
    switch (type) {
      case "wts": return "default";
      case "wtb": return "secondary";
      case "wtt": return "destructive";
      case "discussion": return "outline";
      default: return "outline";
    }
  };

  const getBadgeText = (type?: string) => {
    switch (type) {
      case "wts": return "WTS";
      case "wtb": return "WTB";
      case "wtt": return "WTT";
      case "discussion": return "Discussion";
      default: return "Post";
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Post Not Found</h1>
            <p className="text-gray-600 mb-4">The post you're looking for doesn't exist.</p>
            <Link href="/">
              <Button variant="outline" data-testid="button-back-home">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const category = categories.find(cat => cat.id === post.categoryId);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link href={category ? `/category/${category.slug}` : "/"}>
              <Button variant="outline" size="sm" data-testid="button-back">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to {category ? category.name : "Forum"}
              </Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant={getBadgeVariant(category?.type)} data-testid="badge-post-type">
                      {getBadgeText(category?.type)}
                    </Badge>
                    {category && (
                      <span className="text-sm text-gray-500">in {category.name}</span>
                    )}
                  </div>
                  <CardTitle className="text-2xl text-forum-primary mb-2" data-testid="text-post-title">
                    {post.title}
                  </CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center" data-testid="text-author">
                      <div className="w-6 h-6 bg-forum-accent rounded-full flex items-center justify-center text-white text-xs font-medium mr-2">
                        {((post as any).author?.username || post.authorId).slice(0, 2).toUpperCase()}
                      </div>
                      <Link href={`/user/${post.authorId}`}>
                        <span className="font-medium text-forum-primary hover:text-forum-accent cursor-pointer transition-colors">
                          {(post as any).author?.username || `User_${post.authorId.slice(0, 6)}`}
                        </span>
                      </Link>
                    </span>
                    <span className="flex items-center" data-testid="text-created-date">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(post.createdAt)}
                    </span>
                    <span className="flex items-center" data-testid="text-views">
                      <Eye className="w-4 h-4 mr-1" />
                      {post.views || 0} views
                    </span>
                  </div>
                </div>
                <div className="ml-4 flex items-center space-x-2">
                  {/* Edit button for post owner */}
                  {user && user.id === post.authorId && (
                    <Link href={`/posts/${post.id}/edit`}>
                      <Button variant="outline" size="sm" data-testid="button-edit">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                  )}

                  {/* Moderator actions for admins */}
                  {user && isModerator(user) && (
                    <>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            data-testid="button-delete-post"
                            disabled={deletePostMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
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
                        data-testid="button-pin-post"
                      >
                        {post.isPinned ? (
                          <>
                            <PinOff className="w-4 h-4 mr-2" />
                            Unpin
                          </>
                        ) : (
                          <>
                            <Pin className="w-4 h-4 mr-2" />
                            Pin
                          </>
                        )}
                      </Button>

                      {post.authorId !== user.id && (
                        <>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                data-testid="button-suspend-user"
                                disabled={suspendUserMutation.isPending}
                              >
                                <Ban className="w-4 h-4 mr-2" />
                                Suspend Author
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Suspend User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to suspend the author of this post? They will not be able to create new posts or replies.
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
                                data-testid="button-flag-username"
                                disabled={flagUsernameChangeMutation.isPending}
                              >
                                <UserX className="w-4 h-4 mr-2" />
                                Flag Username
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Flag User for Username Change</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will require the user to change their username on their next login. Use this for inappropriate or offensive usernames.
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
                                data-testid="button-flag-password"
                                disabled={flagPasswordResetMutation.isPending}
                              >
                                <Key className="w-4 h-4 mr-2" />
                                Flag Password
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Flag User for Password Reset</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will require the user to change their password on their next login. Use this for security concerns or compromised accounts.
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
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none mb-6" data-testid="text-post-content">
                <p className="whitespace-pre-wrap">{post.content}</p>
              </div>

              {/* Travel, Shipping, and Trade Options - Only show for marketplace posts */}
              {(category?.type === "wts" || category?.type === "wtb" || category?.type === "wtt") && (post.willingToTravel || post.willingToShip || post.willingToTrade) && (
                <div className="mb-6">
                  <div className="flex gap-3">
                    {post.willingToTravel && (
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-600 px-3 py-1" data-testid="badge-willing-to-travel">
                        Willing to Travel
                      </Badge>
                    )}
                    {post.willingToShip && (
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-600 px-3 py-1" data-testid="badge-willing-to-ship">
                        Willing to Ship
                      </Badge>
                    )}
                    {post.willingToTrade && (
                      <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-600 px-3 py-1" data-testid="badge-willing-to-trade">
                        Willing to Trade
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Post Images */}
              {post.images && post.images.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-forum-primary mb-3">Images</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {post.images.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Post image ${index + 1}`}
                          className="w-full h-24 sm:h-28 object-cover rounded-lg border border-gray-200 hover:border-forum-accent transition-all duration-200 cursor-pointer hover:shadow-md"
                          onClick={() => {
                            setCurrentImageIndex(index);
                            setImageModalOpen(true);
                          }}
                          data-testid={`img-post-${index}`}
                          title="Click to view full size"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity rounded-lg pointer-events-none" />
                        <div className="absolute top-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          {index + 1}/{post.images?.length || 0}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Click on any image to view full size</p>
                </div>
              )}

              {/* Post Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {post.price && (
                  <div className="flex items-center space-x-2" data-testid="text-price">
                    <DollarSign className="w-4 h-4 text-forum-accent" />
                    <span className="font-medium">Price:</span>
                    <span className="text-lg font-bold text-forum-accent">
                      {formatPrice(post.price)}
                    </span>
                  </div>
                )}
                
                {post.location && (
                  <div className="flex items-center space-x-2" data-testid="text-location">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Location:</span>
                    <span>{post.location}</span>
                  </div>
                )}
                
                {post.contactInfo && (
                  <div className="md:col-span-2">
                    <div className="flex items-start space-x-2" data-testid="text-contact">
                      <svg className="w-4 h-4 text-gray-500 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      <span className="font-medium">Contact:</span>
                      <span>{post.contactInfo}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Legal Notice for Marketplace Posts */}
              {(category?.type === "wts" || category?.type === "wtb" || category?.type === "wtt") && (
                <>
                  <Separator className="my-6" />
                  <div className="bg-forum-warning/10 border border-forum-warning/20 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <svg className="w-5 h-5 text-forum-warning mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-forum-warning mb-1">
                          California Law Compliance Required
                        </p>
                        <p className="text-xs text-forum-warning">
                          All firearm transfers must be conducted through licensed FFL dealers. Contact the seller to arrange transfer through a licensed dealer. 
                          Private party transfers without an FFL are prohibited under California law.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Replies Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                Comments ({replies.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {replies.length > 0 && (
                <div className="space-y-4 mb-6">
                  {replies.map((reply) => (
                    <div key={reply.id} className="border-l-2 border-gray-200 pl-4" data-testid={`reply-${reply.id}`}>
                      <div className="flex items-center space-x-2 mb-2 text-sm text-gray-500">
                        <div className="w-6 h-6 bg-forum-accent rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {((reply as any).author?.username || reply.authorId).slice(0, 2).toUpperCase()}
                        </div>
                        <Link href={`/user/${reply.authorId}`}>
                          <span className="font-medium text-forum-primary hover:text-forum-accent cursor-pointer transition-colors">
                            {(reply as any).author?.username || `User_${reply.authorId.slice(0, 6)}`}
                          </span>
                        </Link>
                        <span>•</span>
                        <span>{formatDate(reply.createdAt)}</span>
                      </div>
                      <p className="text-gray-900 whitespace-pre-wrap">{reply.content}</p>
                    </div>
                  ))}
                  <Separator />
                </div>
              )}

              {/* Add Comment Form */}
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <div className="w-6 h-6 bg-forum-accent rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {user.id.slice(0, 2).toUpperCase()}
                    </div>
                    <span>Post a comment as {user.username || `User_${user.id.slice(0, 6)}`}</span>
                  </div>
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Write your comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                      data-testid="textarea-comment"
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={handleSubmitComment}
                        disabled={!newComment.trim() || addCommentMutation.isPending}
                        data-testid="button-post-comment"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {addCommentMutation.isPending ? "Posting..." : "Post Comment"}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-4">Please log in to post a comment</p>
                  <Link href="/auth">
                    <Button variant="outline" data-testid="button-login-comment">
                      Login to Comment
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />

      {/* Image Modal */}
      {post?.images && (
        <ImageModal
          images={post.images}
          currentIndex={currentImageIndex}
          isOpen={imageModalOpen}
          onClose={() => setImageModalOpen(false)}
          onNavigate={setCurrentImageIndex}
        />
      )}
    </div>
  );
}
