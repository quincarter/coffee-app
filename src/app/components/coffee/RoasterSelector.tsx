"use client";

import { useState, useEffect } from "react";
import { CoffeeRoaster } from "@prisma/client";
import SearchableDropdown from "../SearchableDropdown";
import ImageUpload from "../ImageUpload";
import BottomSheet from "../ui/BottomSheet";

type RoasterSelectorProps = {
  selectedRoasterId: string;
  onRoasterSelect: (roasterId: string) => void;
  userId?: string;
  disabled?: boolean;
};

export default function RoasterSelector({
  selectedRoasterId,
  onRoasterSelect,
  userId,
  disabled = false,
}: RoasterSelectorProps) {
  // State
  const [roasters, setRoasters] = useState<CoffeeRoaster[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal state
  const [showRoasterModal, setShowRoasterModal] = useState(false);

  // Roaster form data
  const [roasterFormData, setRoasterFormData] = useState({
    name: "",
    address: "",
    mapsLink: "",
    phoneNumber: "",
    notes: "",
    website: "",
  });
  const [roasterImage, setRoasterImage] = useState<File | null>(null);

  // Fetch roasters on component mount
  useEffect(() => {
    const fetchRoasters = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/coffee-roasters");
        if (!response.ok) {
          throw new Error("Failed to fetch roasters");
        }
        const data = await response.json();
        setRoasters(data);
      } catch (err) {
        console.error("Error fetching roasters:", err);
        setError("Failed to load roasters");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoasters();
  }, []);

  // Handle adding a new roaster
  const handleAddRoaster = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!roasterFormData.name) throw new Error("Roaster name is required");

      let imageUrl = null;

      // Upload image if one was selected
      if (roasterImage) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", roasterImage);
        uploadFormData.append("context", "coffee-roaster");

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

      const response = await fetch("/api/coffee-roasters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...roasterFormData,
          image: imageUrl,
          createdBy: userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add roaster");
      }

      const newRoaster = await response.json();

      // Update roasters list
      setRoasters([...roasters, newRoaster]);

      // Select the new roaster
      onRoasterSelect(newRoaster.id);

      // Reset form
      setRoasterFormData({
        name: "",
        address: "",
        mapsLink: "",
        phoneNumber: "",
        notes: "",
        website: "",
      });
      setRoasterImage(null);

      // Close modal with animation
      closeRoasterModal();

      // Show success message
      setSuccess("Roaster added successfully!");
    } catch (err) {
      console.error("Error adding roaster:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Functions to handle roaster modal opening and closing
  const openRoasterModal = () => {
    setShowRoasterModal(true);
  };

  const closeRoasterModal = () => {
    setShowRoasterModal(false);
    // Reset form when closing
    setRoasterFormData({
      name: "",
      address: "",
      mapsLink: "",
      phoneNumber: "",
      notes: "",
      website: "",
    });
    setRoasterImage(null);
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1">Coffee Roaster</label>
      <div className="flex items-end gap-2">
        <div className="flex-grow">
          <SearchableDropdown
            options={roasters.map((roaster) => ({
              value: roaster.id,
              label: roaster.name,
            }))}
            value={selectedRoasterId}
            onChange={(value) => {
              if (Array.isArray(value)) {
                onRoasterSelect(value[0] || "");
              } else {
                onRoasterSelect(value);
              }
            }}
            label=""
            placeholder="Search for a roaster..."
            disabled={disabled || showRoasterModal}
            noOptionsMessage="No roasters found"
            multiple={false}
          />
        </div>
        <button
          type="button"
          className="btn btn-sm btn-outline"
          onClick={openRoasterModal}
          disabled={disabled}
        >
          Add New
        </button>
      </div>

      {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
      {success && <div className="text-green-500 text-sm mt-1">{success}</div>}

      {/* Roaster Creation Modal */}
      {showRoasterModal && (
        <BottomSheet
          show={showRoasterModal}
          onClose={closeRoasterModal}
          title="Add New Roaster"
        >
          {error && (
            <div className="alert alert-error mb-4 text-sm">{error}</div>
          )}

          <div className="space-y-3">
            {/* Roaster Name */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Roaster Name*
              </label>
              <input
                type="text"
                value={roasterFormData.name}
                onChange={(e) =>
                  setRoasterFormData({
                    ...roasterFormData,
                    name: e.target.value,
                  })
                }
                className="input input-bordered w-full"
                required
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                type="text"
                value={roasterFormData.address}
                onChange={(e) =>
                  setRoasterFormData({
                    ...roasterFormData,
                    address: e.target.value,
                  })
                }
                className="input input-bordered w-full"
                placeholder="Street address, city, state, zip"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium mb-1">Website</label>
              <input
                type="url"
                value={roasterFormData.website}
                onChange={(e) =>
                  setRoasterFormData({
                    ...roasterFormData,
                    website: e.target.value,
                  })
                }
                className="input input-bordered w-full"
                placeholder="https://example.com"
              />
            </div>

            {/* Maps Link */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Google Maps Link
              </label>
              <input
                type="url"
                value={roasterFormData.mapsLink}
                onChange={(e) =>
                  setRoasterFormData({
                    ...roasterFormData,
                    mapsLink: e.target.value,
                  })
                }
                className="input input-bordered w-full"
                placeholder="https://maps.google.com/..."
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={roasterFormData.phoneNumber}
                onChange={(e) =>
                  setRoasterFormData({
                    ...roasterFormData,
                    phoneNumber: e.target.value,
                  })
                }
                className="input input-bordered w-full"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={roasterFormData.notes}
                onChange={(e) =>
                  setRoasterFormData({
                    ...roasterFormData,
                    notes: e.target.value,
                  })
                }
                className="textarea textarea-bordered w-full"
                rows={3}
                placeholder="Additional information about this roaster..."
              />
            </div>

            {/* Roaster Image */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Roaster Image
              </label>
              <ImageUpload
                initialImage={null}
                onImageChange={(file) => {
                  setRoasterImage(file);
                }}
                label=""
                height="sm"
                className="mt-1"
              />
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <button
                type="button"
                onClick={closeRoasterModal}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAddRoaster}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Adding...
                  </>
                ) : (
                  "Add Roaster"
                )}
              </button>
            </div>
          </div>
        </BottomSheet>
      )}
    </div>
  );
}
