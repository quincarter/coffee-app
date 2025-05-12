"use client";

import { X } from "lucide-react";
import { FormEvent, useState, useEffect } from "react";
import SearchableDropdown from "../SearchableDropdown";
import ImageUpload from "../ImageUpload";

interface Props {
  onDeviceCreated: (device: any) => void;
  onCancel: () => void;
  userId?: string;
}

export default function BrewDeviceForm({
  onDeviceCreated,
  onCancel,
  userId,
}: Props) {
  const [quickDeviceName, setQuickDeviceName] = useState("");
  const [quickDeviceDescription, setQuickDeviceDescription] = useState("");
  const [quickDeviceImageUrl, setQuickDeviceImageUrl] = useState<string | null>(
    null
  );
  const [selectedDeviceType, setSelectedDeviceType] = useState("");
  const [isAddingDevice, setIsAddingDevice] = useState(false);
  const [deviceError, setDeviceError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [availableDeviceTypes, setAvailableDeviceTypes] = useState<any[]>([]);

  // Fetch device types when component mounts
  useEffect(() => {
    async function fetchDeviceTypes() {
      try {
        const response = await fetch("/api/brewing-devices");
        if (!response.ok) {
          throw new Error("Failed to fetch device types");
        }
        const data = await response.json();
        setAvailableDeviceTypes(data);
      } catch (err) {
        console.error("Error fetching device types:", err);
        setDeviceError("Failed to load device types. Please try again later.");
      }
    }

    fetchDeviceTypes();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsAddingDevice(true);
    setDeviceError(null);

    try {
      if (!quickDeviceName.trim()) {
        throw new Error("Device name is required");
      }

      if (!selectedDeviceType) {
        throw new Error("Please select a device type");
      }

      // Create the payload object
      const payload = {
        name: quickDeviceName,
        description: quickDeviceDescription,
        brewingDeviceId: selectedDeviceType,
        userId,
        ...(quickDeviceImageUrl && { image: quickDeviceImageUrl }),
      };

      const response = await fetch("/api/user-brewing-devices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error response:", errorData);
        throw new Error(errorData.error || "Failed to add device");
      }

      const newDevice = await response.json();
      onDeviceCreated(newDevice);
    } catch (err) {
      console.error("Error adding device:", err);
      setDeviceError(
        err instanceof Error ? err.message : "Failed to add device"
      );
    } finally {
      setIsAddingDevice(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {deviceError && (
        <div className="alert alert-error mb-4 text-sm">{deviceError}</div>
      )}

      <div className="mb-4">
        <label
          htmlFor="quickDeviceName"
          className="block text-sm font-medium mb-1"
        >
          Device Name
        </label>
        <input
          type="text"
          id="quickDeviceName"
          value={quickDeviceName}
          onChange={(e) => setQuickDeviceName(e.target.value)}
          className="input input-bordered w-full"
          placeholder="My French Press"
          required
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="quickDeviceDescription"
          className="block text-sm font-medium mb-1"
        >
          Description (Optional)
        </label>
        <textarea
          id="quickDeviceDescription"
          value={quickDeviceDescription}
          onChange={(e) => setQuickDeviceDescription(e.target.value)}
          className="textarea textarea-bordered w-full"
          rows={2}
          placeholder="Add any notes about your device..."
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Device Type
          {!selectedDeviceType && <span className="text-red-500 ml-1">*</span>}
        </label>

        <SearchableDropdown
          options={availableDeviceTypes.map((type) => ({
            value: type.id,
            label: type.name,
          }))}
          value={selectedDeviceType}
          onChange={(value) => {
            // Handle both string and string[] types
            if (Array.isArray(value)) {
              // If multiple selection is enabled but we only want one value
              setSelectedDeviceType(value[0] || "");
            } else {
              // Single selection
              setSelectedDeviceType(value);
            }
          }}
          onSearch={setSearchTerm}
          label=""
          placeholder="Search device types..."
          required
          error={
            deviceError && !selectedDeviceType
              ? "Device type is required"
              : undefined
          }
          noOptionsMessage={
            availableDeviceTypes.length === 0
              ? "Loading device types..."
              : "No device types found"
          }
          multiple={false}
        />
      </div>

      <div className="mb-4">
        <ImageUpload
          initialImage={quickDeviceImageUrl}
          onImageUploaded={setQuickDeviceImageUrl}
          uploadContext="brewing-device"
          label="Device Image"
          height="sm"
          className="w-full"
        />
      </div>

      <div className="flex justify-end space-x-2 mt-4">
        <button type="button" onClick={onCancel} className="btn btn-ghost">
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isAddingDevice}
        >
          {isAddingDevice ? (
            <>
              <span className="loading loading-spinner loading-xs"></span>
              Adding...
            </>
          ) : (
            "Add Device"
          )}
        </button>
      </div>
    </form>
  );
}
