"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, Trash, MapPin, Phone, Globe } from "lucide-react";
import ImageUpload from "@/app/components/ImageUpload";
import Toast from "@/app/components/Toast";

type RoasterEditFormProps = {
  roaster: any;
  coffeeCount: number;
};

export default function RoasterEditForm({
  roaster,
  coffeeCount,
}: RoasterEditFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: roaster.name || "",
    address: roaster.address || "",
    mapsLink: roaster.mapsLink || "",
    phoneNumber: roaster.phoneNumber || "",
    website: roaster.website || "",
    notes: roaster.notes || "",
    hasSingleLocation: roaster.hasSingleLocation || false,
  });

  const [roasterImage, setRoasterImage] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(
    roaster.image || null
  );
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
        throw new Error("Roaster name is required");
      }

      let imageUrl = currentImageUrl;

      // Upload new image if selected
      if (roasterImage) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", roasterImage);
        uploadFormData.append("context", "roaster");

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

      // Show success toast
      setToastMessage("Roaster updated successfully");
      setToastType("success");
      setShowToast(true);

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/roasters");
      }, 2000);
    } catch (err) {
      console.error("Error updating roaster:", err);
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

      const response = await fetch(`/api/coffee-roasters/${roaster.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Special handling for roasters with coffees
        if (response.status === 409 && errorData.coffees) {
          throw new Error(
            `This roaster cannot be deleted because it has ${errorData.coffees.length} coffee(s) associated with it`
          );
        }

        throw new Error(errorData.error || "Failed to delete roaster");
      }

      // Show success toast
      setToastMessage("Roaster deleted successfully");
      setToastType("success");
      setShowToast(true);

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/roasters");
      }, 2000);
    } catch (err) {
      console.error("Error deleting roaster:", err);
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
        <h1 className="text-2xl font-bold">Edit Roaster</h1>
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="btn btn-outline btn-error btn-sm"
          disabled={submitting || coffeeCount > 0}
          title={
            coffeeCount > 0
              ? "Cannot delete roaster with associated coffees"
              : "Delete roaster"
          }
        >
          <Trash size={16} className="mr-1" />
          Delete
        </button>
      </div>

      {error && <div className="alert alert-error mb-6">{error}</div>}

      {coffeeCount > 0 && (
        <div className="alert alert-info mb-6">
          <div className="flex flex-col w-full">
            <p>
              This roaster has {coffeeCount} coffee(s) associated with it. You
              need to delete or reassign these coffees before you can delete
              this roaster.
            </p>
            <div className="flex justify-center sm:justify-start mt-2">
              <Link
                href={`/coffees?roasterName=${encodeURIComponent(roaster.name)}`}
                className="btn btn-sm btn-outline w-full sm:w-auto"
              >
                View Associated Coffees
              </Link>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
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
              <label className="block text-sm font-medium mb-1">
                <MapPin size={14} className="inline mr-1" />
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="input input-bordered w-full"
                placeholder="Physical address"
              />
            </div>

            {/* Maps Link */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Maps Link
              </label>
              <input
                type="url"
                value={formData.mapsLink}
                onChange={(e) => handleChange("mapsLink", e.target.value)}
                className="input input-bordered w-full"
                placeholder="Google Maps or other map service URL"
              />
            </div>

            {/* Roaster Image */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Roaster Logo
              </label>
              <ImageUpload
                initialImage={currentImageUrl}
                onImageChange={(file) => setRoasterImage(file)}
                height="md"
              />
            </div>

            {/* Single Location Toggle */}
            <div className="mt-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary mr-2"
                  checked={formData.hasSingleLocation}
                  onChange={(e) =>
                    handleChange("hasSingleLocation", e.target.checked)
                  }
                />
                <span>
                  This roaster has only one location
                  <p className="text-sm text-gray-500 coffee:text-gray-400">
                    Use the main roaster information as the location
                  </p>
                </span>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <Phone size={14} className="inline mr-1" />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                className="input input-bordered w-full"
                placeholder="Contact phone number"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <Globe size={14} className="inline mr-1" />
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleChange("website", e.target.value)}
                className="input input-bordered w-full"
                placeholder="https://example.com"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                className="textarea textarea-bordered w-full"
                rows={5}
                placeholder="Additional information about this roaster..."
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Link href="/roasters" className="btn btn-ghost mr-2">
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
            <h3 className="text-lg font-medium mb-4">Delete Roaster</h3>
            <p className="mb-6">
              Are you sure you want to delete this roaster? This action cannot
              be undone.
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
