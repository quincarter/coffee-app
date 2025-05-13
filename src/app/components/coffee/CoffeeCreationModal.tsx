"use client";

import { useState } from "react";
import SearchableDropdown from "../SearchableDropdown";
import BottomSheet from "../ui/BottomSheet";
import ImageUpload from "../ImageUpload";
import RoasterSelector from "./RoasterSelector";
import VarietyDropdown, { CoffeeVariety } from "./VarietyDropdown";
import { CoffeeFormData } from "@/app/types";
import TastingNotesDropdown from "./TastingNotesDropdown";
import CoffeeNameField from "./CoffeeNameField";
import ProductUrlField from "./ProductUrlField";

type CoffeeCreationModalProps = {
  show: boolean;
  onClose: () => void;
  onSubmit: (imageUrl: string | null) => void;
  formData: CoffeeFormData;
  setFormData: (data: CoffeeFormData) => void;
  isLoading: boolean;
  error: string | null;
  availableTastingNotes: { id: string; name: string }[];
  availableOrigins: { id: string; name: string }[];
  availableProcesses: { id: string; name: string }[];
  userId?: string | undefined;
  isRoasterPage?: boolean;
};

export default function CoffeeCreationModal({
  show,
  onClose,
  onSubmit,
  formData,
  setFormData,
  isLoading,
  error,
  availableTastingNotes,
  availableOrigins,
  availableProcesses,
  userId = undefined,
  isRoasterPage = false,
}: CoffeeCreationModalProps) {
  // Selected roaster
  const [selectedRoaster, setSelectedRoaster] = useState<string>(
    formData?.roasterId || ""
  );

  const handleChange = (field: keyof CoffeeFormData, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleRoasterSelect = (roasterId: string) => {
    setSelectedRoaster(roasterId);
    handleChange("roasterId", roasterId);
  };

  const handleSubmit = async () => {
    // No need to handle image upload here as it's done by the ImageUpload component
    onSubmit(formData.image as string | null);
  };

  // Get initial image URL
  const getInitialImage = () => {
    if (!formData.image) return null;
    if (typeof formData.image === "string") return formData.image;
    return null;
  };

  return (
    <BottomSheet show={show} onClose={onClose} title="Add New Coffee">
      {error && <div className="alert alert-error mb-4 text-sm">{error}</div>}

      <div className="space-y-3">
        <div>
          <RoasterSelector
            selectedRoasterId={selectedRoaster}
            onRoasterSelect={handleRoasterSelect}
            userId={userId}
            disabled={formData.roasterId && isRoasterPage ? true : false}
          />
        </div>
        {/* Coffee Name */}
        <CoffeeNameField
          value={formData.name}
          onChange={(value) => handleChange("name", value)}
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
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
          <label className="block text-sm font-medium mb-1">Elevation</label>
          <input
            type="text"
            value={formData.elevation}
            onChange={(e) => handleChange("elevation", e.target.value)}
            className="input input-bordered w-full"
            placeholder="e.g., 1200-1500 masl"
          />
        </div>

        {/* Variety */}
        <VarietyDropdown
          value={formData.variety as CoffeeVariety}
          onChange={(value) => handleChange("variety", value)}
          label="Variety"
        />

        {/* Coffee Image */}
        <div>
          <label className="block text-sm font-medium mb-1">Coffee Image</label>
          <ImageUpload
            initialImage={getInitialImage()}
            onImageUploaded={(imageUrl) => handleChange("image", imageUrl)}
            uploadContext="coffee"
            label=""
            height="sm"
            className="mt-1"
          />
        </div>

        {/* Tasting Notes */}
        <TastingNotesDropdown
          value={formData.tastingNotes}
          onChange={(value) => handleChange("tastingNotes", value)}
          options={availableTastingNotes}
        />

        {/* Product URL */}
        <ProductUrlField
          value={formData.productUrl}
          onChange={(value) => handleChange("productUrl", value)}
        />

        <div className="flex justify-end space-x-2 mt-4">
          <button type="button" onClick={onClose} className="btn btn-ghost">
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
                Adding...
              </>
            ) : (
              "Add Coffee"
            )}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
