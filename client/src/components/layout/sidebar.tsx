import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Category } from "@shared/schema";

export default function Sidebar() {
  const [location] = useLocation();
  
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: stats } = useQuery<{
    totalMembers: number;
    activeListings: number;
    postsToday: number;
  }>({
    queryKey: ["/api/stats"],
  });

  const wtsCategories = categories.filter(cat => cat.type === "wts");
  const wtbCategories = categories.filter(cat => cat.type === "wtb");
  const wttCategories = categories.filter(cat => cat.type === "wtt");
  const discussionCategories = categories.filter(cat => cat.type === "discussion");

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="bg-forum-primary dark:bg-gray-700 text-white">
          <CardTitle className="text-base font-semibold">Forum Categories</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div>
            <h3 className="font-semibold text-forum-secondary dark:text-gray-200 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-2 text-forum-accent" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              Marketplace (WTS)
            </h3>
            <ul className="space-y-1 ml-6">
              {wtsCategories.map((category) => (
                <li key={category.id}>
                  <Link 
                    href={`/category/${category.slug}`}
                    className="text-gray-600 dark:text-gray-300 hover:text-forum-accent transition-colors"
                    data-testid={`link-category-${category.slug}`}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-forum-secondary dark:text-gray-200 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-2 text-forum-accent" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              Looking For (WTB)
            </h3>
            <ul className="space-y-1 ml-6">
              {wtbCategories.map((category) => (
                <li key={category.id}>
                  <Link 
                    href={`/category/${category.slug}`}
                    className="text-gray-600 dark:text-gray-300 hover:text-forum-accent transition-colors"
                    data-testid={`link-category-${category.slug}`}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-forum-secondary dark:text-gray-200 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-2 text-forum-accent" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 5a1 1 0 100 2v3a1 1 0 001 1h3a1 1 0 100-2H9V7a3 3 0 10-1-2zM15 6a1 1 0 10-2 0 1 1 0 002 0zm-4 8a1 1 0 100 2 1 1 0 000-2z" />
                <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm0 2h12v12H4V4z" clipRule="evenodd" />
              </svg>
              Want To Trade (WTT)
            </h3>
            <ul className="space-y-1 ml-6">
              {wttCategories.map((category) => (
                <li key={category.id}>
                  <Link 
                    href={`/category/${category.slug}`}
                    className="text-gray-600 dark:text-gray-300 hover:text-forum-accent transition-colors"
                    data-testid={`link-category-${category.slug}`}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-forum-secondary dark:text-gray-200 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-2 text-forum-accent" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              Discussion
            </h3>
            <ul className="space-y-1 ml-6">
              {discussionCategories.map((category) => (
                <li key={category.id}>
                  <Link 
                    href={`/category/${category.slug}`}
                    className="text-gray-600 dark:text-gray-300 hover:text-forum-accent transition-colors"
                    data-testid={`link-category-${category.slug}`}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-forum-secondary dark:text-gray-200">Forum Stats</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Total Members:</span>
              <span className="font-medium dark:text-white" data-testid="text-total-members">
                {stats?.totalMembers?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Active Listings:</span>
              <span className="font-medium dark:text-white" data-testid="text-active-listings">
                {stats?.activeListings?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Posts Today:</span>
              <span className="font-medium dark:text-white" data-testid="text-posts-today">
                {stats?.postsToday?.toLocaleString() || 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
