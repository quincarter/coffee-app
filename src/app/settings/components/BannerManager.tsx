"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type BannerColor = "success" | "info" | "danger" | "warning" | "neutral";

interface BannerFormData {
  title: string;
  description: string;
  color: BannerColor;
  isDismissable: boolean;
  isActive: boolean;
}

export default function BannerManager() {
  const [previewData, setPreviewData] = useState<BannerFormData | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BannerFormData>({
    defaultValues: {
      color: "info",
      isDismissable: true,
      isActive: true,
    },
  });

  // Watch form values for preview
  const formValues = watch();

  const onSubmit = async (data: BannerFormData) => {
    try {
      const response = await fetch("/api/admin/banner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create banner");
      }

      toast.success("Banner updated successfully");
      setPreviewData(null);
    } catch (error) {
      console.error("Error creating banner:", error);
      toast.error("Failed to create banner");
    }
  };

  const colorOptions: { label: string; value: BannerColor }[] = [
    { label: "Success", value: "success" },
    { label: "Info", value: "info" },
    { label: "Danger", value: "danger" },
    { label: "Warning", value: "warning" },
    { label: "Neutral", value: "neutral" },
  ];

  return (
    <div className="space-y-6">
      <div className="prose">
        <h3>Banner Management</h3>
        <p>Create and manage site-wide announcement banners.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Title</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            {...register("title", { required: "Title is required" })}
          />
          {errors.title && (
            <span className="text-error text-sm mt-1">
              {errors.title.message}
            </span>
          )}
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Description</span>
          </label>
          <textarea
            className="textarea textarea-bordered h-24"
            {...register("description", {
              required: "Description is required",
            })}
          />
          {errors.description && (
            <span className="text-error text-sm mt-1">
              {errors.description.message}
            </span>
          )}
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Banner Color</span>
          </label>
          <select
            className="select select-bordered w-full"
            {...register("color")}
          >
            {colorOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text">
              Allow users to dismiss this banner
            </span>
            <input
              type="checkbox"
              className="checkbox"
              {...register("isDismissable")}
            />
          </label>
        </div>

        <div className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text">
              Banner is active (will deactivate any other active banners)
            </span>
            <input
              type="checkbox"
              className="checkbox"
              {...register("isActive")}
            />
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setPreviewData(formValues)}
          >
            Preview
          </button>
          <button type="submit" className="btn btn-primary">
            Save Banner
          </button>
        </div>
      </form>

      {previewData && (
        <div className="mt-8">
          <h4 className="font-semibold mb-4">Preview:</h4>
          <div
            className={`border bg-${previewData.color}/10 text-${previewData.color} border-${previewData.color}/20 p-4 rounded-lg`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{previewData.title}</h3>
                <p className="mt-1">{previewData.description}</p>
              </div>
              {previewData.isDismissable && (
                <button
                  className="ml-4 text-base-content/60 hover:text-base-content"
                  aria-label="Dismiss banner"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
