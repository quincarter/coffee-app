"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Coffee, Tag, MapPin, Edit } from "lucide-react";
import CoffeeImage from "./CoffeeImage";
import BottomSheet from "../ui/BottomSheet";
import SearchableDropdown from "../SearchableDropdown";
import ImageUpload from "../ImageUpload";
import FavoriteButton from "../FavoriteButton";

type CoffeeCardProps = {
  coffee: {
    id: string;
    name: string;
    image?: string;
    description?: string;
    countryOfOrigin?: string;
    process?: string;
    elevation?: string;
    createdAt: string;
    createdBy: string;
    roasterId?: string;
    roaster: {
      id: string;
      name: string;
      image?: string;
    };
    tastingNotes?: {
      id: string;
      name: string;
    }[];
    user?: {
      id: string;
      name: string;
      image?: string;
    };
  };
  currentUserId?: string;
  showEditButton?: boolean;
  showFavorite?: boolean;
};

export default function CoffeeCard({
  coffee,
  currentUserId,
  showEditButton = true,
  showFavorite = true,
}: CoffeeCardProps) {
  // Debug log to check values
  console.log("CoffeeCard - currentUserId:", currentUserId);
  console.log("CoffeeCard - coffee.createdBy:", coffee.createdBy);

  const isOwner = currentUserId && coffee.createdBy === currentUserId;

  // State for edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coffeeImage, setCoffeeImage] = useState<File | null>(null);
  const [availableTastingNotes, setAvailableTastingNotes] = useState<
    { id: string; name: string }[]
  >([]);
  const [availableOrigins, setAvailableOrigins] = useState<
    { id: string; name: string }[]
  >([]);
  const [availableProcesses, setAvailableProcesses] = useState<
    { id: string; name: string }[]
  >([]);

  // Form data for editing
  const [formData, setFormData] = useState({
    name: coffee.name,
    roasterId: coffee.roaster.id,
    description: coffee.description || "",
    countryOfOrigin: coffee.countryOfOrigin || "",
    elevation: coffee.elevation || "",
    process: coffee.process || "",
    tastingNotes: coffee.tastingNotes?.map((note) => note.name) || [],
  });

  // Fetch dropdown data when modal is opened
  useEffect(() => {
    if (showEditModal) {
      fetchDropdownData();
    }
  }, [showEditModal]);

  // Function to fetch dropdown data
  const fetchDropdownData = async () => {
    try {
      // Fetch tasting notes
      const tastingNotesResponse = await fetch("/api/coffee-tasting-notes");
      if (tastingNotesResponse.ok) {
        const tastingNotesData = await tastingNotesResponse.json();
        setAvailableTastingNotes(tastingNotesData);
      }

      // Fetch origins
      const originsResponse = await fetch("/api/coffee-origins");
      if (originsResponse.ok) {
        const originsData = await originsResponse.json();
        setAvailableOrigins(originsData);
      }

      // Fetch processes
      const processesResponse = await fetch("/api/coffee-processes");
      if (processesResponse.ok) {
        const processesData = await processesResponse.json();
        setAvailableProcesses(processesData);
      }
    } catch (err) {
      console.error("Error fetching dropdown data:", err);
    }
  };

  // Handle form changes
  const handleChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  // Handle edit button click
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowEditModal(true);
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!formData.name) throw new Error("Coffee name is required");
      if (!formData.roasterId) throw new Error("Roaster is required");

      let imageUrl = coffee.image;

      // Upload image if one was selected
      if (coffeeImage) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", coffeeImage);
        uploadFormData.append("context", "coffee");

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

      // Log tasting notes for debugging
      console.log("Submitting tasting notes:", formData.tastingNotes);

      // Update coffee - send tasting notes as strings directly
      const response = await fetch(`/api/coffees/${coffee.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          image: imageUrl,
          tastingNotes: formData.tastingNotes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update coffee");
      }

      // Close modal and reload page to show updated data
      setShowEditModal(false);
      window.location.reload();
    } catch (err) {
      console.error("Error updating coffee:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Close modal
  const closeModal = () => {
    setShowEditModal(false);
    setError(null);
  };

  return (
    <div className="bg-white coffee:bg-gray-800 rounded-lg shadow-sm border border-gray-200 coffee:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <Link href={`/coffees/${coffee.id}`} className="flex-grow">
            <div>
              <h3 className="font-medium text-lg mb-1">{coffee.name}</h3>
              <div className="flex items-center">
                <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-200 coffee:bg-gray-700 mr-2">
                  {coffee.roaster?.image ? (
                    <Image
                      src={coffee.roaster.image}
                      alt={coffee.roaster.name}
                      width={20}
                      height={20}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      ☕
                    </div>
                  )}
                </div>
                <span className="text-sm text-gray-600 coffee:text-gray-300">
                  {coffee.roaster?.name}
                </span>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            {currentUserId && showEditButton && (
              <button
                className="btn btn-outline btn-xs"
                onClick={handleEditClick}
              >
                <Edit size={14} className="mr-1" />
                Edit
              </button>
            )}
            {showFavorite && (
              <div onClick={(e) => e.preventDefault()}>
                <FavoriteButton
                  entityType="coffee"
                  entityId={coffee.id}
                  size="sm"
                />
              </div>
            )}
          </div>
        </div>

        <Link href={`/coffees/${coffee.id}`} className="block">
          {/* Coffee Image */}
          {coffee.image && (
            <div className="mb-4">
              <CoffeeImage image={coffee.image} alt={coffee.name} height="sm" />
            </div>
          )}

          {/* Description */}
          {coffee.description && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 coffee:text-gray-300 line-clamp-2">
                {coffee.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
            {coffee.countryOfOrigin && (
              <div>
                <p className="text-xs text-gray-500 coffee:text-gray-400 flex items-center">
                  <MapPin size={12} className="mr-1" />
                  Origin
                </p>
                <p className="text-sm">{coffee.countryOfOrigin}</p>
              </div>
            )}

            {coffee.process && (
              <div>
                <p className="text-xs text-gray-500 coffee:text-gray-400">
                  Process
                </p>
                <p className="text-sm">{coffee.process}</p>
              </div>
            )}

            {coffee.elevation && (
              <div>
                <p className="text-xs text-gray-500 coffee:text-gray-400">
                  Elevation
                </p>
                <p className="text-sm">{coffee.elevation}</p>
              </div>
            )}
          </div>

          {/* Tasting Notes */}
          {coffee.tastingNotes && coffee.tastingNotes.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 coffee:text-gray-400 mb-1 flex items-center">
                <Tag size={12} className="mr-1" />
                Tasting Notes
              </p>
              <div className="flex flex-wrap gap-1">
                {coffee.tastingNotes.map((note) => (
                  <span key={note.id} className="badge badge-sm">
                    {note.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Link>

        <div className="flex items-center justify-between text-xs text-gray-500 coffee:text-gray-400 pt-3 border-t border-gray-100 coffee:border-gray-700">
          <div>
            Added{" "}
            {formatDistanceToNow(new Date(coffee.createdAt), {
              addSuffix: true,
            })}
          </div>
          {coffee.user && (
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full overflow-hidden bg-gray-200 coffee:bg-gray-700 mr-1">
                {coffee.user.image ? (
                  <Image
                    src={coffee.user.image}
                    alt={coffee.user.name}
                    width={16}
                    height={16}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    👤
                  </div>
                )}
              </div>
              <span>{coffee.user.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <BottomSheet
          show={showEditModal}
          onClose={closeModal}
          title="Edit Coffee"
        >
          {error && (
            <div className="alert alert-error mb-4 text-sm">{error}</div>
          )}

          <div className="space-y-3">
            {/* Coffee Name */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Coffee Name*
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="input input-bordered w-full"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="textarea textarea-bordered w-full"
                rows={2}
                placeholder="Brief description of this coffee..."
              />
            </div>

            {/* Country of Origin */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Country of Origin
              </label>
              <SearchableDropdown
                options={availableOrigins.map((origin) => ({
                  value: origin.name,
                  label: origin.name,
                }))}
                value={formData.countryOfOrigin}
                onChange={(value) => {
                  if (Array.isArray(value)) {
                    handleChange("countryOfOrigin", value[0] || "");
                  } else {
                    handleChange("countryOfOrigin", value);
                  }
                }}
                label=""
                placeholder="Select or type a country..."
                allowAddNew={true}
                onAddNew={(_newValue) => {
                  // New value will be added to the form data automatically
                }}
                multiple={false}
              />
            </div>

            {/* Process */}
            <div>
              <label className="block text-sm font-medium mb-1">Process</label>
              <SearchableDropdown
                options={availableProcesses.map((process) => ({
                  value: process.name,
                  label: process.name,
                }))}
                value={formData.process}
                onChange={(value) => {
                  if (Array.isArray(value)) {
                    handleChange("process", value[0] || "");
                  } else {
                    handleChange("process", value);
                  }
                }}
                label=""
                placeholder="Select or type a process method..."
                allowAddNew={true}
                onAddNew={(_newValue) => {
                  // New value will be added to the form data automatically
                }}
                multiple={false}
              />
            </div>

            {/* Elevation */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Elevation
              </label>
              <input
                type="text"
                value={formData.elevation}
                onChange={(e) => handleChange("elevation", e.target.value)}
                className="input input-bordered w-full"
                placeholder="e.g., 1200-1500 masl"
              />
            </div>

            {/* Tasting Notes */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Tasting Notes
              </label>
              <SearchableDropdown
                options={availableTastingNotes.map((note) => ({
                  value: note.name,
                  label: note.name,
                }))}
                value={formData.tastingNotes}
                onChange={(value) => {
                  if (Array.isArray(value)) {
                    handleChange("tastingNotes", value);
                  } else {
                    handleChange("tastingNotes", [value]);
                  }
                }}
                label=""
                placeholder="Select or type tasting notes..."
                allowAddNew={true}
                onAddNew={(_newValue) => {
                  // New value will be added to the form data automatically
                }}
                multiple={true}
              />
            </div>

            {/* Coffee Image */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Coffee Image
              </label>
              <ImageUpload
                initialImage={coffee.image || null}
                onImageChange={(file) => {
                  setCoffeeImage(file);
                }}
                label=""
                height="sm"
                className="mt-1"
              />
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
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </BottomSheet>
      )}
    </div>
  );
}
