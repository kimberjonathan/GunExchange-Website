import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Category } from "@shared/schema";

interface MarketplaceTileProps {
  categories: Category[];
  postCounts: { [categoryId: string]: number };
  type: 'wts' | 'wtb' | 'wtt';
  title: string;
  description: string;
  icon: string;
  color: string;
}

const SUBCATEGORY_ORDER = ['handguns', 'long-guns', 'antique', 'ammo', 'parts'];

export default function MarketplaceTile({ 
  categories, 
  postCounts, 
  type, 
  title, 
  description, 
  icon, 
  color 
}: MarketplaceTileProps) {
  // Filter and sort subcategories for this marketplace type
  const subcategories = categories
    .filter(cat => cat.type === type)
    .sort((a, b) => {
      const aOrder = SUBCATEGORY_ORDER.findIndex(order => a.slug.includes(order));
      const bOrder = SUBCATEGORY_ORDER.findIndex(order => b.slug.includes(order));
      return aOrder - bOrder;
    });

  // Get total post count for this marketplace type
  const totalPosts = subcategories.reduce((total, cat) => {
    return total + (postCounts[cat.id] || 0);
  }, 0);

  const getSubcategoryDisplayName = (slug: string, name: string) => {
    if (slug.includes('handgun')) return 'Handguns';
    if (slug.includes('long-guns')) return 'Long Guns';
    if (slug.includes('antique')) return 'Antiques';
    if (slug.includes('ammo')) return 'Ammunition';
    if (slug.includes('parts')) return 'Parts & Accessories';
    return name;
  };

  return (
    <Card className="border-2 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${color}`}>
              <i className={`${icon} text-white text-xl`}></i>
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-forum-primary">
                {title}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {description}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${color} text-white`}>
              {totalPosts}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {subcategories.map((subcategory) => {
            const postCount = postCounts[subcategory.id] || 0;
            const displayName = getSubcategoryDisplayName(subcategory.slug, subcategory.name);
            
            return (
              <div key={subcategory.id} className="flex items-center justify-between">
                <Link 
                  href={`/category/${subcategory.slug}`}
                  className="text-forum-accent hover:text-forum-accent/80 font-medium text-sm transition-colors"
                  data-testid={`link-${subcategory.slug}`}
                >
                  {displayName}
                </Link>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                  {postCount}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <Link 
            href={`/posts?type=${type}`}
            className="text-forum-accent hover:text-forum-accent/80 font-medium text-sm flex items-center justify-center transition-colors"
            data-testid={`link-view-all-${type}`}
          >
            View all {type.toUpperCase()} listings →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}