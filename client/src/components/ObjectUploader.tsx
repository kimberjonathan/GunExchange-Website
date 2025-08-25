import { useState, useRef } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (result: { successful: Array<{ uploadURL: string; name: string }>, failed: Array<any> }) => void;
  buttonClassName?: string;
  children: ReactNode;
}

/**
 * A file upload component that renders as a button and provides a modal interface for
 * file management.
 * 
 * Features:
 * - Renders as a customizable button that opens a file upload modal
 * - Provides a modal interface for:
 *   - File selection
 *   - File preview
 *   - Upload progress tracking
 *   - Upload status display
 * 
 * The component uses Uppy under the hood to handle all file upload functionality.
 * All file management features are automatically handled by the Uppy dashboard modal.
 * 
 * @param props - Component props
 * @param props.maxNumberOfFiles - Maximum number of files allowed to be uploaded
 *   (default: 1)
 * @param props.maxFileSize - Maximum file size in bytes (default: 10MB)
 * @param props.onGetUploadParameters - Function to get upload parameters (method and URL).
 *   Typically used to fetch a presigned URL from the backend server for direct-to-S3
 *   uploads.
 * @param props.onComplete - Callback function called when upload is complete. Typically
 *   used to make post-upload API calls to update server state and set object ACL
 *   policies.
 * @param props.buttonClassName - Optional CSS class name for the button
 * @param props.children - Content to be rendered inside the button
 */
export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760, // 10MB default
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
}: ObjectUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    console.log('Selected files:', files.map(f => f.name));
    
    // Validate file count
    if (files.length > maxNumberOfFiles) {
      toast({
        title: "Too Many Files",
        description: `Maximum ${maxNumberOfFiles} files allowed`,
        variant: "destructive",
      });
      return;
    }

    // Validate file sizes and types
    const invalidFiles = files.filter(file => 
      file.size > maxFileSize || !file.type.startsWith('image/')
    );
    
    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid Files",
        description: `Files must be images under ${Math.round(maxFileSize / 1024 / 1024)}MB`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const successful: Array<{ uploadURL: string; name: string }> = [];
    const failed: Array<any> = [];

    for (const file of files) {
      try {
        console.log('Getting upload parameters for:', file.name);
        const params = await onGetUploadParameters();
        console.log('Got upload URL for', file.name, ':', params.url.substring(0, 100) + '...');

        console.log('Starting upload for:', file.name);
        const response = await fetch(params.url, {
          method: params.method,
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (response.ok) {
          const uploadURL = params.url.split('?')[0]; // Remove query parameters
          // Convert to the local serving URL
          const objectPath = uploadURL.replace(/^.*\/public\//, '/public-objects/');
          console.log('Upload successful for:', file.name, 'Original URL:', uploadURL, 'Served as:', objectPath);
          successful.push({ uploadURL: objectPath, name: file.name });
        } else {
          console.error('Upload failed for:', file.name, 'Status:', response.status);
          failed.push({ name: file.name, error: `HTTP ${response.status}` });
        }
      } catch (error) {
        console.error('Upload error for:', file.name, error);
        failed.push({ name: file.name, error: (error as Error).message || 'Upload failed' });
      }
    }

    setIsUploading(false);
    console.log('Upload complete. Successful:', successful.length, 'Failed:', failed.length);
    
    if (onComplete) {
      onComplete({ successful, failed });
    }

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={maxNumberOfFiles > 1}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      <Button 
        type="button"
        onClick={() => fileInputRef.current?.click()} 
        className={buttonClassName}
        disabled={isUploading}
      >
        {isUploading ? 'Uploading...' : children}
      </Button>
    </div>
  );
}