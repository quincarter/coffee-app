"use client";

import { useState, FormEvent, ChangeEvent, useEffect } from "react";

type BrewingDevice = {
  id: string;
  name: string;
  description: string;
  image: string;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  onDeviceAdded: (device: BrewingDevice) => void;
  initialDevice?: BrewingDevice;
  isEditing?: boolean;
};

export default function BrewingDeviceForm({ 
  onDeviceAdded, 
  initialDevice, 
  isEditing = false 
}: Props) {
  const [formData, setFormData] = useState({
    name: initialDevice?.name || "",
    description: initialDevice?.description || "",
    image: initialDevice?.image || "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadMethod, setUploadMethod] = useState<"url" | "file">(
    initialDevice?.image ? "url" : "url"
  );

  useEffect(() => {
    if (initialDevice) {
      setFormData({
        name: initialDevice.name,
        description: initialDevice.description,
        image: initialDevice.image,
      });
    }
  }, [initialDevice]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      let imageUrl = formData.image;

      // If using file upload, upload the file first
      if (uploadMethod === "file" && imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", imageFile);
        uploadFormData.append("context", "brewing-device"); // Add context for brewing device uploads

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image");
        }

        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.url;
      }

      // Create or update the brewing device
      const url = isEditing 
        ? `/api/brewing-devices/${initialDevice?.id}` 
        : "/api/brewing-devices";
      
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          image: imageUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isEditing ? 'update' : 'create'} brewing device`);
      }

      const deviceData = await response.json();
      onDeviceAdded(deviceData);

      // Reset form if not editing
      if (!isEditing) {
        setFormData({
          name: "",
          description: "",
          image: "",
        });
        setImageFile(null);
      }
    } catch (err) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} brewing device:`, err);
      setError(
        err instanceof Error ? err.message : `Failed to ${isEditing ? 'update' : 'create'} brewing device`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {!isEditing && <h3 className="mb-4 text-lg font-medium">Add New Brewing Device</h3>}

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 coffee:border-gray-700 coffee:bg-gray-800"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="description" className="mb-1 block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 coffee:border-gray-700 coffee:bg-gray-800"
        />
      </div>

      <div className="mb-4">
        <div className="mb-2">
          <span className="block text-sm font-medium">Image</span>
          <div className="mt-1 flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setUploadMethod("url")}
              className={`rounded-md px-3 py-1 text-sm ${
                uploadMethod === "url"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              URL
            </button>
            <button
              type="button"
              onClick={() => setUploadMethod("file")}
              className={`rounded-md px-3 py-1 text-sm ${
                uploadMethod === "file"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Upload File
            </button>
          </div>
        </div>

        {uploadMethod === "url" ? (
          <div>
            <label htmlFor="image" className="mb-1 block text-sm font-medium">
              Image URL
            </label>
            <input
              type="url"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 coffee:border-gray-700 coffee:bg-gray-800"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        ) : (
          <div>
            <label
              htmlFor="imageFile"
              className="mb-1 block text-sm font-medium"
            >
              Upload Image
            </label>
            <input
              type="file"
              id="imageFile"
              accept="image/*"
              onChange={handleFileChange}
              required={!formData.image}
              className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 coffee:border-gray-700 coffee:bg-gray-800"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting 
            ? (isEditing ? "Updating..." : "Creating...") 
            : (isEditing ? "Update Device" : "Create Device")}
        </button>
      </div>
    </form>
  );
}
