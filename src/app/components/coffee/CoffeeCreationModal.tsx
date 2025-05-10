"use client";

import { useState } from "react";
import SearchableDropdown from "../SearchableDropdown";
import BottomSheet from "../ui/BottomSheet";
import ImageUpload from "../ImageUpload";

type CoffeeFormData = {
  name: string;
  roasterId: string;
  description: string;
  countryOfOrigin: string;
  elevation: string;
  process: string;
  tastingNotes: string[];
};

type CoffeeCreationModalProps = {
  show: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: CoffeeFormData;
  setFormData: (data: CoffeeFormData) => void;
  isLoading: boolean;
  error: string | null;
  availableTastingNotes: { id: string; name: string }[];
  availableOrigins: { id: string; name: string }[];
  availableProcesses: { id: string; name: string }[];
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
}: CoffeeCreationModalProps) {
  const [coffeeImage, setCoffeeImage] = useState<File | null>(null);

  const handleChange = (field: keyof CoffeeFormData, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  return (
    <BottomSheet show={show} onClose={onClose} title="Add New Coffee">
      {error && <div className="alert alert-error mb-4 text-sm">{error}</div>}

      <div className="space-y-3">
        {/* Coffee Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Coffee Name*</label>
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

        {/* Coffee Image */}
        <div>
          <label className="block text-sm font-medium mb-1">Coffee Image</label>
          <ImageUpload
            initialImage={null}
            onImageChange={(file) => {
              setCoffeeImage(file);
            }}
            label=""
            height="sm"
            className="mt-1"
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

        <div className="flex justify-end space-x-2 mt-4">
          <button type="button" onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onSubmit}
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
