"use client";

import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import ImageUpload from "@/app/components/ImageUpload";

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
  isEditing = false,
}: Props) {
  const [formData, setFormData] = useState({
    name: initialDevice?.name || "",
    description: initialDevice?.description || "",
  });
  const [imageUrl, setImageUrl] = useState<string | null>(
    initialDevice?.image || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialDevice) {
      setFormData({
        name: initialDevice.name,
        description: initialDevice.description,
      });
      setImageUrl(initialDevice.image || null);
    }
  }, [initialDevice]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
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
        throw new Error(
          errorData.error ||
            `Failed to ${isEditing ? "update" : "create"} brewing device`
        );
      }

      const deviceData = await response.json();
      onDeviceAdded(deviceData);

      // Reset form if not editing
      if (!isEditing) {
        setFormData({
          name: "",
          description: "",
        });
        setImageUrl(null);
      }
    } catch (err) {
      console.error(
        `Error ${isEditing ? "updating" : "creating"} brewing device:`,
        err
      );
      setError(
        err instanceof Error
          ? err.message
          : `Failed to ${isEditing ? "update" : "create"} brewing device`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {!isEditing && (
        <h3 className="mb-4 text-lg font-medium">Add New Brewing Device</h3>
      )}

      {error && <div className="alert alert-error mb-4">{error}</div>}

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
          className="input input-bordered w-full"
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
          className="textarea textarea-bordered w-full"
        />
      </div>

      <div className="mb-4">
        <ImageUpload
          initialImage={imageUrl}
          onImageUploaded={setImageUrl}
          uploadContext="brewing-device"
          label="Device Image"
          height="sm"
          className="w-full"
        />
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
              : "Creating..."
            : isEditing
              ? "Update Device"
              : "Create Device"}
        </button>
      </div>
    </form>
  );
}
