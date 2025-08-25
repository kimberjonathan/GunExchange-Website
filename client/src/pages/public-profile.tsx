import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Calendar, MessageCircle, User, Send, Shield, UserX, Flag, Key, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import type { User as UserType, Post, Category } from "@shared/schema";
import { useState } from "react";

export default function PublicProfile() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageContent, setMessageContent] = useState("");

  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/users", id],
  });

  const { data: userPosts = [] } = useQuery<Post[]>({
    queryKey: ["/api/posts/user", id],
    enabled: !!id,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const formatDate = (date?: Date | null) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPostCountByType = (type: string) => {
    return userPosts.filter(post => {
      const category = categories.find(cat => cat.id === post.categoryId);
      return category?.type === type;
    }).length;
  };

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ subject, content }: { subject: string; content: string }) => {
      if (!currentUser || !user) throw new Error("Authentication required");
      
      // Debug: Log what we're about to send
      console.log("🔍 CLIENT - About to send conversation request with user ID:", currentUser.id);
      console.log("🔍 CLIENT - Headers to be sent:", {
        "Content-Type": "application/json",
        "x-user-id": currentUser.id
      });

      // First create or find existing conversation - use session-based auth
      const conversationResponse = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          participant1Id: currentUser.id,
          participant2Id: user.id,
        }),
        credentials: "include",
      });

      if (!conversationResponse.ok) {
        throw new Error(`Failed to create conversation: ${conversationResponse.statusText}`);
      }

      const conversation = await conversationResponse.json();

      // Then send the message - use session-based auth
      const messageResponse = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          conversationId: conversation.id,
          content: `Subject: ${subject}\n\n${content}`,
        }),
        credentials: "include",
      });

      if (!messageResponse.ok) {
        throw new Error(`Failed to send message: ${messageResponse.statusText}`);
      }

      const message = await messageResponse.json();

      return { conversation, message };
    },
    onSuccess: (data) => {
      setMessageDialogOpen(false);
      setMessageSubject("");
      setMessageContent("");
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully!",
      });
      // Navigate to the conversation
      navigate(`/messages?conversation=${data.conversation.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!messageSubject.trim() || !messageContent.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both a subject and message content.",
        variant: "destructive",
      });
      return;
    }

    sendMessageMutation.mutate({
      subject: messageSubject.trim(),
      content: messageContent.trim(),
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">User not found or loading...</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link href="/">
              <Button variant="outline" size="sm" data-testid="button-back">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Forum
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* User Profile Card */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="w-24 h-24">
                      <AvatarImage 
                        src={(user as any).profilePicture || undefined} 
                        alt={`${user.username}'s profile`}
                      />
                      <AvatarFallback className="text-2xl bg-forum-accent text-white">
                        {user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h1 className="text-2xl font-bold text-forum-primary" data-testid="text-username">
                        {user.username}
                      </h1>
                      {user.firstName || user.lastName ? (
                        <p className="text-gray-600 dark:text-gray-400" data-testid="text-full-name">
                          {[user.firstName, user.lastName].filter(Boolean).join(' ')}
                        </p>
                      ) : null}
                    </div>
                    

                    {/* Send Message Button - only show if not viewing own profile and user is logged in */}
                    {currentUser && user && currentUser.id !== user.id && (
                      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-4"
                            data-testid="button-send-message"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Send Message
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Send Message to {user.username}</DialogTitle>
                            <DialogDescription>
                              Send a private message to this user. They will receive it in their messages inbox.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="message-subject">Subject</Label>
                              <Input
                                id="message-subject"
                                placeholder="Enter message subject..."
                                value={messageSubject}
                                onChange={(e) => setMessageSubject(e.target.value)}
                                data-testid="input-message-subject"
                              />
                            </div>
                            <div>
                              <Label htmlFor="message-content">Message</Label>
                              <Textarea
                                id="message-content"
                                placeholder="Write your message here..."
                                value={messageContent}
                                onChange={(e) => setMessageContent(e.target.value)}
                                rows={5}
                                data-testid="textarea-message-content"
                              />
                            </div>
                            <div className="flex justify-end space-x-3">
                              <Button 
                                variant="outline" 
                                onClick={() => setMessageDialogOpen(false)}
                                data-testid="button-cancel-message"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleSendMessage}
                                disabled={sendMessageMutation.isPending}
                                data-testid="button-send-message-submit"
                              >
                                <Send className="w-4 h-4 mr-2" />
                                {sendMessageMutation.isPending ? "Sending..." : "Send Message"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    {/* MODERATOR CONTROLS - SAME AS USER PROFILE */}
                    {currentUser && (currentUser.isModerator || currentUser.isAdmin) && user && user.id !== currentUser.id && (
                      <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-700 rounded-lg p-4 mt-4">
                        <h3 className="font-semibold text-red-800 dark:text-red-100 mb-3 flex items-center">
                          <Shield className="w-4 h-4 mr-2" />
                          Moderator Actions
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {currentUser.isAdmin ? 'Admin' : 'Moderator'}
                          </Badge>
                        </h3>
                        <div className="space-y-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                              >
                                <UserX className="w-4 h-4 mr-2" />
                                {user?.isSuspended ? 'Unsuspend' : 'Suspend'}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {user?.isSuspended ? 'Unsuspend User' : 'Suspend User'}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {user?.isSuspended 
                                    ? `Are you sure you want to unsuspend ${user.username}? They will regain access to post and interact on the forum.`
                                    : `Are you sure you want to suspend ${user.username}? They will lose access to post and interact on the forum.`
                                  }
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                                  {user?.isSuspended ? 'Unsuspend' : 'Suspend'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full text-orange-600 hover:text-orange-700 border-orange-300 hover:border-orange-400"
                              >
                                <Flag className="w-4 h-4 mr-2" />
                                Flag Username
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Flag Username</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Flag this user's username as inappropriate. They will be required to change it before they can continue using the forum.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-orange-600 hover:bg-orange-700">
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
                                className="w-full text-blue-600 hover:text-blue-700 border-blue-300 hover:border-blue-400"
                              >
                                <Key className="w-4 h-4 mr-2" />
                                Flag Password
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Flag Password Reset</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Flag this user for a password reset. They will be required to change their password on next login.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-blue-600 hover:bg-blue-700">
                                  Flag Password Reset
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          {currentUser.isAdmin && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="w-full text-purple-600 hover:text-purple-700 border-purple-300 hover:border-purple-400"
                                >
                                  <Settings className="w-4 h-4 mr-2" />
                                  {user?.isModerator ? 'Remove Mod' : 'Make Mod'}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    {user?.isModerator ? 'Remove Moderator Status' : 'Grant Moderator Status'}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {user?.isModerator 
                                      ? `Remove moderator privileges from ${user.username}? They will no longer be able to moderate posts and users.`
                                      : `Grant moderator privileges to ${user.username}? They will be able to moderate posts and users.`
                                    }
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction className="bg-purple-600 hover:bg-purple-700">
                                    {user?.isModerator ? 'Remove Moderator' : 'Grant Moderator'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span data-testid="text-joined-date">
                      Joined {formatDate(user.createdAt)}
                    </span>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="font-medium text-forum-primary mb-3">Activity</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Posts</span>
                        <Badge variant="outline" data-testid="text-total-posts">
                          {userPosts.length}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">For Sale Posts</span>
                        <Badge variant="default" data-testid="text-wts-posts">
                          {getPostCountByType('wts')}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Want to Buy Posts</span>
                        <Badge variant="secondary" data-testid="text-wtb-posts">
                          {getPostCountByType('wtb')}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Discussion Posts</span>
                        <Badge variant="outline" data-testid="text-discussion-posts">
                          {getPostCountByType('discussion')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* User Posts */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5" />
                    <span>Recent Posts by {user.username}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userPosts.length === 0 ? (
                    <div className="text-center py-8">
                      <User className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400" data-testid="text-no-posts">
                        {user.username} hasn't created any posts yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userPosts.slice(0, 10).map((post) => {
                        const category = categories.find(cat => cat.id === post.categoryId);
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
                          <div 
                            key={post.id} 
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            data-testid={`post-${post.id}`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <Badge variant={getBadgeVariant(category?.type)}>
                                  {getBadgeText(category?.type)}
                                </Badge>
                                {category && (
                                  <span className="text-sm text-gray-500">in {category.name}</span>
                                )}
                              </div>
                              <span className="text-xs text-gray-400">
                                {formatDate(post.createdAt)}
                              </span>
                            </div>
                            <Link href={`/posts/${post.id}`}>
                              <h4 className="font-medium text-forum-primary hover:text-forum-accent cursor-pointer mb-2">
                                {post.title}
                              </h4>
                            </Link>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {post.content.length > 150 ? `${post.content.slice(0, 150)}...` : post.content}
                            </p>
                            <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                              {post.views !== undefined && (
                                <span>{post.views} views</span>
                              )}
                              {post.price && (
                                <span>${(post.price / 100).toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {userPosts.length > 10 && (
                        <div className="text-center pt-4">
                          <p className="text-sm text-gray-500">
                            Showing 10 of {userPosts.length} posts
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}