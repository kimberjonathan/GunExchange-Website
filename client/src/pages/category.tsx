import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import Footer from "@/components/layout/footer";
import PostCard from "@/components/forum/post-card";
import { useAuth } from "@/lib/auth";
import type { Post, Category, User } from "@shared/schema";

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();

  const { data: category } = useQuery<Category>({
    queryKey: ["/api/categories", slug],
  });

  const { data: posts = [] } = useQuery<Post[]>({
    queryKey: ["/api/posts/category", category?.id],
    enabled: !!category?.id,
  });

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Category Not Found</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">The category you're looking for doesn't exist.</p>
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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "wts": return "Want To Sell";
      case "wtb": return "Want To Buy";
      case "wtt": return "Want To Trade";
      case "discussion": return "Discussion";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <Sidebar />
            </div>

            <div className="lg:col-span-3">
              {/* Category Header */}
              <div className="mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Link href="/">
                    <Button variant="outline" size="sm" data-testid="button-back">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  </Link>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h1 className="text-2xl font-bold text-forum-primary" data-testid="text-category-title">
                        {category.name}
                      </h1>
                      <Badge variant="outline" data-testid="text-category-type">
                        {getTypeLabel(category.type)}
                      </Badge>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300" data-testid="text-category-description">
                      {category.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500 dark:text-gray-400" data-testid="text-post-count">
                    {posts.length} {posts.length === 1 ? 'post' : 'posts'}
                  </div>
                  {user && (
                    <Link href={`/create-post?category=${category.id}`}>
                      <Button 
                        className="bg-forum-accent text-white hover:bg-forum-accent/90"
                        data-testid="button-create-post-category"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Post
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              {/* Legal Notice for Marketplace Categories */}
              {(category.type === "wts" || category.type === "wtb" || category.type === "wtt") && (
                <div className="mb-6 bg-forum-warning/10 border border-forum-warning/20 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <svg className="w-5 h-5 text-forum-warning mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-forum-warning mb-1">
                        California Law Compliance Required
                      </p>
                      <p className="text-xs text-forum-warning">
                        All firearm transfers must be conducted through licensed FFL dealers. Private party transfers are prohibited unless conducted through an FFL. 
                        This platform is for listings only and does not facilitate transactions.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Posts List */}
              <div className="space-y-4">
                {posts.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        <svg className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V8m10 0H7" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2" data-testid="text-no-posts-title">
                          No posts yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4" data-testid="text-no-posts-description">
                          Be the first to create a post in this category.
                        </p>
                        {user && (
                          <Link href={`/create-post?category=${category.id}`}>
                            <Button 
                              className="bg-forum-accent text-white hover:bg-forum-accent/90"
                              data-testid="button-create-first-post"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Create First Post
                            </Button>
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      category={category}
                      author={(post as any).author || { username: "Unknown User", id: post.authorId } as User}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
