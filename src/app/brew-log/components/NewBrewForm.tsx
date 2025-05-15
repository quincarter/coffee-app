"use client";

import BrewProfileCreationModal from "@/app/components/brew/BrewProfileCreationModal";
import ImageUpload from "@/app/components/ImageUpload";
import SearchableDropdown from "@/app/components/SearchableDropdown";
import { BrewProfile, BrewSession, UserBrewingDevice } from "@/app/types";
import { X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import BrewDeviceCreationModal from "../../components/brew/BrewDeviceCreationModal";

type Props = {
  userId?: string;
  userDevices: UserBrewingDevice[];
  onBrewCreated: (session: BrewSession) => void;
  onDeviceAdded?: (device: UserBrewingDevice) => void; // Add this prop
  onCancel?: () => void;
  isQuickForm?: boolean;
};

export default function NewBrewForm({
  userId,
  userDevices,
  onBrewCreated,
  onDeviceAdded,
  onCancel,
  isQuickForm = false,
}: Props) {
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
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
  const [quickDeviceImageUrl, setQuickDeviceImageUrl] = useState<string | null>(
    null
  );

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
    // Get the search term from the input element
    const searchInput = document.querySelector(
      'input[placeholder="Search your devices..."]'
    ) as HTMLInputElement;

    if (searchInput && searchInput.value) {
      setQuickDeviceName(searchInput.value);
      // Clear the search input to prevent the string from being added as a chip
      searchInput.value = "";
    }

    setShowQuickDeviceModal(true);
    // Start animation after a tiny delay to ensure the modal is in the DOM
    setTimeout(() => setModalAnimation(true), 10);
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

      // Let parent component handle device list update
      if (onDeviceAdded) {
        onDeviceAdded(newDevice);
      }

      // Update the selection to use the newly created device
      setSelectedDeviceIds([...selectedDeviceIds, newDevice.id]);

      // Close modal and reset form
      closeModal();
      setQuickDeviceName("");
      setQuickDeviceDescription("");
      setSelectedDeviceType("");
      setQuickDeviceImageUrl(null);
    } catch (err) {
      console.error("Error adding device:", err);
      setDeviceError(
        err instanceof Error ? err.message : "Failed to add device"
      );
    } finally {
      setIsAddingDevice(false);
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
      const payload = {
        ...(userId && { userId }),
        name,
        notes,
        brewingDeviceId: primaryUserDevice.brewingDeviceId,
        additionalDeviceIds: selectedDeviceIds
          .slice(1)
          .map((id) => {
            const device = userDevices.find((d) => d.id === id);
            return device ? device.brewingDeviceId : null;
          })
          .filter(Boolean),
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
      setImageUrl(null);
      setSelectedBrewProfileId("");
      setIsPublic(false);
    } catch (err) {
      console.error("Error creating brew session:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create brew session"
      );
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

      {!error && (
        <>
          <div
            className={`${isQuickForm ? "alert alert-info text-sm mb-4" : "alert alert-info mb-4"}`}
          >
            <p>
              <strong>Tip:</strong> You can add a new brewing device by clicking
              the "Add Device" button in the device selection dropdown.
            </p>
            <button
              type="button"
              onClick={handleAddNewDevice}
              className="btn btn-sm p-6 btn-info "
            >
              Add Device
            </button>
          </div>
          <div
            className={`${isQuickForm ? "alert alert-neutral text-sm mb-4" : "alert alert-neutral mb-4"}`}
          >
            <p>
              You can add more details later (Like a brew profile). Or all at
              once. Treat this as your personal Brew Journal if you wish. <br />
              <br /> If you want to create a brew profile, you can do so{" "}
              <a
                href="/brew-profiles"
                className="text-blue-500 hover:underline"
              >
                here
              </a>
              .
            </p>
          </div>
        </>
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
            label: device.name || device.brewingDevice.name,
          }))}
          value={selectedDeviceIds}
          onChange={(value) => {
            if (Array.isArray(value)) {
              // Check for duplicate device types
              const selectedDevices = value
                .map((id) => userDevices.find((d) => d.id === id))
                .filter(
                  (device): device is UserBrewingDevice => device !== undefined
                );

              const deviceTypeCounts = selectedDevices.reduce(
                (acc, device) => {
                  acc[device.brewingDeviceId] =
                    (acc[device.brewingDeviceId] || 0) + 1;
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
              setSelectedDeviceIds(value);
            } else {
              setSelectedDeviceIds(value ? [value] : []);
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
                    alt={device.name || device.brewingDevice.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-xs text-center mt-1">
                  {device.name || device.brewingDevice.name}
                </span>
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
        initialImage={imageUrl}
        onImageUploaded={setImageUrl}
        uploadContext="brew-session"
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

  // Update the devices list and selection when a new device is added
  const handleAddDevice = (newDevice: UserBrewingDevice) => {
    // Only call parent handler to update device list
    if (onDeviceAdded) {
      onDeviceAdded(newDevice);
    }

    // Update device selection after a short delay to ensure parent has updated its list
    setTimeout(() => {
      setSelectedDeviceIds([...selectedDeviceIds, newDevice.id]);
      setShowQuickDeviceModal(false);
    }, 50);
  };

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

      <BrewDeviceCreationModal
        show={showQuickDeviceModal}
        onClose={() => setShowQuickDeviceModal(false)}
        onDeviceCreated={handleAddDevice}
        userId={userId}
      />
    </>
  );
}
