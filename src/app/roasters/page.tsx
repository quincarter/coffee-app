"use client";

import { useState, useEffect } from "react";
import FilterableList from "../components/FilterableList";
import RoasterCard from "../components/coffee/RoasterCard";
import RoasterCreationModal from "../components/coffee/RoasterCreationModal";
import { RoasterFormData } from "../types";

export default function RoastersPage() {
  const [roasters, setRoasters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // State for roaster creation modal
  const [showRoasterModal, setShowRoasterModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form data for new roaster
  const [roasterFormData, setRoasterFormData] = useState<RoasterFormData>({
    name: "",
    address: "",
    mapsLink: "",
    phoneNumber: "",
    notes: "",
    website: "",
    image: null as string | null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Check if user is logged in
        const userRes = await fetch("/api/user/profile");
        if (userRes.ok) {
          const userData = await userRes.json();
          setIsLoggedIn(true);
          setCurrentUserId(userData.id);
        } else {
          setIsLoggedIn(false);
          setCurrentUserId(null);
        }

        // Fetch roasters with coffee count
        const roastersRes = await fetch("/api/coffee-roasters");
        if (roastersRes.ok) {
          const roastersData = await roastersRes.json();

          // Set the roasters data directly
          setRoasters(roastersData);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUserId, isLoggedIn]);

  // Function to handle opening the roaster creation modal
  const handleAddRoasterClick = () => {
    setShowRoasterModal(true);
  };

  // Function to handle closing the roaster creation modal
  const handleCloseModal = () => {
    setShowRoasterModal(false);
    setModalError(null);
    setRoasterFormData({
      name: "",
      address: "",
      mapsLink: "",
      phoneNumber: "",
      notes: "",
      website: "",
      image: null,
    });
  };

  // Function to handle form submission
  const handleSubmitRoaster = async () => {
    setIsSubmitting(true);
    setModalError(null);

    try {
      if (!roasterFormData.name) throw new Error("Roaster name is required");

      // Create roaster
      const response = await fetch("/api/coffee-roasters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...roasterFormData,
          createdBy: currentUserId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create roaster");
      }

      const newRoaster = await response.json();

      // Add the new roaster to the list
      setRoasters((prevRoasters) => [
        {
          ...newRoaster,
          currentUserId: currentUserId,
        },
        ...prevRoasters,
      ]);

      // Close modal
      handleCloseModal();
    } catch (err) {
      console.error("Error creating roaster:", err);
      setModalError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <FilterableList
        title="Coffee Roasters"
        items={roasters}
        renderItem={(roaster) => (
          <RoasterCard
            key={roaster.id}
            roaster={roaster}
            currentUserId={currentUserId || undefined}
          />
        )}
        searchPlaceholder="Search roasters..."
        createButtonLabel="Add New Roaster"
        createButtonLink="#"
        createButtonOnClick={handleAddRoasterClick}
        loginButtonLabel="Log in to add roasters"
        loginButtonLink="/login"
        isLoggedIn={isLoggedIn}
        emptyStateMessage="No roasters found"
        noMatchesMessage="No roasters match your filters"
        // gridCols prop removed
        loading={loading}
      />

      {/* Roaster Creation Modal */}
      <RoasterCreationModal
        show={showRoasterModal}
        onClose={handleCloseModal}
        onSubmit={() => {
          handleSubmitRoaster();
        }}
        formData={roasterFormData}
        setFormData={setRoasterFormData}
        isLoading={isSubmitting}
        error={modalError}
      />
    </>
  );
}
