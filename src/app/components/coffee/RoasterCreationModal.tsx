"use client";

import { RoasterFormData } from "@/app/types";
import ImageUpload from "../ImageUpload";
import BottomSheet from "../ui/BottomSheet";

type RoasterCreationModalProps = {
  show: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: RoasterFormData;
  setFormData: (data: RoasterFormData) => void;
  isLoading: boolean;
  error: string | null;
};

export default function RoasterCreationModal({
  show,
  onClose,
  onSubmit,
  formData,
  setFormData,
  isLoading,
  error,
}: RoasterCreationModalProps) {
  const handleChange = (field: keyof RoasterFormData, value: string | null) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  return (
    <BottomSheet show={show} onClose={onClose} title="Add New Roaster">
      {error && <div className="alert alert-error mb-4 text-sm">{error}</div>}

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
          <label className="block text-sm font-medium mb-1">Phone Number</label>
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
            initialImage={formData.image}
            onImageUploaded={(imageUrl) => handleChange("image", imageUrl)}
            uploadContext="coffee-roaster"
            label=""
            height="sm"
            className="mt-1"
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
              "Add Roaster"
            )}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
