"use client";

import { useState, useEffect } from "react";
import CoffeeCreationModal from "@/app/components/coffee/CoffeeCreationModal";
import { CoffeeFormData } from "@/app/types";

type CoffeeModalWrapperProps = {
  show: boolean;
  onClose: () => void;
  onCoffeeCreated: (newCoffee: any) => void;
};

export default function CoffeeModalWrapper({
  show,
  onClose,
  onCoffeeCreated,
}: CoffeeModalWrapperProps) {
  const [coffeeFormData, setCoffeeFormData] = useState<CoffeeFormData>({
    name: "",
    roasterId: "",
    description: "",
    countryOfOrigin: "",
    elevation: "",
    process: "",
    image: null,
    tastingNotes: [],
    variety: "",
    productUrl: "",
  });

  const [coffeeImage, setCoffeeImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [availableTastingNotes, setAvailableTastingNotes] = useState<any[]>([]);
  const [availableOrigins, setAvailableOrigins] = useState<any[]>([]);
  const [availableProcesses, setAvailableProcesses] = useState<any[]>([]);

  useEffect(() => {
    if (show) {
      fetchDropdownData();
    }
  }, [show]);

  const fetchDropdownData = async () => {
    try {
      // Fetch tasting notes
      const tastingNotesRes = await fetch("/api/coffee-tasting-notes");
      if (tastingNotesRes.ok) {
        const tastingNotesData = await tastingNotesRes.json();
        setAvailableTastingNotes(tastingNotesData);
      }

      // Fetch origins
      const originsRes = await fetch("/api/coffee-origins");
      if (originsRes.ok) {
        const originsData = await originsRes.json();
        setAvailableOrigins(originsData);
      }

      // Fetch processes
      const processesRes = await fetch("/api/coffee-processes");
      if (processesRes.ok) {
        const processesData = await processesRes.json();
        setAvailableProcesses(processesData);
      }
    } catch (err) {
      console.error("Error fetching dropdown data:", err);
    }
  };

  const handleSubmitCoffee = async () => {
    setIsSubmitting(true);
    setModalError(null);

    try {
      // Validate required fields
      if (!coffeeFormData.name) {
        throw new Error("Coffee name is required");
      }

      if (!coffeeFormData.roasterId) {
        throw new Error("Please select a roaster");
      }

      // Upload image if provided
      let imageUrl = null;
      if (coffeeImage) {
        const formData = new FormData();
        formData.append("file", coffeeImage);
        formData.append("context", "coffee");

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

      // Create coffee
      const response = await fetch("/api/coffees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...coffeeFormData,
          image: imageUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create coffee");
      }

      const newCoffee = await response.json();

      // Reset form
      setCoffeeFormData({
        name: "",
        roasterId: "",
        description: "",
        countryOfOrigin: "",
        elevation: "",
        image: null,
        process: "",
        tastingNotes: [],
        variety: "",
        productUrl: "", // Added this line
      });
      setCoffeeImage(null);

      // Call the callback with the new coffee
      onCoffeeCreated(newCoffee);
    } catch (err) {
      console.error("Error creating coffee:", err);
      setModalError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CoffeeCreationModal
      show={show}
      onClose={onClose}
      onSubmit={handleSubmitCoffee}
      formData={coffeeFormData}
      setFormData={setCoffeeFormData}
      isLoading={isSubmitting}
      error={modalError}
      availableTastingNotes={availableTastingNotes}
      availableOrigins={availableOrigins}
      availableProcesses={availableProcesses}
    />
  );
}
