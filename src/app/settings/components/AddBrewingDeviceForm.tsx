"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import Image from "next/image";
import SearchableDropdown from "@/app/components/SearchableDropdown";
import { UserBrewingDevice } from "@/app/types";
import ImageUpload from "@/app/components/ImageUpload";

type BrewingDevice = {
  id: string;
  name: string;
  description: string;
  image: string;
};

type Props = {
  userId: string;
  onDeviceAdded: (device: UserBrewingDevice) => void;
  initialDevice?: UserBrewingDevice;
  isEditing?: boolean;
};

type FormData = {
  name: string;
  description: string;
  brewingDeviceId: string;
  image: string | null;
};

export default function AddBrewingDeviceForm({
  userId,
  onDeviceAdded,
  initialDevice,
  isEditing = false,
}: Props) {
  const [availableDevices, setAvailableDevices] = useState<BrewingDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<"none" | "file">("none");

  const [formData, setFormData] = useState<FormData>({
    name: initialDevice?.name || "",
    description: initialDevice?.description || "",
    brewingDeviceId: initialDevice?.brewingDeviceId || "",
    image: initialDevice?.image || null,
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
        image: initialDevice.image || null,
      });

      if (initialDevice.image) {
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const url = isEditing
        ? `/api/user-brewing-devices/${initialDevice?.id}`
        : "/api/user-brewing-devices";

      const method = isEditing ? "PATCH" : "POST";

      // If using the default image from the brewing device and uploadMethod is "none",
      // set image to null to use the device's default image
      const image = uploadMethod === "none" ? null : formData.image;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          image,
          userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            `Failed to ${isEditing ? "update" : "add"} brewing device`
        );
      }

      const deviceData = await response.json();
      onDeviceAdded(deviceData);
    } catch (err) {
      console.error(
        `Error ${isEditing ? "updating" : "adding"} brewing device:`,
        err
      );
      setFormError(
        err instanceof Error
          ? err.message
          : `Failed to ${isEditing ? "update" : "add"} brewing device`
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
      {!isEditing && (
        <h3 className="mb-4 text-lg font-medium">Add New Brewing Device</h3>
      )}

      {formError && <div className="alert alert-error mb-4">{formError}</div>}

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
          className="input input-bordered w-full"
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
          className="textarea textarea-bordered w-full"
        />
      </div>

      <div className="mb-4">
        <SearchableDropdown
          options={availableDevices.map((device) => ({
            value: device.id,
            label: device.name,
          }))}
          value={formData.brewingDeviceId}
          onChange={(value) => {
            // Handle both string and string[] types
            if (Array.isArray(value)) {
              // If multiple selection is enabled but we only want one value
              setFormData({ ...formData, brewingDeviceId: value[0] || "" });
            } else {
              // Single selection
              setFormData({ ...formData, brewingDeviceId: value });
            }
          }}
          label="Device Type"
          placeholder="Search device types..."
          required
          error={
            formError && !formData.brewingDeviceId
              ? "Device type is required"
              : undefined
          }
          disabled={isLoading}
          noOptionsMessage="No device types available"
          multiple={false}
        />
      </div>

      <div className="mb-4">
        <div className="mb-2">
          <span className="block text-sm font-medium">
            Device Image (Optional)
          </span>
          <div className="mt-1 flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setUploadMethod("none")}
              className={`btn btn-sm ${
                uploadMethod === "none" ? "btn-primary" : "btn-outline"
              }`}
            >
              Use Default
            </button>
            <button
              type="button"
              onClick={() => setUploadMethod("file")}
              className={`btn btn-sm ${
                uploadMethod === "file" ? "btn-primary" : "btn-outline"
              }`}
            >
              Upload Custom
            </button>
          </div>
        </div>

        {uploadMethod === "file" && (
          <ImageUpload
            initialImage={formData.image}
            onImageUploaded={(imageUrl) => {
              setFormData({
                ...formData,
                image: imageUrl,
              });
            }}
            uploadContext="brewing-device"
            height="sm"
            className="mb-4"
          />
        )}

        {formData.brewingDeviceId && uploadMethod === "none" && (
          <div className="mt-2">
            <p className="text-sm text-gray-500 mb-2">Using default image:</p>
            <div className="w-32 h-32 mx-auto relative">
              {availableDevices.find((d) => d.id === formData.brewingDeviceId)
                ?.image && (
                <img
                  src={
                    availableDevices.find(
                      (d) => d.id === formData.brewingDeviceId
                    )?.image
                  }
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
          className="btn btn-primary"
        >
          {isSubmitting
            ? isEditing
              ? "Updating..."
              : "Adding..."
            : isEditing
              ? "Update Device"
              : "Add Device"}
        </button>
      </div>
    </form>
  );
}
