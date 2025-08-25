import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Shield, Users, FileText, Ban, UserCheck, Trash2, DollarSign, Eye, MousePointer, Key, Home, Search, Edit, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AdminSession } from "@/lib/session";
import type { User, Post, Advertisement } from "@shared/schema";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [currentUser] = useState<User | null>(AdminSession.getUser());
  const [searchQuery, setSearchQuery] = useState("");

  // Always call hooks before any early returns
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!currentUser?.isAdmin, // Only fetch if user is admin
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
    enabled: !!currentUser?.isAdmin,
  });

  const { data: advertisements = [], isLoading: advertisementsLoading } = useQuery<Advertisement[]>({
    queryKey: ["/api/advertisements"],
    enabled: !!currentUser?.isAdmin,
  });

  const suspendUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest(`/api/admin/users/${userId}/suspend`, { method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User status updated successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest(`/api/admin/users/${userId}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User deleted successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      return apiRequest(`/api/admin/posts/${postId}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({ title: "Post deleted successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    },
  });

  const makeAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest(`/api/admin/users/${userId}/make-admin`, { method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User promoted to admin successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to promote user to admin",
        variant: "destructive",
      });
    },
  });

  const toggleModeratorMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest(`/api/admin/users/${userId}/toggle-moderator`, { method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Moderator status updated successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update moderator status",
        variant: "destructive",
      });
    },
  });

  const flagUsernameChangeMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest(`/api/admin/users/${userId}/flag-username-change`, { 
        method: "PUT"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ 
        title: "User flagged for username change", 
        description: "The user will be required to change their username on next login" 
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



  const togglePasswordResetMutation = useMutation({
    mutationFn: async ({ userId, requireReset }: { userId: string; requireReset: boolean }) => {
      const endpoint = requireReset 
        ? `/api/admin/flag-password-reset/${userId}`
        : `/api/admin/clear-password-reset/${userId}`;
      return apiRequest(endpoint, { method: "POST" });
    },
    onSuccess: (_, { requireReset }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ 
        title: requireReset ? "Password Reset Flagged" : "Password Reset Flag Cleared",
        description: requireReset 
          ? "User will be required to update their password on next login"
          : "User is no longer flagged for password reset",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update password reset flag",
        variant: "destructive",
      });
    },
  });

  const togglePinMutation = useMutation({
    mutationFn: async (postId: string) => {
      // Get the current post state before toggling
      const currentPosts = queryClient.getQueryData(["/api/posts"]) as any[];
      const currentPost = currentPosts?.find(p => p.id === postId);
      const wasAlreadyPinned = currentPost?.isPinned || false;
      
      const response = await fetch(`/api/posts/${postId}/pin`, {
        method: "POST",
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to toggle pin status");
      }
      
      const updatedPost = await response.json();
      return { updatedPost, wasAlreadyPinned };
    },
    onSuccess: ({ updatedPost, wasAlreadyPinned }) => {
      // Invalidate all relevant caches
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/category"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/user"] });
      toast({ 
        title: wasAlreadyPinned ? "Post unpinned successfully" : "Post pinned successfully"
      });
    },
  });

  // Check if user is admin after all hooks are declared
  if (!currentUser || !currentUser.isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-gray-600">You don't have permission to access this page. Please <a href="/admin-login" className="text-blue-600 hover:underline">login as an admin</a>.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    return users.filter((user: User) => 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.firstName && user.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.lastName && user.lastName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [users, searchQuery]);

  const stats = {
    totalUsers: users.length,
    suspendedUsers: users.filter((u: User) => u.isSuspended).length,
    totalPosts: posts.length,
    activePosts: posts.filter((p: Post) => p.isActive).length,
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <Button
          variant="outline"
          onClick={() => window.location.href = '/'}
          className="flex items-center space-x-2"
          data-testid="button-home"
        >
          <Home className="h-4 w-4" />
          <span>Home</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended Users</CardTitle>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.suspendedUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePosts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Management Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="posts">Post Management</TabsTrigger>
          <TabsTrigger value="advertising">Advertising</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts, suspensions, and admin privileges
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Username Search */}
              <div className="flex items-center space-x-2 mb-6">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by username, email, first name, or last name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                  data-testid="input-user-search"
                />
                {searchQuery && (
                  <Badge variant="secondary" className="ml-2">
                    {filteredUsers.length} of {users.length} users
                  </Badge>
                )}
              </div>
              {usersLoading ? (
                <div className="text-center py-8">Loading users...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Password Reset</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {searchQuery ? `No users found matching "${searchQuery}"` : 'No users found'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user: User) => (
                      <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                        <TableCell className="font-medium" data-testid={`text-username-${user.id}`}>
                          {user.username}
                        </TableCell>
                        <TableCell data-testid={`text-email-${user.id}`}>{user.email}</TableCell>
                        <TableCell>
                          {user.isSuspended ? (
                            <Badge variant="destructive" data-testid={`status-suspended-${user.id}`}>
                              Suspended
                            </Badge>
                          ) : (
                            <Badge variant="secondary" data-testid={`status-active-${user.id}`}>
                              Active
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.isAdmin ? (
                              <Badge variant="default" data-testid={`role-admin-${user.id}`}>
                                Admin
                              </Badge>
                            ) : user.isModerator ? (
                              <Badge variant="secondary" data-testid={`role-moderator-${user.id}`}>
                                Moderator
                              </Badge>
                            ) : (
                              <Badge variant="outline" data-testid={`role-user-${user.id}`}>
                                User
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Switch
                              checked={!!user.requirePasswordReset}
                              onCheckedChange={(checked) => {
                                togglePasswordResetMutation.mutate({
                                  userId: user.id,
                                  requireReset: checked
                                });
                              }}
                              disabled={togglePasswordResetMutation.isPending}
                              data-testid={`switch-password-reset-${user.id}`}
                            />
                            <Label 
                              htmlFor={`password-reset-${user.id}`}
                              className={`text-sm ${user.requirePasswordReset ? 'text-destructive font-medium' : 'text-muted-foreground'}`}
                              data-testid={`label-password-reset-${user.id}`}
                            >
                              {user.requirePasswordReset ? 'Required' : 'Not Required'}
                            </Label>
                          </div>
                        </TableCell>
                        <TableCell data-testid={`text-joined-${user.id}`}>
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => suspendUserMutation.mutate(user.id)}
                              disabled={suspendUserMutation.isPending}
                              data-testid={`button-suspend-${user.id}`}
                            >
                              {user.isSuspended ? (
                                <>
                                  <UserCheck className="h-4 w-4 mr-1" />
                                  Unsuspend
                                </>
                              ) : (
                                <>
                                  <Ban className="h-4 w-4 mr-1" />
                                  Suspend
                                </>
                              )}
                            </Button>
                            
                            {!user.isAdmin && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => makeAdminMutation.mutate(user.id)}
                                  disabled={makeAdminMutation.isPending}
                                  data-testid={`button-make-admin-${user.id}`}
                                >
                                  <Shield className="h-4 w-4 mr-1" />
                                  Make Admin
                                </Button>
                                
                                <Button
                                  variant={user.isModerator ? "secondary" : "outline"}
                                  size="sm"
                                  onClick={() => toggleModeratorMutation.mutate(user.id)}
                                  disabled={toggleModeratorMutation.isPending}
                                  data-testid={`button-toggle-moderator-${user.id}`}
                                >
                                  <UserCheck className="h-4 w-4 mr-1" />
                                  {user.isModerator ? 'Remove Mod' : 'Make Mod'}
                                </Button>
                              </>
                            )}
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (confirm(`Flag ${user.username} for username change? They will be required to change their username on next login.`)) {
                                  flagUsernameChangeMutation.mutate(user.id);
                                }
                              }}
                              disabled={flagUsernameChangeMutation.isPending}
                              data-testid={`button-flag-username-${user.id}`}
                              className="text-blue-600 hover:text-blue-700 border-blue-300 hover:border-blue-400"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Flag for Username Change
                            </Button>
                            

                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteUserMutation.mutate(user.id)}
                              disabled={deleteUserMutation.isPending}
                              data-testid={`button-delete-user-${user.id}`}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Post Management</CardTitle>
              <CardDescription>
                Monitor and moderate forum posts and listings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {postsLoading ? (
                <div className="text-center py-8">Loading posts...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post: Post) => (
                      <TableRow key={post.id} data-testid={`row-post-${post.id}`}>
                        <TableCell className="font-medium" data-testid={`text-title-${post.id}`}>
                          {post.title}
                        </TableCell>
                        <TableCell data-testid={`text-author-${post.id}`}>
                          {users.find((u: User) => u.id === post.authorId)?.username || 'Unknown'}
                        </TableCell>
                        <TableCell data-testid={`text-category-${post.id}`}>{post.categoryId}</TableCell>
                        <TableCell>
                          {post.isPinned ? (
                            <Badge variant="default" data-testid={`status-pinned-${post.id}`}>
                              📌 Pinned
                            </Badge>
                          ) : (
                            <Badge variant="outline" data-testid={`status-normal-${post.id}`}>
                              Normal
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell data-testid={`text-views-${post.id}`}>{post.views || 0}</TableCell>
                        <TableCell data-testid={`text-created-${post.id}`}>
                          {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant={post.isPinned ? "secondary" : "outline"}
                              size="sm"
                              onClick={() => togglePinMutation.mutate(post.id)}
                              disabled={togglePinMutation.isPending}
                              data-testid={`button-pin-${post.id}`}
                            >
                              📌 {post.isPinned ? "Unpin" : "Pin"}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deletePostMutation.mutate(post.id)}
                              disabled={deletePostMutation.isPending}
                              data-testid={`button-delete-post-${post.id}`}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advertising" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advertisement Management</CardTitle>
              <CardDescription>
                Manage active advertisements and track performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {advertisementsLoading ? (
                <div className="text-center py-8">Loading advertisements...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Sponsor</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Impressions</TableHead>
                      <TableHead>Clicks</TableHead>
                      <TableHead>CTR</TableHead>
                      <TableHead>Monthly Rate</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {advertisements.map((ad: Advertisement) => (
                      <TableRow key={ad.id} data-testid={`row-ad-${ad.id}`}>
                        <TableCell className="font-medium" data-testid={`text-ad-title-${ad.id}`}>
                          {ad.title}
                        </TableCell>
                        <TableCell data-testid={`text-sponsor-${ad.id}`}>
                          {ad.sponsor}
                        </TableCell>
                        <TableCell data-testid={`text-position-${ad.id}`}>
                          <Badge variant="outline">{ad.position}</Badge>
                        </TableCell>
                        <TableCell>
                          {ad.isActive ? (
                            <Badge variant="default" data-testid={`status-active-${ad.id}`}>
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" data-testid={`status-inactive-${ad.id}`}>
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell data-testid={`text-impressions-${ad.id}`}>
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1 text-muted-foreground" />
                            {ad.impressions || 0}
                          </div>
                        </TableCell>
                        <TableCell data-testid={`text-clicks-${ad.id}`}>
                          <div className="flex items-center">
                            <MousePointer className="h-4 w-4 mr-1 text-muted-foreground" />
                            {ad.clicks || 0}
                          </div>
                        </TableCell>
                        <TableCell data-testid={`text-ctr-${ad.id}`}>
                          {ad.impressions && ad.impressions > 0 
                            ? `${((ad.clicks || 0) / ad.impressions * 100).toFixed(2)}%`
                            : '0%'}
                        </TableCell>
                        <TableCell data-testid={`text-monthly-rate-${ad.id}`}>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                            {ad.monthlyRate ? `$${ad.monthlyRate}` : 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Toggle active status
                                apiRequest(`/api/advertisements/${ad.id}`, { method: "PUT", body: { isActive: !ad.isActive } }).then(() => {
                                  queryClient.invalidateQueries({ queryKey: ["/api/advertisements"] });
                                  toast({ 
                                    title: `Advertisement ${ad.isActive ? 'deactivated' : 'activated'}`,
                                    description: `${ad.title} has been ${ad.isActive ? 'deactivated' : 'activated'}` 
                                  });
                                });
                              }}
                              data-testid={`button-toggle-${ad.id}`}
                            >
                              {ad.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                // Delete advertisement
                                if (confirm('Are you sure you want to delete this advertisement?')) {
                                  apiRequest(`/api/advertisements/${ad.id}`, { method: "DELETE" }).then(() => {
                                    queryClient.invalidateQueries({ queryKey: ["/api/advertisements"] });
                                    toast({ title: "Advertisement deleted successfully" });
                                  }).catch(() => {
                                    toast({
                                      title: "Error",
                                      description: "Failed to delete advertisement",
                                      variant: "destructive"
                                    });
                                  });
                                }
                              }}
                              data-testid={`button-delete-ad-${ad.id}`}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>


    </div>
  );
}