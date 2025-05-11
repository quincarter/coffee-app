"use client";

import { useState } from "react";
import RoasterSelector from "../coffee/RoasterSelector";
import CoffeeSelector from "../coffee/CoffeeSelector";
import BrewSettingsForm from "./BrewSettingsForm";
import AdditionalInfoForm from "./AdditionalInfoForm";
import ImageUpload from "../ImageUpload";

type BrewProfileFormProps = {
  userId?: string;
  onProfileCreated?: (profile: any) => void;
  onCancel?: () => void;
  initialProfile?: any;
  isEditing?: boolean;
};

export default function BrewProfileForm({
  userId,
  onProfileCreated,
  onCancel,
  initialProfile,
  isEditing = false,
}: BrewProfileFormProps) {
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Selected roaster
  const [selectedRoaster, setSelectedRoaster] = useState<string>(
    initialProfile?.coffee?.roaster?.id || ""
  );

  // Form data
  const [formData, setFormData] = useState({
    coffeeId: initialProfile?.coffeeId || "",
    brewDeviceId: initialProfile?.brewDeviceId || "",
    waterAmount: initialProfile?.waterAmount?.toString() || "",
    coffeeAmount: initialProfile?.coffeeAmount?.toString() || "",
    ratio: initialProfile?.ratio || "1:16",
    roasterNotes: initialProfile?.roasterNotes || "",
    tastingNotes: initialProfile?.tastingNotes || "",
    roastDate: initialProfile?.roastDate
      ? new Date(initialProfile.roastDate).toISOString().split("T")[0]
      : "",
    wash: initialProfile?.wash || "",
    process: initialProfile?.process || "",
    roastLevel: initialProfile?.roastLevel || "",
    isPublic: initialProfile?.isPublic || false,
    image: initialProfile?.image || null,
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate form
      if (!formData.coffeeId) throw new Error("Please select a coffee");
      if (!formData.brewDeviceId)
        throw new Error("Please select a brewing device");
      if (!formData.waterAmount) throw new Error("Please enter water amount");
      if (!formData.coffeeAmount) throw new Error("Please enter coffee amount");
      if (!formData.ratio) throw new Error("Please enter a ratio");

      // Prepare payload
      const payload = {
        ...formData,
        userId,
        waterAmount: parseFloat(formData.waterAmount),
        coffeeAmount: parseFloat(formData.coffeeAmount),
        roastDate: formData.roastDate
          ? new Date(formData.roastDate).toISOString()
          : null,
      };

      // Send request
      const url = isEditing
        ? `/api/brew-profiles/${initialProfile.id}`
        : "/api/brew-profiles";

      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save brew profile");
      }

      const savedProfile = await response.json();

      setSuccess(
        isEditing
          ? "Brew profile updated successfully!"
          : "Brew profile created successfully!"
      );

      if (onProfileCreated) onProfileCreated(savedProfile);
    } catch (err) {
      console.error("Error saving brew profile:", err);
      setError(
        err instanceof Error ? err.message : "Failed to save brew profile"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form field changes
  const handleFormChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  // Handle brew settings changes
  const handleBrewSettingsChange = (brewSettings: any) => {
    setFormData({
      ...formData,
      ...brewSettings,
    });
  };

  // Handle additional info changes
  const handleAdditionalInfoChange = (additionalInfo: any) => {
    setFormData({
      ...formData,
      ...additionalInfo,
    });
  };

  return (
    <div className="bg-white coffee:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">
        {isEditing ? "Edit Brew Profile" : "New Brew Profile"}
      </h2>

      {error && <div className="alert alert-error mb-4">{error}</div>}
      {success && <div className="alert alert-success mb-4">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Roaster Selection */}
        <RoasterSelector
          selectedRoasterId={selectedRoaster}
          onRoasterSelect={setSelectedRoaster}
          userId={userId}
          disabled={isLoading}
        />

        {/* Coffee Selection */}
        <CoffeeSelector
          selectedRoaster={selectedRoaster}
          selectedCoffeeId={formData.coffeeId}
          onCoffeeSelect={(coffeeId) => handleFormChange("coffeeId", coffeeId)}
          userId={userId}
          disabled={isLoading}
        />

        {/* Brew Settings */}
        <BrewSettingsForm
          formData={{
            brewDeviceId: formData.brewDeviceId,
            waterAmount: formData.waterAmount,
            coffeeAmount: formData.coffeeAmount,
            ratio: formData.ratio,
          }}
          onChange={handleBrewSettingsChange}
          disabled={isLoading}
        />

        {/* Image Upload */}
        <ImageUpload
          initialImage={formData.image}
          onImageUploaded={(imageUrl) => handleFormChange("image", imageUrl)}
          uploadContext="brew-profile"
          label="Profile Image (optional)"
        />

        {/* Additional Information */}
        <AdditionalInfoForm
          formData={{
            roasterNotes: formData.roasterNotes,
            tastingNotes: formData.tastingNotes,
            roastDate: formData.roastDate,
            wash: formData.wash,
            process: formData.process,
            roastLevel: formData.roastLevel,
            isPublic: formData.isPublic,
          }}
          onChange={handleAdditionalInfoChange}
          disabled={isLoading}
        />

        {/* Form Actions */}
        <div className="flex justify-end gap-2 pt-4">
          {onCancel && (
            <button type="button" className="btn btn-ghost" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading
              ? "Saving..."
              : isEditing
                ? "Update Profile"
                : "Create Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
