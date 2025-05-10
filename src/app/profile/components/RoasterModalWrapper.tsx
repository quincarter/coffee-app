"use client";

import { useState } from "react";
import RoasterCreationModal from "@/app/components/coffee/RoasterCreationModal";

type RoasterModalWrapperProps = {
  show: boolean;
  onClose: () => void;
  onRoasterCreated: (newRoaster: any) => void;
};

export default function RoasterModalWrapper({
  show,
  onClose,
  onRoasterCreated,
}: RoasterModalWrapperProps) {
  type RoasterFormData = {
    name: string;
    address: string;
    mapsLink: string;
    phoneNumber: string;
    notes: string;
    website: string;
  };

  const [roasterFormData, setRoasterFormData] = useState<RoasterFormData>({
    name: "",
    address: "",
    mapsLink: "",
    phoneNumber: "",
    notes: "",
    website: "",
  });

  const [roasterImage, setRoasterImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const handleSubmitRoaster = async () => {
    setIsSubmitting(true);
    setModalError(null);

    try {
      // Validate required fields
      if (!roasterFormData.name) {
        throw new Error("Roaster name is required");
      }

      // Upload image if provided
      let imageUrl = null;
      if (roasterImage) {
        const formData = new FormData();
        formData.append("file", roasterImage);
        formData.append("context", "roaster");

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const uploadError = await uploadRes.json();
          throw new Error(uploadError.error || "Failed to upload image");
        }

        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }

      // Create roaster
      const response = await fetch("/api/coffee-roasters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...roasterFormData,
          image: imageUrl,
          hasSingleLocation: true, // Default to single location for simplicity
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create roaster");
      }

      const newRoaster = await response.json();

      // Reset form
      setRoasterFormData({
        name: "",
        address: "",
        mapsLink: "",
        phoneNumber: "",
        notes: "",
        website: "",
      });
      setRoasterImage(null);

      // Call the callback with the new roaster
      onRoasterCreated(newRoaster);
    } catch (err) {
      console.error("Error creating roaster:", err);
      setModalError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RoasterCreationModal
      show={show}
      onClose={onClose}
      onSubmit={handleSubmitRoaster}
      formData={roasterFormData}
      setFormData={setRoasterFormData}
      roasterImage={roasterImage}
      setRoasterImage={setRoasterImage}
      isLoading={isSubmitting}
      error={modalError}
    />
  );
}
