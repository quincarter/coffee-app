"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash, Save } from "lucide-react";
import SearchableDropdown from "@/app/components/SearchableDropdown";
import ImageUpload from "@/app/components/ImageUpload";
import Toast from "@/app/components/Toast";
import VarietyDropdown, { CoffeeVariety } from "./VarietyDropdown";
import TastingNotesDropdown from "./TastingNotesDropdown";
import CoffeeNameField from "./CoffeeNameField";
import ProductUrlField from "./ProductUrlField";

type CoffeeEditFormProps = {
  coffee: any;
  roasters: {
    id: string;
    name: string;
  }[];
  tastingNotes: {
    id: string;
    name: string;
  }[];
  origins: {
    id: string;
    name: string;
  }[];
  processes: {
    id: string;
    name: string;
  }[];
  onUpdate?: (updatedCoffee: any) => void;
};

export default function CoffeeEditForm({
  coffee,
  roasters,
  tastingNotes,
  origins,
  processes,
  onUpdate,
}: CoffeeEditFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: coffee.name || "",
    roasterId: coffee.roasterId || "",
    description: coffee.description || "",
    countryOfOrigin: coffee.countryOfOrigin || "",
    elevation: coffee.elevation || "",
    process: coffee.process || "",
    variety: coffee.variety || "",
    tastingNotes: coffee.tastingNotes?.map((note: any) => note.name) || [],
    image: coffee.image || null,
    productUrl: coffee.productUrl || "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const handleChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);

      // Validate required fields
      if (!formData.name) {
        throw new Error("Coffee name is required");
      }

      if (!formData.roasterId) {
        throw new Error("Roaster is required");
      }

      // Update coffee
      const response = await fetch(`/api/coffees/${coffee.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update coffee");
      }

      // Get the updated coffee data from response
      const updatedCoffee = await response.json();

      // Show success toast
      setToastMessage("Coffee updated successfully");
      setToastType("success");
      setShowToast(true);

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/coffees/" + updatedCoffee.id);
      }, 2000);
    } catch (err) {
      console.error("Error updating coffee:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setToastMessage(err instanceof Error ? err.message : "An error occurred");
      setToastType("error");
      setShowToast(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSubmitting(true);

      const response = await fetch(`/api/coffees/${coffee.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Special handling for coffees used in brew profiles
        if (response.status === 409 && errorData.brewProfiles) {
          throw new Error(
            `This coffee cannot be deleted because it is used in ${errorData.brewProfiles.length} brew profile(s)`
          );
        }

        throw new Error(errorData.error || "Failed to delete coffee");
      }

      // Show success toast
      setToastMessage("Coffee deleted successfully");
      setToastType("success");
      setShowToast(true);

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/coffees");
      }, 2000);
    } catch (err) {
      console.error("Error deleting coffee:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setToastMessage(err instanceof Error ? err.message : "An error occurred");
      setToastType("error");
      setShowToast(true);
    } finally {
      setSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Coffee</h1>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="btn btn-outline btn-error btn-sm"
          disabled={submitting}
        >
          <Trash size={16} className="mr-1" />
          Delete
        </button>
      </div>

      {error && <div className="alert alert-error mb-6">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {/* Coffee Name */}
            <CoffeeNameField
              value={formData.name}
              onChange={(value) => handleChange("name", value)}
            />

            {/* Roaster */}
            <div>
              <label className="block text-sm font-medium mb-1">Roaster*</label>
              <SearchableDropdown
                options={roasters.map((roaster) => ({
                  value: roaster.id,
                  label: roaster.name,
                }))}
                value={formData.roasterId}
                onChange={(value) => {
                  if (Array.isArray(value)) {
                    handleChange("roasterId", value[0] || "");
                  } else {
                    handleChange("roasterId", value);
                  }
                }}
                placeholder="Select a roaster..."
                multiple={false}
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
                rows={3}
                placeholder="Brief description of this coffee..."
              />
            </div>

            {/* Coffee Image */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Coffee Image
              </label>
              <ImageUpload
                initialImage={formData.image}
                onImageUploaded={(imageUrl) => {
                  setFormData({
                    ...formData,
                    image: imageUrl,
                  });
                }}
                uploadContext="coffee"
                height="md"
              />
            </div>
          </div>

          <div className="space-y-4">
            {/* Country of Origin */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Country of Origin
              </label>
              <SearchableDropdown
                options={origins.map((origin) => ({
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
                placeholder="Select country of origin..."
                allowAddNew={true}
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

            {/* Process */}
            <div>
              <label className="block text-sm font-medium mb-1">Process</label>
              <SearchableDropdown
                options={processes.map((process) => ({
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
                placeholder="Select process..."
                allowAddNew={true}
                multiple={false}
              />
            </div>

            {/* Variety */}
            <VarietyDropdown
              value={formData.variety as CoffeeVariety}
              onChange={(value) => handleChange("variety", value)}
            />

            {/* Tasting Notes */}
            <TastingNotesDropdown
              value={formData.tastingNotes}
              onChange={(value) => handleChange("tastingNotes", value)}
              options={tastingNotes}
            />

            {/* Product URL */}
            <ProductUrlField
              value={formData.productUrl}
              onChange={(value) => handleChange("productUrl", value)}
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Link href="/coffees" className="btn btn-ghost mr-2">
            Cancel
          </Link>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Saving...
              </>
            ) : (
              <>
                <Save size={16} className="mr-1" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white coffee:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Delete Coffee</h3>
            <p className="mb-6">
              Are you sure you want to delete this coffee? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="btn btn-ghost"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={handleDelete}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}
