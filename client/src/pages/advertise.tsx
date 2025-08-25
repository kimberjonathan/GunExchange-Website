import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Megaphone, 
  Target, 
  DollarSign, 
  Calendar,
  Star,
  TrendingUp,
  Users,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdvertiseFormData {
  title: string;
  description: string;
  targetUrl: string;
  sponsor: string;
  sponsorEmail: string;
  position: string;
  size: string;
  monthlyBudget: number;
}

export default function AdvertisePage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<AdvertiseFormData>({
    defaultValues: {
      position: "sidebar",
      size: "medium",
    }
  });

  const selectedPosition = watch("position");
  const selectedSize = watch("size");
  const monthlyBudget = watch("monthlyBudget");

  const onSubmit = async (data: AdvertiseFormData) => {
    setIsSubmitting(true);
    try {
      // Here you would submit to your API
      toast({
        title: "Advertisement Request Submitted",
        description: "We'll review your advertisement and contact you within 24 hours.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit advertisement request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPositionPrice = (position: string, size: string) => {
    const basePrice = {
      header: { small: 200, medium: 350, large: 500 },
      sidebar: { small: 150, medium: 250, large: 400 },
      footer: { small: 100, medium: 180, large: 300 },
      "in-feed": { small: 300, medium: 500, large: 750 },
    };
    
    return basePrice[position as keyof typeof basePrice]?.[size as keyof typeof basePrice.header] || 0;
  };

  const monthlyPrice = getPositionPrice(selectedPosition, selectedSize);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <Megaphone className="w-12 h-12 text-forum-accent mr-3" />
          <h1 className="text-4xl font-bold text-forum-primary">
            Advertise with CA Gun Exchange
          </h1>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Reach California's firearm community with targeted advertising that connects you with 
          genuine buyers, sellers, and enthusiasts in the Golden State.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-forum-accent mx-auto mb-2" />
            <div className="text-2xl font-bold text-forum-primary">5,000+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Members</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Eye className="w-8 h-8 text-forum-accent mx-auto mb-2" />
            <div className="text-2xl font-bold text-forum-primary">50K+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Monthly Views</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-forum-accent mx-auto mb-2" />
            <div className="text-2xl font-bold text-forum-primary">200+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Daily Posts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Target className="w-8 h-8 text-forum-accent mx-auto mb-2" />
            <div className="text-2xl font-bold text-forum-primary">CA Only</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Targeted Audience</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Advertising Options */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-forum-primary">Advertising Options</h2>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-500" />
                  Banner Advertising
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Display your business prominently across our platform with eye-catching banner ads.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Header Banner:</span>
                    <span className="font-semibold">$200-500/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sidebar Banner:</span>
                    <span className="font-semibold">$150-400/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span>In-Feed Ads:</span>
                    <span className="font-semibold">$300-750/month</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                  Featured Listings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Promote specific listings to the top of relevant categories.
                </p>
                <div className="flex justify-between">
                  <span>Featured Post:</span>
                  <span className="font-semibold">$25/day</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-500" />
                  Category Sponsorship
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Sponsor entire categories and display your branding prominently.
                </p>
                <div className="flex justify-between">
                  <span>Category Sponsorship:</span>
                  <span className="font-semibold">$500-1000/month</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Get Started with Advertising</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sponsor">Business Name</Label>
                    <Input
                      id="sponsor"
                      {...register("sponsor", { required: "Business name is required" })}
                      placeholder="Your Business Name"
                    />
                    {errors.sponsor && (
                      <p className="text-sm text-red-600 mt-1">{errors.sponsor.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="sponsorEmail">Email</Label>
                    <Input
                      id="sponsorEmail"
                      type="email"
                      {...register("sponsorEmail", { required: "Email is required" })}
                      placeholder="your@business.com"
                    />
                    {errors.sponsorEmail && (
                      <p className="text-sm text-red-600 mt-1">{errors.sponsorEmail.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="title">Advertisement Title</Label>
                  <Input
                    id="title"
                    {...register("title", { required: "Title is required" })}
                    placeholder="Your ad title"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register("description", { required: "Description is required" })}
                    placeholder="Describe your business and what you offer"
                    rows={3}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="targetUrl">Website URL</Label>
                  <Input
                    id="targetUrl"
                    type="url"
                    {...register("targetUrl", { required: "Website URL is required" })}
                    placeholder="https://yourbusiness.com"
                  />
                  {errors.targetUrl && (
                    <p className="text-sm text-red-600 mt-1">{errors.targetUrl.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Ad Position</Label>
                    <Select value={selectedPosition} onValueChange={(value) => setValue("position", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="header">Header Banner</SelectItem>
                        <SelectItem value="sidebar">Sidebar Banner</SelectItem>
                        <SelectItem value="footer">Footer Banner</SelectItem>
                        <SelectItem value="in-feed">In-Feed Ad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Ad Size</Label>
                    <Select value={selectedSize} onValueChange={(value) => setValue("size", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {monthlyPrice > 0 && (
                  <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-green-800 dark:text-green-200 font-medium">
                        Estimated Monthly Rate:
                      </span>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                        <span className="text-xl font-bold text-green-600">
                          {monthlyPrice}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                  data-testid="button-submit-ad-request"
                >
                  {isSubmitting ? "Submitting..." : "Request Advertising Quote"}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Next Steps:</strong> Our advertising team will review your request and contact you 
                  within 24 hours with a customized proposal and creative requirements.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}