"use client";

import { useState } from "react";
import BottomSheet from "../ui/BottomSheet";
import ImageUpload from "../ImageUpload";

type LocationFormData = {
  name: string;
  address: string;
  mapsLink: string;
  phoneNumber: string;
  isMainLocation: boolean;
  image: string | null;
};

type LocationEditModalProps = {
  show: boolean;
  onClose: () => void;
  location: {
    id: string;
    name: string;
    address: string;
    mapsLink?: string;
    phoneNumber?: string;
    image?: string;
    isMainLocation: boolean;
  };
  roasterId: string;
  onSuccess: () => void;
};

export default function LocationEditModal({
  show,
  onClose,
  location,
  roasterId,
  onSuccess,
}: LocationEditModalProps) {
  // State for form data
  const [formData, setFormData] = useState<LocationFormData>({
    name: location.name,
    address: location.address,
    mapsLink: location.mapsLink || "",
    phoneNumber: location.phoneNumber || "",
    isMainLocation: location.isMainLocation,
    image: location.image || null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle form changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checkbox.checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error("Location name is required");
      }

      if (!formData.address.trim()) {
        throw new Error("Address is required");
      }

      // Update location with all form data including image URL
      const response = await fetch(
        `/api/coffee-roasters/${roasterId}/locations/${location.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update location");
      }

      // Call success callback
      onSuccess();
    } catch (err) {
      console.error("Error updating location:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BottomSheet show={show} onClose={onClose} title="Edit Location">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 coffee:bg-red-900/20 text-red-600 coffee:text-red-400 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 coffee:text-gray-300 mb-1"
          >
            Location Name*
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
        </div>

        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700 coffee:text-gray-300 mb-1"
          >
            Address*
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
        </div>

        <div>
          <label
            htmlFor="mapsLink"
            className="block text-sm font-medium text-gray-700 coffee:text-gray-300 mb-1"
          >
            Google Maps Link
          </label>
          <input
            type="url"
            id="mapsLink"
            name="mapsLink"
            value={formData.mapsLink}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </div>

        <div>
          <label
            htmlFor="phoneNumber"
            className="block text-sm font-medium text-gray-700 coffee:text-gray-300 mb-1"
          >
            Phone Number
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isMainLocation"
            name="isMainLocation"
            checked={formData.isMainLocation}
            onChange={handleChange}
            className="checkbox checkbox-primary mr-2"
          />
          <label
            htmlFor="isMainLocation"
            className="text-sm font-medium text-gray-700 coffee:text-gray-300"
          >
            Set as main location
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 coffee:text-gray-300 mb-1">
            Location Image
          </label>
          <ImageUpload
            initialImage={formData.image}
            onImageUploaded={(imageUrl) => {
              setFormData({
                ...formData,
                image: imageUrl,
              });
            }}
            uploadContext="roaster-location"
            height="sm"
          />
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </BottomSheet>
  );
}
