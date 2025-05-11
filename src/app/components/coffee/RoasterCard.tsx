"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Phone, Globe, Coffee, Edit, MapPinned } from "lucide-react";
import BottomSheet from "../ui/BottomSheet";
import ImageUpload from "../ImageUpload";
import FavoriteButton from "../FavoriteButton";

type RoasterCardProps = {
  roaster: {
    id: string;
    name: string;
    image?: string;
    address?: string;
    mapsLink?: string;
    phoneNumber?: string;
    website?: string;
    notes?: string;
    createdAt: string;
    createdBy: string;
    _count?: {
      coffees: number;
      locations?: number;
    };
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

export default function RoasterCard({
  roaster,
  currentUserId,
  showEditButton = true,
  showFavorite = true,
}: RoasterCardProps) {
  // Temporarily allow any logged-in user to edit
  const isOwner = currentUserId; // Remove the check for currentUserId === roaster.createdBy

  // State for edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roasterImage, setRoasterImage] = useState<File | null>(null);

  // Form data for editing
  const [formData, setFormData] = useState({
    name: roaster.name,
    address: roaster.address || "",
    mapsLink: roaster.mapsLink || "",
    phoneNumber: roaster.phoneNumber || "",
    notes: roaster.notes || "",
    website: roaster.website || "",
  });

  // Handle form changes
  const handleChange = (field: string, value: string) => {
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
      if (!formData.name) throw new Error("Roaster name is required");

      let imageUrl = roaster.image;

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

      // Update roaster
      const response = await fetch(`/api/coffee-roasters/${roaster.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          image: imageUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update roaster");
      }

      // Close modal and reload page to show updated data
      setShowEditModal(false);
      window.location.reload();
    } catch (err) {
      console.error("Error updating roaster:", err);
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
          <Link href={`/roasters/${roaster.id}`} className="flex-grow">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 coffee:bg-gray-700 mr-3 flex-shrink-0">
                {roaster.image ? (
                  <Image
                    src={roaster.image}
                    alt={roaster.name}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">
                    ☕
                  </div>
                )}
              </div>
              <h3 className="font-medium text-lg">{roaster.name}</h3>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            {isOwner && showEditButton && (
              <button
                className="btn btn-outline btn-xs"
                onClick={handleEditClick}
              >
                <Edit size={14} className="mr-1" />
                Edit
              </button>
            )}
            {showFavorite && !!currentUserId && (
              <div onClick={(e) => e.preventDefault()}>
                <FavoriteButton
                  entityType="roaster"
                  entityId={roaster.id}
                  size="sm"
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-y-2 mb-4">
          {roaster.address && (
            <div className="flex items-start">
              <MapPin size={16} className="mr-2 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm">
                  {roaster.mapsLink ? (
                    <a
                      href={roaster.mapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {roaster.address}
                    </a>
                  ) : (
                    roaster.address
                  )}
                </p>
              </div>
            </div>
          )}

          {roaster.phoneNumber && (
            <div className="flex items-center">
              <Phone size={16} className="mr-2 text-gray-500" />
              <a
                href={`tel:${roaster.phoneNumber}`}
                className="text-sm text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {roaster.phoneNumber}
              </a>
            </div>
          )}

          {roaster.website && (
            <div className="flex items-center">
              <Globe size={16} className="mr-2 text-gray-500" />
              <a
                href={roaster.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline truncate max-w-[200px]"
                onClick={(e) => e.stopPropagation()}
              >
                {roaster.website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}

          <Link href={`/roasters/${roaster.id}`} className="block">
            {roaster._count?.coffees !== undefined && (
              <div className="flex items-center mt-1">
                <Coffee size={16} className="mr-2 text-gray-500" />
                <span className="text-sm">
                  {roaster._count.coffees}{" "}
                  {roaster._count.coffees === 1 ? "coffee" : "coffees"}
                </span>
              </div>
            )}
            {/* Always show locations count, with at least 1 */}
            <div className="flex items-center mt-1">
              <MapPinned size={16} className="mr-2 text-gray-500" />
              <span className="text-sm">
                {(() => {
                  // Calculate the number of locations
                  const locationCount =
                    roaster._count?.locations !== undefined &&
                    roaster._count.locations > 0
                      ? roaster._count.locations
                      : 1;

                  // Return the formatted text
                  return `${locationCount} ${locationCount === 1 ? "location" : "locations"}`;
                })()}
              </span>
            </div>
          </Link>
        </div>

        {/* Notes */}
        <Link href={`/roasters/${roaster.id}`} className="block">
          {roaster.notes && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 coffee:text-gray-300 line-clamp-3">
                {roaster.notes}
              </p>
            </div>
          )}
        </Link>

        <div className="flex items-center justify-between text-xs text-gray-500 coffee:text-gray-400 pt-3 border-t border-gray-100 coffee:border-gray-700">
          <div>
            Added{" "}
            {formatDistanceToNow(new Date(roaster.createdAt), {
              addSuffix: true,
            })}
          </div>
          {roaster.user && (
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full overflow-hidden bg-gray-200 coffee:bg-gray-700 mr-1">
                {roaster.user.image ? (
                  <Image
                    src={roaster.user.image}
                    alt={roaster.user.name}
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
              <span>{roaster.user.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <BottomSheet
          show={showEditModal}
          onClose={closeModal}
          title="Edit Roaster"
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
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="input input-bordered w-full"
                required
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="input input-bordered w-full"
                placeholder="Street address, city, state, zip"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium mb-1">Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleChange("website", e.target.value)}
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
                value={formData.mapsLink}
                onChange={(e) => handleChange("mapsLink", e.target.value)}
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
                value={formData.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                className="input input-bordered w-full"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
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
                initialImage={roaster.image || null}
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
