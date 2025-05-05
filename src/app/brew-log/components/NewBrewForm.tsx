"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import SearchableDropdown from "@/app/components/SearchableDropdown";

type UserBrewingDevice = {
  id: string;
  name: string;
  description: string;
  brewingDeviceId: string;
  brewingDevice: {
    name: string;
    image: string;
  };
};

type BrewSession = {
  id: string;
  name: string;
  notes: string;
  userId: string;
  brewingDeviceId: string;
  brewTime: string;
  brewingDevice: {
    name: string;
    image: string;
  };
  createdAt: string;
  updatedAt: string;
};

type Props = {
  userId?: string;
  userDevices: UserBrewingDevice[];
  onBrewCreated: (session: BrewSession) => void;
  onCancel?: () => void;
  isQuickForm?: boolean;
};

export default function NewBrewForm({
  userId,
  userDevices,
  onBrewCreated,
  onCancel,
  isQuickForm = false,
}: Props) {
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [showQuickDeviceModal, setShowQuickDeviceModal] = useState(false);
  const [quickDeviceName, setQuickDeviceName] = useState("");
  const [isAddingDevice, setIsAddingDevice] = useState(false);
  const [deviceError, setDeviceError] = useState<string | null>(null);
  const [availableDeviceTypes, setAvailableDeviceTypes] = useState<
    Array<{ id: string; name: string; image: string }>
  >([]);
  const [selectedDeviceType, setSelectedDeviceType] = useState("");
  const [modalAnimation, setModalAnimation] = useState(false);
  const [quickDeviceDescription, setQuickDeviceDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const handleAddNewDevice = () => {
    console.log("Add new device clicked");
    
    // Try to get the search term from the input element
    const searchInput = document.querySelector('input[placeholder="Search your devices..."]') as HTMLInputElement;
    if (searchInput && searchInput.value) {
      setQuickDeviceName(searchInput.value);
    }
    
    setShowQuickDeviceModal(true);
    // Start animation after a tiny delay to ensure the modal is in the DOM
    setTimeout(() => setModalAnimation(true), 10);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleQuickDeviceImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Validate all required fields
    if (!name) {
      setError("Brew name is required");
      return;
    }

    if (selectedDeviceIds.length === 0) {
      setError("At least one brewing device is required");
      return;
    }

    // Find the primary selected user device (first in the array)
    const primaryDeviceId = selectedDeviceIds[0];
    const primaryUserDevice = userDevices.find(
      (device) => device.id === primaryDeviceId
    );
    
    if (!primaryUserDevice) {
      setError("Selected brewing device not found");
      return;
    }

    // Format brew time as HH:MM:SS
    const brewTime = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    setIsSubmitting(true);
    setError(null);

    try {
      let imageUrl = null;

      // Upload image if one was selected
      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", imageFile);
        uploadFormData.append("context", "brew-session");

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

      // Log the payload for debugging
      const payload = {
        ...(userId && { userId }),
        name,
        notes,
        brewingDeviceId: primaryUserDevice.id, // Use the primary UserBrewingDevice.id
        additionalDeviceIds: selectedDeviceIds.slice(1), // Store additional devices
        brewTime,
        ...(imageUrl && { image: imageUrl }),
        isPublic,
      };
      console.log("Submitting payload:", payload);

      const response = await fetch("/api/brew-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error:", errorData);
        setError(
          errorData.error || `Failed to create brew session: ${response.status}`
        );
        return;
      }

      const newSession = await response.json();
      console.log("Success response:", newSession);
      onBrewCreated(newSession);

      // Reset form
      setName("");
      setNotes("");
      setSelectedDeviceIds([]);
      setHours(0);
      setMinutes(0);
      setSeconds(0);
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      console.error("Submission error:", err);
      setError("An error occurred while creating the brew session");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formContent = (
    <>
      {error && (
        <div
          className={`${isQuickForm ? "alert alert-error text-sm mb-4" : "alert alert-error mb-4"}`}
        >
          {error}
        </div>
      )}

      <div className={isQuickForm ? "mb-4" : "mb-4"}>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Brew Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={
            isQuickForm
              ? "input input-bordered input-sm w-full"
              : "input input-bordered w-full"
          }
          placeholder="Morning Coffee"
          required
        />
      </div>

      <div className={isQuickForm ? "mb-4" : "mb-4"}>
        <SearchableDropdown
          options={userDevices.map((device) => ({
            value: device.id,
            label: isQuickForm
              ? `${device.brewingDevice.name} - ${device.name}`
              : device.name,
          }))}
          value={selectedDeviceIds}
          onChange={(value) => {
            if (Array.isArray(value)) {
              setSelectedDeviceIds(value);
            } else {
              setSelectedDeviceIds([value].filter(Boolean));
            }
          }}
          onSearch={setSearchTerm}
          label="Brewing Devices"
          placeholder="Search your devices..."
          required
          error={
            error && selectedDeviceIds.length === 0
              ? "At least one brewing device is required"
              : undefined
          }
          className={isQuickForm ? "text-sm" : ""}
          noOptionsMessage={
            userDevices.length === 0
              ? "You don't have any brewing devices yet"
              : "No devices found with that name"
          }
          allowAddNew={true}
          onAddNew={handleAddNewDevice}
          addNewText="Add a new brewing device"
          multiple={true}
        />
        <p className="text-xs text-gray-500 mt-1">
          Add multiple devices if needed (e.g., kettle + pour over)
        </p>
      </div>

      {selectedDeviceIds.length > 0 && !isQuickForm && (
        <div className="mb-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {selectedDeviceIds.map((deviceId) => {
            const device = userDevices.find((d) => d.id === deviceId);
            if (!device) return null;
            
            return (
              <div key={deviceId} className="flex flex-col items-center">
                <div className="w-20 h-20 relative">
                  <img
                    src={device.brewingDevice.image}
                    alt={device.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-xs text-center mt-1">{device.name}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className={isQuickForm ? "mb-4" : "mb-4"}>
        <label className="block text-sm font-medium mb-1">Brew Time</label>
        <div className="flex space-x-2">
          <div>
            <input
              type="number"
              id="hours"
              value={hours}
              onChange={(e) =>
                setHours(Math.max(0, Math.min(23, Number(e.target.value))))
              }
              className={
                isQuickForm
                  ? "input input-bordered input-sm w-full"
                  : "input input-bordered w-full"
              }
              min="0"
              max="23"
              step="1"
              placeholder="HH"
            />
            <span className="text-xs text-center block mt-1">Hours</span>
          </div>
          <div>
            <input
              type="number"
              id="minutes"
              value={minutes}
              onChange={(e) =>
                setMinutes(Math.max(0, Math.min(59, Number(e.target.value))))
              }
              className={
                isQuickForm
                  ? "input input-bordered input-sm w-full"
                  : "input input-bordered w-full"
              }
              min="0"
              max="59"
              step="1"
              placeholder="MM"
            />
            <span className="text-xs text-center block mt-1">Minutes</span>
          </div>
          <div>
            <input
              type="number"
              id="seconds"
              value={seconds}
              onChange={(e) =>
                setSeconds(Math.max(0, Math.min(59, Number(e.target.value))))
              }
              className={
                isQuickForm
                  ? "input input-bordered input-sm w-full"
                  : "input input-bordered w-full"
              }
              min="0"
              max="59"
              step="1"
              placeholder="SS"
            />
            <span className="text-xs text-center block mt-1">Seconds</span>
          </div>
        </div>
      </div>

      <div className={isQuickForm ? "mb-4" : "mb-4"}>
        <label htmlFor="image" className="block text-sm font-medium mb-1">
          Brew Image (optional)
        </label>
        <input
          type="file"
          id="image"
          accept="image/*"
          onChange={handleImageChange}
          className={
            isQuickForm
              ? "file-input file-input-bordered file-input-sm w-full"
              : "file-input file-input-bordered w-full"
          }
        />

        {imagePreview && (
          <div className="mt-2">
            <div className="w-32 h-32 mx-auto">
              <img
                src={imagePreview}
                alt="Brew preview"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}
      </div>

      <div className={isQuickForm ? "mb-4" : "mb-4"}>
        <label htmlFor="notes" className="block text-sm font-medium mb-1">
          {isQuickForm ? "Notes" : "Brew Notes"}
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={
            isQuickForm
              ? "textarea textarea-bordered textarea-sm w-full"
              : "textarea textarea-bordered w-full"
          }
          rows={isQuickForm ? 2 : 5}
          placeholder={
            isQuickForm
              ? "How did it taste? What would you change next time?"
              : "Describe your brew process, taste notes, etc."
          }
        />
      </div>

      <div className={isQuickForm ? "mb-4" : "mb-4"}>
        <div className="flex items-center justify-between">
          <label htmlFor="isPublic" className="text-sm font-medium">
            Make this brew public
          </label>
          <input
            type="checkbox"
            id="isPublic"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="toggle toggle-primary toggle-sm"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Public brews may be showcased on the home page
        </p>
      </div>

      {isQuickForm ? (
        <div className="flex space-x-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-outline btn-sm flex-1"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary btn-sm flex-1"
          >
            {isSubmitting ? "Creating..." : "Start Brew"}
          </button>
        </div>
      ) : (
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary w-full"
        >
          {isSubmitting ? "Saving..." : "Save Brew Session"}
        </button>
      )}
    </>
  );

  const handleQuickDeviceAdd = async (e: FormEvent) => {
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

      let imageUrl = null;

      // Upload image if one was selected
      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", imageFile);
        uploadFormData.append("context", "brewing-device");

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

      const response = await fetch("/api/user-brewing-devices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: quickDeviceName,
          description: quickDeviceDescription,
          brewingDeviceId: selectedDeviceType,
          userId,
          ...(imageUrl && { image: imageUrl }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add device");
      }

      const newDevice = await response.json();

      // Add the new device to the list and select it
      userDevices.push(newDevice);
      setSelectedDeviceIds([...selectedDeviceIds, newDevice.id]);

      // Close the modal with animation
      closeModal();

      // Reset form
      setQuickDeviceName("");
      setQuickDeviceDescription("");
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      console.error("Error adding device:", err);
      setDeviceError(
        err instanceof Error ? err.message : "Failed to add device"
      );
    } finally {
      setIsAddingDevice(false);
    }
  };

  useEffect(() => {
    async function fetchDeviceTypes() {
      try {
        const response = await fetch("/api/brewing-devices");
        if (response.ok) {
          const data = await response.json();
          setAvailableDeviceTypes(data);
          if (data.length > 0) {
            setSelectedDeviceType(data[0].id);
          }
        }
      } catch (err) {
        console.error("Error fetching device types:", err);
      }
    }

    fetchDeviceTypes();
  }, []);

  const closeModal = () => {
    setModalAnimation(false);
    // Wait for animation to complete before hiding the modal
    setTimeout(() => setShowQuickDeviceModal(false), 300);
  };

  useEffect(() => {
    const handleResize = () => {
      // Force a re-render when window size changes
      if (showQuickDeviceModal) {
        setModalAnimation(false);
        setTimeout(() => setModalAnimation(true), 10);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [showQuickDeviceModal]);

  return (
    <>
      {isQuickForm ? (
        <div className="relative">
          {onCancel && (
            <button
              onClick={onCancel}
              className="absolute right-0 top-0 text-gray-400 hover:text-gray-600"
              aria-label="Close form"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {formContent}
          </form>
        </div>
      ) : (
        <div className="bg-white coffee:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Log a New Brew</h3>
          <form onSubmit={handleSubmit}>{formContent}</form>
        </div>
      )}

      {/* Bottom sheet style modal for mobile, centered dialog for desktop */}
      {showQuickDeviceModal && (
        <div
          className="fixed inset-0 bg-opacity-25 backdrop-blur-sm flex items-end md:items-center justify-center z-[100]"
          onClick={closeModal}
        >
          <div
            className="bg-white coffee:bg-gray-800 w-full md:w-auto rounded-t-lg md:rounded-lg shadow-lg p-6 transition-transform duration-300 ease-in-out"
            style={{
              transform: modalAnimation ? "translateY(0)" : "translateY(100%)",
              maxHeight: "80vh",
              overflowY: "auto",
              width: window.innerWidth < 768 ? "100%" : "auto",
              minWidth: window.innerWidth < 768 ? "100%" : "32rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Add New Brewing Device</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Add a subtle drag indicator for mobile */}
            <div className="md:hidden w-12 h-1 bg-gray-300 rounded-full mx-auto -mt-2 mb-4"></div>

            {deviceError && (
              <div className="alert alert-error mb-4 text-sm">
                {deviceError}
              </div>
            )}

            <form onSubmit={handleQuickDeviceAdd}>
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
                <SearchableDropdown
                  options={availableDeviceTypes.map(type => ({
                    value: type.id,
                    label: type.name
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
                  label="Device Type"
                  placeholder="Search device types..."
                  required
                  error={deviceError && !selectedDeviceType ? "Device type is required" : undefined}
                  noOptionsMessage={availableDeviceTypes.length === 0 ? "Loading device types..." : "No device types found"}
                  multiple={false}
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="quickDeviceImage"
                  className="block text-sm font-medium mb-1"
                >
                  Device Image (Optional)
                </label>
                <input
                  type="file"
                  id="quickDeviceImage"
                  accept="image/*"
                  onChange={handleQuickDeviceImageChange}
                  className="file-input file-input-bordered w-full"
                />
                
                {imagePreview && (
                  <div className="mt-2">
                    <div className="w-24 h-24 mx-auto">
                      <img
                        src={imagePreview}
                        alt="Device preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn btn-ghost"
                >
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
          </div>
        </div>
      )}
    </>
  );
}
