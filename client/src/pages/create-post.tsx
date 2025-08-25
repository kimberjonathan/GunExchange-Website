import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Upload, X } from "lucide-react";
import { insertPostSchema, type InsertPost } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { ObjectUploader } from "@/components/ObjectUploader";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import type { Category } from "@shared/schema";
import type { UploadResult } from "@uppy/core";

export default function CreatePost() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [error, setError] = useState<string>("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // Get category from URL params if provided
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedCategoryId = urlParams.get('category');

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const form = useForm<InsertPost>({
    resolver: zodResolver(insertPostSchema),
    defaultValues: {
      title: "",
      content: "",
      categoryId: preselectedCategoryId || "",
      price: undefined,
      location: "",
      contactInfo: "",
      willingToTravel: false,
      willingToShip: false,
    },
  });

  const selectedCategoryId = form.watch("categoryId");
  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
  const isMarketplace = selectedCategory?.type === "wts" || selectedCategory?.type === "wtb" || selectedCategory?.type === "wtt";

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a post.",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [user, setLocation, toast]);

  const handleGetUploadParameters = async () => {
    try {
      const data = await apiRequest("/api/objects/upload", { method: "POST" });
      return {
        method: "PUT" as const,
        url: data.uploadURL,
      };
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Failed to get upload URL",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUploadComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const newImageUrls = result.successful.map((file) => file.uploadURL as string);
      setUploadedImages(prev => [...prev, ...newImageUrls]);
      
      toast({
        title: "Images uploaded successfully!",
        description: `${result.successful.length} image(s) uploaded.`,
      });
    }
  };

  const removeImage = (indexToRemove: number) => {
    setUploadedImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const createPostMutation = useMutation({
    mutationFn: async (postData: InsertPost & { authorId: string; images?: string[] }) => {
      const response = await apiRequest("/api/posts", { method: "POST", body: postData });
      return response;
    },
    onSuccess: (post) => {
      toast({
        title: "Post created successfully!",
        description: "Your post has been published.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setLocation(`/posts/${post.id}`);
    },
    onError: (error: any) => {
      setError(error.message || "Failed to create post");
    },
  });

  const onSubmit = (data: InsertPost) => {
    if (!user) return;
    
    setError("");
    
    const postData = {
      ...data,
      authorId: user.id,
      price: data.price ? Math.round(data.price * 100) : undefined, // Convert to cents
      images: uploadedImages,
    };
    
    createPostMutation.mutate(postData);
  };

  if (!user) {
    return null; // Will redirect in useEffect
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

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-forum-primary">Create New Post</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category *</Label>
                  <Select 
                    value={form.watch("categoryId")} 
                    onValueChange={(value) => form.setValue("categoryId", value)}
                    data-testid="select-category"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.type.toUpperCase()} - {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.categoryId && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.categoryId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Enter a descriptive title"
                    {...form.register("title")}
                    data-testid="input-title"
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Description *</Label>
                  <Textarea
                    id="content"
                    placeholder="Provide detailed information..."
                    rows={6}
                    {...form.register("content")}
                    data-testid="textarea-content"
                  />
                  {form.formState.errors.content && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.content.message}
                    </p>
                  )}
                </div>

                {/* Image Upload Section */}
                <div className="space-y-4">
                  <Label>Images (Up to 5)</Label>
                  <div className="space-y-4">
                    {uploadedImages.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {uploadedImages.map((imageUrl, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={imageUrl}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImage(index)}
                              data-testid={`button-remove-image-${index}`}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {uploadedImages.length < 5 && (
                      <ObjectUploader
                        maxNumberOfFiles={5 - uploadedImages.length}
                        maxFileSize={10485760} // 10MB
                        onGetUploadParameters={handleGetUploadParameters}
                        onComplete={(result: any) => handleUploadComplete(result)}
                        buttonClassName="w-full"
                      >
                        <div className="flex items-center justify-center space-x-2 py-4">
                          <Upload className="w-5 h-5" />
                          <span>
                            {uploadedImages.length === 0 
                              ? "Upload Images" 
                              : `Add More Images (${uploadedImages.length}/5)`
                            }
                          </span>
                        </div>
                      </ObjectUploader>
                    )}
                    
                    <p className="text-xs text-gray-500">
                      Supported formats: JPG, PNG, GIF. Maximum file size: 10MB per image.
                    </p>
                  </div>
                </div>

                {isMarketplace && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="price">
                        {selectedCategory?.type === "wts" ? "Price *" : 
                         selectedCategory?.type === "wtb" ? "Price (Budget)" : 
                         "Value (Optional)"}
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...form.register("price", { valueAsNumber: true })}
                        data-testid="input-price"
                      />
                      {form.formState.errors.price && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.price.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        type="text"
                        placeholder="e.g., Los Angeles, CA"
                        {...form.register("location")}
                        data-testid="input-location"
                      />
                      {form.formState.errors.location && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.location.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactInfo">Contact Information</Label>
                      <Input
                        id="contactInfo"
                        type="text"
                        placeholder="How should interested parties contact you?"
                        {...form.register("contactInfo")}
                        data-testid="input-contact"
                      />
                      {form.formState.errors.contactInfo && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.contactInfo.message}
                        </p>
                      )}
                    </div>

                    {/* Travel and Shipping Options */}
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <Label className="text-base font-medium">Delivery Options</Label>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="willingToTravel"
                            checked={form.watch("willingToTravel")}
                            onCheckedChange={(checked) => form.setValue("willingToTravel", checked as boolean)}
                            data-testid="checkbox-willing-to-travel"
                          />
                          <Label 
                            htmlFor="willingToTravel" 
                            className="text-sm font-normal cursor-pointer"
                          >
                            Willing to Travel
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="willingToShip"
                            checked={form.watch("willingToShip")}
                            onCheckedChange={(checked) => form.setValue("willingToShip", checked as boolean)}
                            data-testid="checkbox-willing-to-ship"
                          />
                          <Label 
                            htmlFor="willingToShip" 
                            className="text-sm font-normal cursor-pointer"
                          >
                            Willing to Ship
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="willingToTrade"
                            checked={form.watch("willingToTrade")}
                            onCheckedChange={(checked) => form.setValue("willingToTrade", checked as boolean)}
                            data-testid="checkbox-willing-to-trade"
                          />
                          <Label 
                            htmlFor="willingToTrade" 
                            className="text-sm font-normal cursor-pointer"
                          >
                            Willing to Trade
                          </Label>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {isMarketplace && (
                  <div className="bg-forum-warning/10 border border-forum-warning/20 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <svg className="w-5 h-5 text-forum-warning mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-forum-warning mb-1">
                          Important Legal Notice
                        </p>
                        <p className="text-xs text-forum-warning">
                          All firearm transfers must be conducted through licensed FFL dealers in accordance with California law. 
                          By posting, you agree to comply with all applicable federal, state, and local laws.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    className="bg-forum-accent text-white hover:bg-forum-accent/90"
                    disabled={createPostMutation.isPending}
                    data-testid="button-submit"
                  >
                    {createPostMutation.isPending ? "Creating..." : "Create Post"}
                  </Button>
                  <Link href="/">
                    <Button type="button" variant="outline" data-testid="button-cancel">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
