import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MessageSquare, Calendar, DollarSign, ArrowLeft, MapPin, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Post, Category } from "@shared/schema";

interface SearchResult {
  posts: any[];
  users: any[];
  totalResults: number;
}

export default function SearchPage() {
  const [location, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentQuery, setCurrentQuery] = useState("");

  // Get search query from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';
    setSearchTerm(query);
    setCurrentQuery(query);
  }, [location]);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: searchResults, isLoading } = useQuery<SearchResult>({
    queryKey: ["/api/search", currentQuery],
    enabled: !!currentQuery.trim(),
    queryFn: async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(currentQuery)}`, {
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error(`Search failed: ${res.status}`);
      }
      
      return res.json();
    },
  });

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      const newQuery = searchTerm.trim();
      setCurrentQuery(newQuery);
      navigate(`/search?q=${encodeURIComponent(newQuery)}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          onClick={() => navigate("/")} 
          variant="outline" 
          size="sm"
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Forum
        </Button>

        <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search posts, titles, users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12"
              data-testid="input-search-page"
            />
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2"
              data-testid="button-search-page"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>

      {currentQuery && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Search Results for "{currentQuery}"
          </h1>
          {searchResults && (
            <p className="text-gray-600 dark:text-gray-400">
              Found {searchResults.totalResults} result{searchResults.totalResults !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}

      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-forum-primary"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Searching...</p>
        </div>
      )}

      {searchResults && searchResults.users.length > 0 && (
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Users</h2>
          {searchResults.users.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-forum-primary rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Link 
                        href={`/user/${user.id}`} 
                        className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        data-testid={`link-user-${user.id}`}
                      >
                        {user.username}
                      </Link>
                      {user.isVerified && (
                        <Badge variant="secondary" className="text-xs">Verified</Badge>
                      )}
                    </div>
                    {(user.firstName || user.lastName) && (
                      <p className="text-gray-600 dark:text-gray-400">
                        {user.firstName} {user.lastName}
                      </p>
                    )}
                    {user.location && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {user.location}
                      </p>
                    )}
                    {user.bio && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {user.bio}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {searchResults && searchResults.posts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Posts</h2>
          {searchResults.posts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="mb-2">
                    {getCategoryName(post.categoryId)}
                  </Badge>
                  {post.price && (
                    <div className="flex items-center text-green-600 font-semibold">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {post.price}
                    </div>
                  )}
                </div>
                <CardTitle className="text-lg">
                  <Link 
                    href={`/posts/${post.id}`} 
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                    data-testid={`link-post-${post.id}`}
                  >
                    {post.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                  {post.content}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span>By {(post as any).username || 'Anonymous'}</span>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : 'Unknown date'}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {(post as any).replyCount || 0} replies
                    </div>
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {post.views || 0} views
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {searchResults && searchResults.posts.length === 0 && searchResults.users.length === 0 && currentQuery && !isLoading && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No results found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Try different keywords or check your spelling
          </p>
          <Button 
            onClick={() => navigate("/")} 
            variant="outline"
            data-testid="button-browse-forum"
          >
            Browse Forum
          </Button>
        </div>
      )}

      {!currentQuery && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Search the Forum</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Enter keywords to find posts, discussions, and users
          </p>
        </div>
      )}
    </div>
  );
}