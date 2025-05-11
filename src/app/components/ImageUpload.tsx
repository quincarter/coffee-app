import React, { useState, useEffect } from "react";
import { Loader2, Trash } from "lucide-react";
import { uploadImage } from "../utils/uploadImage";

type ImageUploadProps = {
  initialImage?: string | null;
  onImageUploaded: (imageUrl: string | null) => void;
  uploadContext: string;
  label?: string;
  height?: "sm" | "md" | "lg";
  isSmall?: boolean;
  className?: string;
};

export default function ImageUpload({
  initialImage = null,
  onImageUploaded,
  uploadContext,
  label = "Image (optional)",
  height = "md",
  isSmall = false,
  className = "",
}: ImageUploadProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialImage);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setImagePreview(initialImage);
  }, [initialImage]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      setError(null);

      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result as string;
        setImagePreview(preview);
      };
      reader.readAsDataURL(file);

      // Upload the image
      try {
        setIsUploading(true);
        const imageUrl = await uploadImage(file, uploadContext);
        onImageUploaded(imageUrl);
      } catch (err) {
        console.error("Error uploading image:", err);
        setError(err instanceof Error ? err.message : "Failed to upload image");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setError(null);
    onImageUploaded(null);
  };

  const heightClass = {
    sm: "h-32",
    md: "h-48",
    lg: "h-64",
  }[height];

  return (
    <div className={`${className}`}>
      <label htmlFor="image-upload" className="block text-sm font-medium mb-1">
        {label}
      </label>
      <div className="mt-1">
        <input
          type="file"
          id="image-upload"
          accept="image/*"
          onChange={handleImageChange}
          className={
            isSmall
              ? "file-input file-input-bordered file-input-sm w-full bg-white coffee:bg-gray-700 text-gray-700 coffee:text-gray-300 border-gray-300 coffee:border-gray-600"
              : "file-input file-input-bordered w-full bg-white coffee:bg-gray-700 text-gray-700 coffee:text-gray-300 border-gray-300 coffee:border-gray-600"
          }
          disabled={isUploading}
        />
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

      {imagePreview && (
        <div className="mt-3 relative rounded-lg overflow-hidden border border-gray-200 coffee:border-gray-700 shadow-sm">
          <div className={`${heightClass} w-full`}>
            <img
              src={imagePreview}
              alt="Image preview"
              className="w-full h-full object-cover"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-white/80 coffee:bg-gray-800/80 p-1 rounded-full shadow-sm hover:bg-white coffee:hover:bg-gray-800 transition-colors"
            aria-label="Remove image"
            disabled={isUploading}
          >
            <Trash className="h-4 w-4 text-red-500" />
          </button>
        </div>
      )}
    </div>
  );
}
