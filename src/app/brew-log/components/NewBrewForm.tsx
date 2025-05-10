"use client";

import ImageUpload from "@/app/components/ImageUpload";
import SearchableDropdown from "@/app/components/SearchableDropdown";
import { BrewProfile, BrewSession, UserBrewingDevice } from "@/app/types";
import { X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

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
  const [hoursStr, setHoursStr] = useState("");
  const [minutesStr, setMinutesStr] = useState("");
  const [secondsStr, setSecondsStr] = useState("");
  const [brewProfiles, setBrewProfiles] = useState<BrewProfile[]>([]);
  const [selectedBrewProfileId, setSelectedBrewProfileId] =
    useState<string>("");
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  const validateTimeInput = (value: string, max: number): string => {
    // Allow empty string or numbers only
    if (value === "" || /^\d+$/.test(value)) {
      // If it's a number, ensure it's within range
      if (value !== "" && parseInt(value) > max) {
        return max.toString();
      }
      return value;
    }
    // If invalid input, return previous valid value
    return value.replace(/[^\d]/g, "");
  };

  const handleAddNewDevice = () => {
    // Try to get the search term from the input element
    const searchInput = document.querySelector(
      'input[placeholder="Search your devices..."]'
    ) as HTMLInputElement;
    if (searchInput && searchInput.value) {
      setQuickDeviceName(searchInput.value);
    }

    setShowQuickDeviceModal(true);
    // Start animation after a tiny delay to ensure the modal is in the DOM
    setTimeout(() => setModalAnimation(true), 10);
  };

  const handleQuickDeviceImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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

    // Convert string inputs to numbers, defaulting to 0 if empty
    const hoursNum = hoursStr ? parseInt(hoursStr) : 0;
    const minutesNum = minutesStr ? parseInt(minutesStr) : 0;
    const secondsNum = secondsStr ? parseInt(secondsStr) : 0;

    // Format brew time as HH:MM:SS
    const brewTime = `${hoursNum.toString().padStart(2, "0")}:${minutesNum
      .toString()
      .padStart(2, "0")}:${secondsNum.toString().padStart(2, "0")}`;

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

      // The fix: Use primaryUserDevice.brewingDeviceId instead of primaryUserDevice.id
      const payload = {
        ...(userId && { userId }),
        name,
        notes,
        brewingDeviceId: primaryUserDevice.brewingDeviceId, // Use the brewingDeviceId from the UserBrewingDevice
        additionalDeviceIds: selectedDeviceIds
          .slice(1)
          .map((id) => {
            const device = userDevices.find((d) => d.id === id);
            return device ? device.brewingDeviceId : null;
          })
          .filter(Boolean), // Map UserBrewingDevice IDs to BrewingDevice IDs
        brewTime,
        ...(imageUrl && { image: imageUrl }),
        isPublic,
        ...(selectedBrewProfileId && { brewProfileId: selectedBrewProfileId }),
      };

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
      onBrewCreated(newSession);

      // Reset form
      setName("");
      setNotes("");
      setSelectedDeviceIds([]);
      setHoursStr("");
      setMinutesStr("");
      setSecondsStr("");
      setImageFile(null);
      setImagePreview(null);
      setSelectedBrewProfileId("");
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

      {/* Brew Profile Selection */}
      <div className={isQuickForm ? "mb-4" : "mb-4"}>
        <SearchableDropdown
          options={brewProfiles.map((profile) => ({
            value: profile.id,
            label: `${profile.coffee.name} (${profile.ratio})`,
          }))}
          value={selectedBrewProfileId}
          onChange={(value) => {
            // Handle both string and string[] types
            if (Array.isArray(value)) {
              // If multiple selection is enabled but we only want one value
              handleBrewProfileSelect(value[0] || "");
            } else {
              // Single selection
              handleBrewProfileSelect(value);
            }
          }}
          label="Brew Profile (Optional)"
          placeholder="Select a brew profile..."
          className={isQuickForm ? "text-sm" : ""}
          noOptionsMessage={
            loadingProfiles
              ? "Loading brew profiles..."
              : brewProfiles.length === 0
                ? "You don't have any brew profiles yet"
                : "No brew profiles found"
          }
          multiple={false}
        />
        <p className="text-xs text-gray-500 mt-1">
          Selecting a brew profile will pre-fill some fields
        </p>
      </div>

      <div className={isQuickForm ? "mb-4" : "mb-4"}>
        <SearchableDropdown
          options={userDevices.map((device) => ({
            value: device.id,
            label: device.name,
          }))}
          value={selectedDeviceIds}
          onChange={(value) => {
            if (Array.isArray(value)) {
              // Check for duplicate device types
              const selectedDevices = value.map((id) =>
                userDevices.find((d) => d.id === id)
              );
              const deviceTypeCounts = selectedDevices.reduce(
                (acc, device) => {
                  if (device) {
                    acc[device.brewingDeviceId] =
                      (acc[device.brewingDeviceId] || 0) + 1;
                  }
                  return acc;
                },
                {} as Record<string, number>
              );

              const hasDuplicates = Object.values(deviceTypeCounts).some(
                (count) => count > 1
              );

              if (hasDuplicates) {
                setDeviceError(
                  "You cannot select multiple devices of the same type"
                );
                return;
              }

              setDeviceError(null);
              // Simply use the value array as is - first item is primary
              setSelectedDeviceIds(value);
            } else {
              // Single selection case - just use the value
              setSelectedDeviceIds([value].filter(Boolean));
              setDeviceError(null);
            }
          }}
          onSearch={setSearchTerm}
          label="Brewing Devices"
          placeholder="Search your devices..."
          required
          error={
            deviceError ||
            (error && selectedDeviceIds.length === 0
              ? "At least one brewing device is required"
              : undefined)
          }
          className={isQuickForm ? "text-sm" : ""}
          noOptionsMessage={
            userDevices.length === 0
              ? "You don't have any brewing devices yet"
              : "No devices found with that name"
          }
          allowAddNew={true}
          onAddNew={handleAddNewDevice}
          // addNewText prop removed
          multiple={true}
        />
        <p className="text-xs text-gray-500 mt-1">
          First device selected is the primary brewing device
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
                    src={device.brewingDevice.image || "/default-device.webp"}
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
              type="text"
              id="hours"
              value={hoursStr}
              onChange={(e) =>
                setHoursStr(validateTimeInput(e.target.value, 23))
              }
              className={
                isQuickForm
                  ? "input input-bordered input-sm w-full"
                  : "input input-bordered w-full"
              }
              placeholder="HH"
              maxLength={2}
            />
            <span className="text-xs text-center block mt-1">Hours</span>
          </div>
          <div>
            <input
              type="text"
              id="minutes"
              value={minutesStr}
              onChange={(e) =>
                setMinutesStr(validateTimeInput(e.target.value, 59))
              }
              className={
                isQuickForm
                  ? "input input-bordered input-sm w-full"
                  : "input input-bordered w-full"
              }
              placeholder="MM"
              maxLength={2}
            />
            <span className="text-xs text-center block mt-1">Minutes</span>
          </div>
          <div>
            <input
              type="text"
              id="seconds"
              value={secondsStr}
              onChange={(e) =>
                setSecondsStr(validateTimeInput(e.target.value, 59))
              }
              className={
                isQuickForm
                  ? "input input-bordered input-sm w-full"
                  : "input input-bordered w-full"
              }
              placeholder="SS"
              maxLength={2}
            />
            <span className="text-xs text-center block mt-1">Seconds</span>
          </div>
        </div>
      </div>

      <ImageUpload
        initialImage={imagePreview}
        onImageChange={(file, preview) => {
          setImageFile(file);
          setImagePreview(preview);
        }}
        label="Brew Image (optional)"
        height={isQuickForm ? "sm" : "md"}
        isSmall={isQuickForm}
        className={isQuickForm ? "mb-4" : "mb-4"}
      />

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

  // Handle brew profile selection
  const handleBrewProfileSelect = (profileId: string) => {
    setSelectedBrewProfileId(profileId);

    if (!profileId) {
      // Reset form if no profile is selected
      return;
    }

    // Find the selected profile
    const selectedProfile = brewProfiles.find(
      (profile) => profile.id === profileId
    );
    if (!selectedProfile) return;

    // Update form with profile data
    // First, find the user device that matches the brew device from the profile
    // The BrewProfile type in the interface doesn't match the schema exactly
    // We need to use type assertion to access the properties
    const profileData = selectedProfile as any;

    const matchingDevice = userDevices.find(
      (device) => device.brewingDeviceId === profileData.brewDeviceId
    );

    if (matchingDevice) {
      setSelectedDeviceIds([matchingDevice.id]);
    }

    // Set notes from profile's tasting notes if available
    if (
      profileData.tastingNotes &&
      typeof profileData.tastingNotes === "string"
    ) {
      setNotes(profileData.tastingNotes);
    }
  };

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

      // Create the payload object
      const payload = {
        name: quickDeviceName,
        description: quickDeviceDescription,
        brewingDeviceId: selectedDeviceType,
        userId,
        ...(imageUrl && { image: imageUrl }),
      };

      const response = await fetch("/api/user-brewing-devices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Log the response status

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error response:", errorData);
        throw new Error(errorData.error || "Failed to add device");
      }

      const newDevice = await response.json();

      // Add the new device to the list and select it
      userDevices = [...userDevices, newDevice];
      setSelectedDeviceIds([...selectedDeviceIds, newDevice.id]);

      // Close the modal with animation
      closeModal();

      // Reset form
      setQuickDeviceName("");
      setQuickDeviceDescription("");
      setSelectedDeviceType("");
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

  // Fetch brew profiles
  useEffect(() => {
    async function fetchBrewProfiles() {
      if (!userId) return;

      try {
        setLoadingProfiles(true);
        const response = await fetch("/api/brew-profiles");
        if (!response.ok) {
          throw new Error("Failed to fetch brew profiles");
        }
        const data = await response.json();
        setBrewProfiles(data);
      } catch (err) {
        console.error("Error fetching brew profiles:", err);
        setError("Failed to load brew profiles. Please try again later.");
      } finally {
        setLoadingProfiles(false);
      }
    }

    fetchBrewProfiles();
  }, [userId]);

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

    if (showQuickDeviceModal) {
      fetchDeviceTypes();
    }
  }, [showQuickDeviceModal]);

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

  // Click outside handler removed as it's now handled by SearchableDropdown

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
                <label className="block text-sm font-medium mb-1">
                  Device Type
                  {!selectedDeviceType && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
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
