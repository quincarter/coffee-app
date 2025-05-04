"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import Image from "next/image";

type BrewingDevice = {
  id: string;
  name: string;
  description: string;
  image: string;
};

type UserBrewingDevice = {
  id: string;
  name: string;
  description: string;
  brewingDeviceId: string;
  image?: string;
  brewingDevice: {
    name: string;
    image: string;
  };
  createdAt: string;
  updatedAt: string;
};

type Props = {
  userId: string;
  onDeviceAdded: (device: UserBrewingDevice) => void;
  initialDevice?: UserBrewingDevice;
  isEditing?: boolean;
};

export default function AddBrewingDeviceForm({ 
  userId, 
  onDeviceAdded, 
  initialDevice, 
  isEditing = false 
}: Props) {
  const [availableDevices, setAvailableDevices] = useState<BrewingDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadMethod, setUploadMethod] = useState<"none" | "file">("none");

  const [formData, setFormData] = useState({
    name: initialDevice?.name || "",
    description: initialDevice?.description || "",
    brewingDeviceId: initialDevice?.brewingDeviceId || "",
    image: initialDevice?.image || "",
  });

  useEffect(() => {
    async function fetchBrewingDevices() {
      try {
        const response = await fetch("/api/brewing-devices");
        if (!response.ok) {
          throw new Error("Failed to fetch brewing devices");
        }
        const data = await response.json();
        setAvailableDevices(data);
      } catch (err) {
        console.error("Error fetching brewing devices:", err);
        setError("Failed to load brewing devices. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchBrewingDevices();
  }, []);

  useEffect(() => {
    if (initialDevice) {
      setFormData({
        name: initialDevice.name,
        description: initialDevice.description || "",
        brewingDeviceId: initialDevice.brewingDeviceId,
        image: initialDevice.image || "",
      });
      
      if (initialDevice.image) {
        setImagePreview(initialDevice.image);
        setUploadMethod("file");
      }
    }
  }, [initialDevice]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
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

      const url = isEditing 
        ? `/api/user-brewing-devices/${initialDevice?.id}` 
        : "/api/user-brewing-devices";
      
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          image: imageUrl,
          userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isEditing ? 'update' : 'add'} brewing device`);
      }

      const deviceData = await response.json();
      onDeviceAdded(deviceData);
    } catch (err) {
      console.error(`Error ${isEditing ? 'updating' : 'adding'} brewing device:`, err);
      setFormError(
        err instanceof Error ? err.message : `Failed to ${isEditing ? 'update' : 'add'} brewing device`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="py-4 text-center">Loading brewing devices...</div>;
  }

  if (error) {
    return <div className="py-4 text-center text-red-500">{error}</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      {!isEditing && <h3 className="mb-4 text-lg font-medium">Add New Brewing Device</h3>}

      {formError && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
          {formError}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          Your Device Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="e.g., My Favorite French Press"
          className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 coffee:border-gray-700 coffee:bg-gray-800"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="description" className="mb-1 block text-sm font-medium">
          Description (Optional)
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          placeholder="Add any notes about your device..."
          className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 coffee:border-gray-700 coffee:bg-gray-800"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="brewingDeviceId" className="mb-1 block text-sm font-medium">
          Device Type
        </label>
        <select
          id="brewingDeviceId"
          name="brewingDeviceId"
          value={formData.brewingDeviceId}
          onChange={handleChange}
          required
          className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 coffee:border-gray-700 coffee:bg-gray-800"
        >
          <option value="">Select a device type</option>
          {availableDevices.map((device) => (
            <option key={device.id} value={device.id}>
              {device.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <div className="mb-2">
          <span className="block text-sm font-medium">Device Image (Optional)</span>
          <div className="mt-1 flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setUploadMethod("none")}
              className={`rounded-md px-3 py-1 text-sm ${
                uploadMethod === "none"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Use Default
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
              Upload Custom
            </button>
          </div>
        </div>

        {uploadMethod === "file" && (
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
              className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 coffee:border-gray-700 coffee:bg-gray-800"
            />
            
            {imagePreview && (
              <div className="mt-2">
                <div className="w-32 h-32 mx-auto relative">
                  <img
                    src={imagePreview}
                    alt="Device preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        )}
        
        {formData.brewingDeviceId && uploadMethod === "none" && (
          <div className="mt-2">
            <p className="text-sm text-gray-500 mb-2">Using default image:</p>
            <div className="w-32 h-32 mx-auto relative">
              {availableDevices.find(d => d.id === formData.brewingDeviceId)?.image && (
                <img
                  src={availableDevices.find(d => d.id === formData.brewingDeviceId)?.image}
                  alt="Default device image"
                  className="w-full h-full object-contain"
                />
              )}
            </div>
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
            ? (isEditing ? "Updating..." : "Adding...") 
            : (isEditing ? "Update Device" : "Add Device")}
        </button>
      </div>
    </form>
  );
}
