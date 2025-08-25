import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Category } from "@shared/schema";

interface CategoryCardProps {
  category: Category;
  postCount?: number;
}

export default function CategoryCard({ category, postCount = 0 }: CategoryCardProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "wts":
        return (
          <svg className="w-5 h-5 mr-2 text-forum-accent" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
        );
      case "wtb":
        return (
          <svg className="w-5 h-5 mr-2 text-forum-accent" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        );
      case "wtt":
        return (
          <svg className="w-5 h-5 mr-2 text-forum-accent" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 5a1 1 0 100 2v3a1 1 0 001 1h3a1 1 0 100-2H9V7a3 3 0 10-1-2zM15 6a1 1 0 10-2 0 1 1 0 002 0zm-4 8a1 1 0 100 2 1 1 0 000-2z" />
            <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm0 2h12v12H4V4z" clipRule="evenodd" />
          </svg>
        );
      case "discussion":
        return (
          <svg className="w-5 h-5 mr-2 text-forum-accent" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "wts": return "WTS";
      case "wtb": return "WTB";
      case "wtt": return "WTT";
      case "discussion": return "Discussion";
      default: return "";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow" data-testid={`card-category-${category.slug}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-lg text-forum-primary flex items-center">
            {getIcon(category.type)}
            {getTypeLabel(category.type)} {category.name}
          </CardTitle>
          <Badge variant="default" className="bg-forum-accent text-white" data-testid={`badge-count-${category.slug}`}>
            {postCount}
          </Badge>
        </div>
        <p className="text-gray-600 text-sm mb-4" data-testid={`text-description-${category.slug}`}>
          {category.description}
        </p>
        <Link 
          href={`/category/${category.slug}`}
          className="text-forum-accent hover:text-forum-accent/80 font-medium text-sm"
          data-testid={`link-view-category-${category.slug}`}
        >
          View all listings →
        </Link>
      </CardContent>
    </Card>
  );
}
