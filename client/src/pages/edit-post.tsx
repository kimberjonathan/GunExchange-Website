import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { ObjectUploader } from "@/components/ObjectUploader";
import { apiRequest } from "@/lib/queryClient";

const editPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  categoryId: z.string().min(1, "Category is required"),
  price: z.string().optional(),
  location: z.string().optional(),
  contactInfo: z.string().optional(),
  images: z.array(z.string()).optional(),
  willingToTravel: z.boolean().optional(),
  willingToShip: z.boolean().optional(),
  willingToTrade: z.boolean().optional(),
});

type EditPostFormData = z.infer<typeof editPostSchema>;

export default function EditPost() {
  const [match, params] = useRoute("/posts/:id/edit");
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const postId = params?.id;

  // Fetch the post data
  const { data: post, isLoading: isLoadingPost } = useQuery<any>({
    queryKey: ["/api/posts", postId],
    enabled: !!postId,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ["/api/categories"],
  });

  const form = useForm<EditPostFormData>({
    resolver: zodResolver(editPostSchema),
    defaultValues: {
      title: "",
      content: "",
      categoryId: "",
      price: "",
      location: "",
      contactInfo: "",
      images: [],
      willingToTravel: false,
      willingToShip: false,
      willingToTrade: false,
    },
  });

  // Update form when post data loads
  useEffect(() => {
    if (post) {
      // Check if user owns this post
      if (post.authorId !== user?.id) {
        toast({
          title: "Access Denied",
          description: "You can only edit your own posts.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      form.reset({
        title: post.title,
        content: post.content,
        categoryId: post.categoryId,
        price: post.price ? (post.price / 100).toString() : "",
        location: post.location || "",
        contactInfo: post.contactInfo || "",
        images: post.images || [],
        willingToTravel: post.willingToTravel || false,
        willingToShip: post.willingToShip || false,
        willingToTrade: post.willingToTrade || false,
      });
      setUploadedImages(post.images || []);
    }
  }, [post, user, form, toast, navigate]);

  const updatePostMutation = useMutation({
    mutationFn: async (data: EditPostFormData) => {
      const formattedData = {
        ...data,
        price: data.price ? Math.round(parseFloat(data.price) * 100) : undefined,
        images: uploadedImages,
        authorId: user?.id,
        willingToTravel: data.willingToTravel || false,
        willingToShip: data.willingToShip || false,
        willingToTrade: data.willingToTrade || false,
      };
      
      const response = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update post");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Post updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts", postId] });
      navigate(`/posts/${postId}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update post",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditPostFormData) => {
    updatePostMutation.mutate(data);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <p>You must be logged in to edit posts.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!match || !postId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <p>Post not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoadingPost) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <p>Loading post...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Post</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Post title" {...field} data-testid="input-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((category: any) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your item or request..."
                        rows={6}
                        {...field}
                        data-testid="textarea-content"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (USD)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} data-testid="input-price" />
                    </FormControl>
                    <FormDescription>Optional: Enter price for WTS listings</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="City, State" {...field} data-testid="input-location" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Information</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="How should interested parties contact you?"
                        rows={3}
                        {...field}
                        data-testid="textarea-contact"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Delivery Options - Only show for marketplace posts */}
              {categories.find(cat => cat.id === form.watch("categoryId"))?.type && 
               ["wts", "wtb", "wtt"].includes(categories.find(cat => cat.id === form.watch("categoryId"))?.type) && (
                <div>
                  <FormLabel className="text-base font-medium">Delivery Options</FormLabel>
                  <FormDescription className="mb-4">
                    Select how you're willing to handle this transaction
                  </FormDescription>
                  
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="willingToTravel"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-willing-to-travel"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-normal cursor-pointer">
                              Willing to Travel
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="willingToShip"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-willing-to-ship"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-normal cursor-pointer">
                              Willing to Ship
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="willingToTrade"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-willing-to-trade"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-normal cursor-pointer">
                              Willing to Trade
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              <div>
                <FormLabel>Images</FormLabel>
                <FormDescription className="mb-4">
                  Upload up to 5 images (optional)
                </FormDescription>
                {uploadedImages.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Current images:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {uploadedImages.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`Post image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md border"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setUploadedImages(prev => prev.filter((_, i) => i !== index));
                              toast({
                                title: "Image Removed",
                                description: "Image has been removed from your post",
                              });
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <ObjectUploader
                    maxNumberOfFiles={5 - uploadedImages.length}
                    maxFileSize={5 * 1024 * 1024} // 5MB limit
                    onGetUploadParameters={async () => {
                      console.log('Getting upload parameters...');
                      try {
                        const response = await fetch("/api/objects/upload", {
                          method: "POST",
                        });
                        
                        if (!response.ok) {
                          console.error('Failed to get upload URL:', response.status, response.statusText);
                          throw new Error(`Failed to get upload URL: ${response.status}`);
                        }
                        
                        const data = await response.json();
                        console.log('Got upload URL:', data.uploadURL?.substring(0, 100) + '...');
                        return {
                          method: "PUT" as const,
                          url: data.uploadURL,
                        };
                      } catch (error) {
                        console.error('Error getting upload parameters:', error);
                        throw error;
                      }
                    }}
                    onComplete={(result) => {
                      console.log('Upload complete. Result:', {
                        successful: result.successful?.length || 0,
                        failed: result.failed?.length || 0
                      });
                      
                      const successfulUploads = result.successful || [];
                      const failedUploads = result.failed || [];
                      
                      if (failedUploads.length > 0) {
                        console.error('Upload failures:', failedUploads.map(f => ({
                          name: f.name,
                          error: f.error || 'Unknown error'
                        })));
                        toast({
                          title: "Upload Error",
                          description: `${failedUploads.length} file(s) failed to upload. Check console for details.`,
                          variant: "destructive",
                        });
                        return; // Don't proceed if there are failures
                      }
                      
                      if (successfulUploads.length > 0) {
                        console.log('Processing successful uploads:', successfulUploads.map(u => ({
                          name: u.name,
                          uploadURL: u.uploadURL?.substring(0, 100) + '...'
                        })));
                        
                        const newUrls = successfulUploads
                          .map(upload => upload.uploadURL?.split('?')[0])
                          .filter(Boolean) as string[];
                        
                        console.log('Extracted clean URLs:', newUrls);
                        
                        if (newUrls.length > 0) {
                          setUploadedImages(prev => {
                            const updated = [...prev, ...newUrls];
                            console.log('Updated uploadedImages state:', updated);
                            return updated;
                          });
                          toast({
                            title: "Images Uploaded",
                            description: `${newUrls.length} image(s) uploaded successfully. Don't forget to save your post!`,
                          });
                        } else {
                          console.warn('No valid URLs extracted from successful uploads');
                        }
                      } else {
                        console.log('No successful uploads to process');
                      }
                    }}
                  >
                    Add Images ({uploadedImages.length}/5)
                  </ObjectUploader>
                  <p className="text-xs text-gray-500">
                    Maximum 5 images, 5MB each. Supported formats: JPG, PNG, GIF
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={updatePostMutation.isPending}
                  data-testid="button-submit"
                >
                  {updatePostMutation.isPending ? "Updating..." : "Update Post"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/posts/${postId}`)}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}