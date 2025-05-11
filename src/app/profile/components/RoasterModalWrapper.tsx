"use client";

import { useState } from "react";
import RoasterCreationModal from "@/app/components/coffee/RoasterCreationModal";
import { RoasterFormData } from "@/app/types";

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


  const [roasterFormData, setRoasterFormData] = useState<RoasterFormData>({
    name: "",
    address: "",
    mapsLink: "",
    phoneNumber: "",
    notes: "",
    website: "",
    image: null,
  });

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

      // Create roaster
      const response = await fetch("/api/coffee-roasters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...roasterFormData,
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
        image: null,
      });

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
      isLoading={isSubmitting}
      error={modalError}
    />
  );
}
