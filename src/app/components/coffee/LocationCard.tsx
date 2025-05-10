"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MapPin, Phone, Edit, Trash, Star, StarOff } from "lucide-react";
import LocationEditModal from "./LocationEditModal";
import Toast from "../Toast";
import FavoriteButton from "../FavoriteButton";

type LocationCardProps = {
  location: {
    id: string;
    name: string;
    address: string;
    mapsLink?: string;
    phoneNumber?: string;
    image?: string;
    isMainLocation: boolean;
    roasterId: string;
    createdAt: string;
  };
  roasterName: string;
  onUpdate: () => void;
  onDelete: () => void;
  onSetMainLocation: () => void;
  isOwner: boolean;
  showFavorite?: boolean;
};

export default function LocationCard({
  location,
  roasterName,
  onUpdate,
  onDelete,
  onSetMainLocation,
  isOwner,
  showFavorite = true,
}: LocationCardProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/coffee-roasters/${location.roasterId}/locations/${location.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete location");
      }

      // Show success toast
      setToastMessage("Location deleted successfully");
      setToastType("success");
      setShowToast(true);

      // Call the onDelete callback
      onDelete();
    } catch (err) {
      console.error("Error deleting location:", err);
      setError(err instanceof Error ? err.message : "An error occurred");

      // Show error toast
      setToastMessage(
        err instanceof Error ? err.message : "Failed to delete location"
      );
      setToastType("error");
      setShowToast(true);
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  // Handle setting as main location
  const handleSetMainLocation = async () => {
    if (location.isMainLocation) return; // Already main location

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/coffee-roasters/${location.roasterId}/locations/${location.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...location,
            isMainLocation: true,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update location");
      }

      // Show success toast
      setToastMessage("Set as main location successfully");
      setToastType("success");
      setShowToast(true);

      // Call the onSetMainLocation callback
      onSetMainLocation();
    } catch (err) {
      console.error("Error updating location:", err);
      setError(err instanceof Error ? err.message : "An error occurred");

      // Show error toast
      setToastMessage(
        err instanceof Error ? err.message : "Failed to update location"
      );
      setToastType("error");
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white coffee:bg-gray-800 rounded-lg shadow-sm border border-gray-200 coffee:border-gray-700 overflow-hidden">
      <div className="p-4">
        {/* Location header with image */}
        <div className="flex items-center mb-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 coffee:bg-gray-700 mr-3 flex-shrink-0">
            {location.image ? (
              <Image
                src={location.image}
                alt={location.name}
                width={48}
                height={48}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">
                🏬
              </div>
            )}
          </div>
          <div className="flex-grow">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">
                {location.name}
                {location.isMainLocation && (
                  <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                    Main
                  </span>
                )}
              </h3>
              <div className="flex space-x-1">
                {isOwner && (
                  <>
                    {!location.isMainLocation && (
                      <button
                        onClick={handleSetMainLocation}
                        className="p-1 text-gray-500 hover:text-primary"
                        title="Set as main location"
                        disabled={isLoading}
                      >
                        <Star size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="p-1 text-gray-500 hover:text-primary"
                      title="Edit location"
                      disabled={isLoading}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="p-1 text-gray-500 hover:text-red-500"
                      title="Delete location"
                      disabled={isLoading}
                    >
                      <Trash size={16} />
                    </button>
                  </>
                )}
                {showFavorite && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <FavoriteButton
                      entityType="location"
                      entityId={location.id}
                      size="sm"
                    />
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500 coffee:text-gray-400">
              {roasterName}
            </p>
          </div>
        </div>

        {/* Location details */}
        <div className="space-y-2">
          <div className="flex items-start">
            <MapPin size={16} className="mr-2 text-gray-500 mt-0.5" />
            <div>
              {location.mapsLink ? (
                <a
                  href={location.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {location.address}
                </a>
              ) : (
                <span>{location.address}</span>
              )}
            </div>
          </div>

          {location.phoneNumber && (
            <div className="flex items-center">
              <Phone size={16} className="mr-2 text-gray-500" />
              <a
                href={`tel:${location.phoneNumber}`}
                className="text-primary hover:underline"
              >
                {location.phoneNumber}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="p-4 border-t border-gray-200 coffee:border-gray-700 bg-gray-50 coffee:bg-gray-900">
          <p className="text-sm text-gray-600 coffee:text-gray-300 mb-3">
            Are you sure you want to delete this location?
          </p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="btn btn-sm btn-outline"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="btn btn-sm btn-error"
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <LocationEditModal
          show={showEditModal}
          onClose={() => setShowEditModal(false)}
          location={location}
          roasterId={location.roasterId}
          onSuccess={() => {
            setShowEditModal(false);
            onUpdate();
            setToastMessage("Location updated successfully");
            setToastType("success");
            setShowToast(true);
          }}
        />
      )}

      {/* Toast notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          duration={3000}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
