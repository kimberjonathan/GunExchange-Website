import { useState } from "react";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, User } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { UploadResult } from "@uppy/core";

interface ProfilePictureUploaderProps {
  currentProfilePicture?: string;
  userInitials: string;
  userId: string;
  className?: string;
}

export function ProfilePictureUploader({
  currentProfilePicture,
  userInitials,
  userId,
  className = ""
}: ProfilePictureUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const updateProfilePictureMutation = useMutation({
    mutationFn: async (profilePictureURL: string) => {
      const response = await fetch("/api/profile-picture", {
        method: "PUT",
        body: JSON.stringify({ profilePictureURL }),
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile picture");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      setIsUploading(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile picture",
        variant: "destructive",
      });
      setIsUploading(false);
    },
  });

  const handleGetUploadParameters = async () => {
    const response = await fetch("/api/profile-picture/upload", {
      method: "POST",
      headers: {
        "x-user-id": userId,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get upload URL");
    }

    const data = await response.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const handleComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      const uploadURL = uploadedFile.uploadURL;
      
      if (uploadURL) {
        setIsUploading(true);
        updateProfilePictureMutation.mutate(uploadURL);
      }
    }
  };

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <div className="relative">
        <Avatar className="w-32 h-32">
          <AvatarImage 
            src={currentProfilePicture} 
            alt="Profile picture"
          />
          <AvatarFallback className="text-2xl bg-gray-200 dark:bg-gray-700">
            {userInitials}
          </AvatarFallback>
        </Avatar>
        
        <div className="absolute bottom-0 right-0">
          <ObjectUploader
            maxNumberOfFiles={1}
            maxFileSize={5242880} // 5MB limit for profile pictures
            onGetUploadParameters={handleGetUploadParameters}
            onComplete={handleComplete}
            buttonClassName="rounded-full p-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          >
            <Camera className="w-4 h-4" />
          </ObjectUploader>
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Click the camera icon to upload a new profile picture
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          Max size: 5MB. Supported formats: JPG, PNG
        </p>
      </div>
      
      {isUploading && (
        <p className="text-sm text-blue-600 dark:text-blue-400">
          Uploading profile picture...
        </p>
      )}
    </div>
  );
}