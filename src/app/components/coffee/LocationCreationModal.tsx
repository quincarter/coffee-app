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
};

type LocationCreationModalProps = {
  show: boolean;
  onClose: () => void;
  roasterId: string;
  roasterName: string;
  onSuccess: () => void;
  isFirstLocation?: boolean;
};

export default function LocationCreationModal({
  show,
  onClose,
  roasterId,
  roasterName,
  onSuccess,
  isFirstLocation = false,
}: LocationCreationModalProps) {
  // State for form data
  const [formData, setFormData] = useState<LocationFormData>({
    name: "",
    address: "",
    mapsLink: "",
    phoneNumber: "",
    isMainLocation: isFirstLocation, // Set to true if it's the first location
  });

  // State for image upload
  const [locationImage, setLocationImage] = useState<File | null>(null);
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

      let imageUrl = null;

      // Upload image if one was selected
      if (locationImage) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", locationImage);
        uploadFormData.append("context", "roaster-location");

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

      // Create location
      const response = await fetch(
        `/api/coffee-roasters/${roasterId}/locations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            image: imageUrl,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create location");
      }

      // Reset form
      setFormData({
        name: "",
        address: "",
        mapsLink: "",
        phoneNumber: "",
        isMainLocation: false,
      });
      setLocationImage(null);

      // Call success callback
      onSuccess();
    } catch (err) {
      console.error("Error creating location:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BottomSheet show={show} onClose={onClose} title="Add New Location">
      <p className="text-gray-600 coffee:text-gray-300 mb-4">
        Add a new location for {roasterName}
      </p>
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
            placeholder="Downtown, Westside, etc."
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
            placeholder="123 Main St, City, State, ZIP"
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
            placeholder="https://maps.google.com/..."
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
            placeholder="(123) 456-7890"
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
          <ImageUpload onImageChange={(file) => setLocationImage(file)} />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
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
            {isLoading ? "Adding..." : "Add Location"}
          </button>
        </div>
      </form>
    </BottomSheet>
  );
}
