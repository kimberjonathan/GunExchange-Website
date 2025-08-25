import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import Footer from "@/components/layout/footer";
import PostCard from "@/components/forum/post-card";
import CategoryCard from "@/components/forum/category-card";
import MarketplaceTile from "@/components/forum/marketplace-tile";
import AdContainer from "@/components/advertising/ad-container";

import { useAuth } from "@/lib/auth";
import type { Post, User, Category } from "@shared/schema";

export default function Home() {
  const { user } = useAuth();
  
  const { data: posts = [] } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: postCounts = [] } = useQuery<{ categoryId: string; postCount: number }[]>({
    queryKey: ["/api/categories/post-counts"],
  });

  // Sort posts with pinned posts first, then by bumpedAt
  const sortedPosts = posts.sort((a, b) => {
    // Pinned posts first
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    // Then sort by bumpedAt (most recent first)
    const dateA = a.bumpedAt || a.createdAt;
    const dateB = b.bumpedAt || b.createdAt;
    return new Date(dateB || 0).getTime() - new Date(dateA || 0).getTime();
  });
  
  // Get recent posts for activity feed
  const recentPosts = sortedPosts.slice(0, 10);
  
  // Convert post counts array to object for easier lookup
  const postCountsMap = postCounts.reduce((acc, { categoryId, postCount }) => {
    acc[categoryId] = parseInt(String(postCount), 10) || 0;
    return acc;
  }, {} as { [categoryId: string]: number });

  // Get discussion categories for the old format
  const discussionCategories = categories.filter(cat => cat.type === 'discussion');
  
  const getPostCountForCategory = (categoryId: string) => {
    return posts.filter(post => post.categoryId === categoryId).length;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Advertisement */}
          <AdContainer position="header" className="mb-6" />
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <Sidebar />
              {/* Sidebar Advertisement */}
              <AdContainer position="sidebar" className="mt-6" />
            </div>

            <div className="lg:col-span-3">
              {/* Create Post Button */}
              <div className="mb-6">
                <Link href="/create-post">
                  <Button 
                    className="bg-forum-accent text-white hover:bg-forum-accent/90 font-medium flex items-center"
                    data-testid="button-create-post"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Listing or Post
                  </Button>
                </Link>
              </div>

              {/* Marketplace Overview Tiles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <MarketplaceTile
                  categories={categories}
                  postCounts={postCountsMap}
                  type="wts"
                  title="Want To Sell"
                  description="Browse firearms for sale"
                  icon="fas fa-dollar-sign"
                  color="bg-green-600"
                />
                <MarketplaceTile
                  categories={categories}
                  postCounts={postCountsMap}
                  type="wtb"
                  title="Want To Buy"
                  description="Find what you're looking for"
                  icon="fas fa-search"
                  color="bg-blue-600"
                />
                <MarketplaceTile
                  categories={categories}
                  postCounts={postCountsMap}
                  type="wtt"
                  title="Want To Trade"
                  description="Trade firearms and accessories"
                  icon="fas fa-exchange-alt"
                  color="bg-orange-600"
                />
              </div>

              {/* Discussion Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {discussionCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    postCount={postCountsMap[category.id] || 0}
                  />
                ))}
              </div>

              {/* Recent Activity Feed */}
              <Card>
                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                  <CardTitle className="text-lg text-forum-primary">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {recentPosts.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                      <p data-testid="text-no-posts">No posts yet. Be the first to create one!</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {recentPosts.map((post, index) => {
                        const category = categories.find(cat => cat.id === post.categoryId);
                        return (
                          <div key={post.id}>
                            <div className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                              <PostCard
                                post={post}
                                category={category}
                                author={(post as any).author}
                                currentUser={user}
                              />
                            </div>
                            {/* Show in-feed ad after every 3rd post */}
                            {(index + 1) % 3 === 0 && (
                              <div className="px-6 py-4">
                                <AdContainer position="in-feed" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {recentPosts.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 text-center">
                      <Link 
                        href="/posts" 
                        className="text-forum-accent hover:text-forum-accent/80 font-medium"
                        data-testid="link-view-more"
                      >
                        View More Activity →
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Advertisement */}
      <AdContainer position="footer" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" />
      
      <Footer />
    </div>
  );
}
