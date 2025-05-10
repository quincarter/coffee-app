"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import FilterableList, { FilterOption } from "../components/FilterableList";
import CoffeeCard from "../components/coffee/CoffeeCard";
import CoffeeCreationModal from "../components/coffee/CoffeeCreationModal";
import ImageUpload from "../components/ImageUpload";
import LoadingSpinner from "../components/LoadingSpinner";

export default function CoffeesPage() {
  const searchParams = useSearchParams();
  const [coffees, setCoffees] = useState<any[]>([]);
  const [roasters, setRoasters] = useState<FilterOption[]>([]);
  const [origins, setOrigins] = useState<FilterOption[]>([]);
  const [processes, setProcesses] = useState<FilterOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // State for coffee creation modal
  const [showCoffeeModal, setShowCoffeeModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [coffeeImage, setCoffeeImage] = useState<File | null>(null);
  const [availableTastingNotes, setAvailableTastingNotes] = useState<
    { id: string; name: string }[]
  >([]);
  const [availableOrigins, setAvailableOrigins] = useState<
    { id: string; name: string }[]
  >([]);
  const [availableProcesses, setAvailableProcesses] = useState<
    { id: string; name: string }[]
  >([]);

  // Form data for new coffee
  const [coffeeFormData, setCoffeeFormData] = useState({
    name: "",
    roasterId: "",
    description: "",
    countryOfOrigin: "",
    elevation: "",
    process: "",
    tastingNotes: [] as string[],
  });

  // Get roaster filter from URL if present
  const roasterIdFromUrl = searchParams.get("roaster");

  // Function to fetch dropdown data for the modal
  const fetchDropdownData = async () => {
    try {
      // Fetch tasting notes
      const tastingNotesResponse = await fetch("/api/tasting-notes");
      if (tastingNotesResponse.ok) {
        const tastingNotesData = await tastingNotesResponse.json();
        setAvailableTastingNotes(tastingNotesData);
      }

      // Fetch origins
      const originsResponse = await fetch("/api/coffee-origins");
      if (originsResponse.ok) {
        const originsData = await originsResponse.json();
        setAvailableOrigins(originsData);
      }

      // Fetch processes
      const processesResponse = await fetch("/api/coffee-processes");
      if (processesResponse.ok) {
        const processesData = await processesResponse.json();
        setAvailableProcesses(processesData);
      }
    } catch (err) {
      console.error("Error fetching dropdown data:", err);
    }
  };

  // Function to handle opening the coffee creation modal
  const handleAddCoffeeClick = () => {
    fetchDropdownData();
    setShowCoffeeModal(true);
  };

  // Function to handle closing the coffee creation modal
  const handleCloseModal = () => {
    setShowCoffeeModal(false);
    setModalError(null);
    setCoffeeFormData({
      name: "",
      roasterId: "",
      description: "",
      countryOfOrigin: "",
      elevation: "",
      process: "",
      tastingNotes: [],
    });
    setCoffeeImage(null);
  };

  // Function to handle form submission
  const handleSubmitCoffee = async () => {
    setIsSubmitting(true);
    setModalError(null);

    try {
      if (!coffeeFormData.name) throw new Error("Coffee name is required");
      if (!coffeeFormData.roasterId) throw new Error("Roaster is required");

      let imageUrl = null;

      // Upload image if one was selected
      if (coffeeImage) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", coffeeImage);
        uploadFormData.append("context", "coffee");

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

      // Prepare tasting notes data
      const tastingNotesData = coffeeFormData.tastingNotes.map((name) => ({
        name,
      }));

      // Create coffee
      const response = await fetch("/api/coffees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...coffeeFormData,
          image: imageUrl,
          tastingNotes: tastingNotesData,
          createdBy: currentUserId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create coffee");
      }

      const newCoffee = await response.json();

      // Add the new coffee to the list
      setCoffees((prevCoffees) => [
        {
          ...newCoffee,
          currentUserId: currentUserId,
        },
        ...prevCoffees,
      ]);

      // Close modal
      handleCloseModal();
    } catch (err) {
      console.error("Error creating coffee:", err);
      setModalError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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

        // Fetch coffees
        const coffeesRes = await fetch("/api/coffees");
        if (coffeesRes.ok) {
          const coffeesData = await coffeesRes.json();

          // Add user data to each coffee
          const coffeesWithUserData = coffeesData.map((coffee: any) => ({
            ...coffee,
            currentUserId: isLoggedIn ? currentUserId : null,
          }));

          setCoffees(coffeesWithUserData);
        }

        // Fetch roasters for filtering
        const roastersRes = await fetch("/api/coffee-roasters");
        if (roastersRes.ok) {
          const roastersData = await roastersRes.json();
          setRoasters(
            roastersData.map((roaster: any) => ({
              value: roaster.id,
              label: roaster.name,
            }))
          );
        }

        // Fetch origins for filtering
        const originsRes = await fetch("/api/coffee-origins");
        if (originsRes.ok) {
          const originsData = await originsRes.json();
          setOrigins(
            originsData.map((origin: any) => ({
              value: origin.name,
              label: origin.name,
            }))
          );
        }

        // Fetch processes for filtering
        const processesRes = await fetch("/api/coffee-processes");
        if (processesRes.ok) {
          const processesData = await processesRes.json();
          setProcesses(
            processesData.map((process: any) => ({
              value: process.name,
              label: process.name,
            }))
          );
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

  // Prepare filters for the FilterableList component
  const filters = [
    {
      name: "roasterId",
      options: roasters,
      placeholder: "Filter by roaster...",
    },
    {
      name: "countryOfOrigin",
      options: origins,
      placeholder: "Filter by origin...",
    },
    {
      name: "process",
      options: processes,
      placeholder: "Filter by process...",
    },
  ];

  // Set initial filter if roaster ID is in URL
  const initialFilters = roasterIdFromUrl
    ? { roasterId: roasterIdFromUrl }
    : {};

  return (
    <>
      <FilterableList
        title="Coffees"
        items={coffees}
        renderItem={(coffee) => (
          <CoffeeCard
            key={coffee.id}
            coffee={coffee}
            currentUserId={currentUserId || undefined}
          />
        )}
        filters={filters}
        searchPlaceholder="Search coffees..."
        createButtonLabel="Add New Coffee"
        createButtonLink="#"
        createButtonOnClick={handleAddCoffeeClick}
        loginButtonLabel="Log in to add coffees"
        loginButtonLink="/login"
        isLoggedIn={isLoggedIn}
        emptyStateMessage="No coffees found"
        noMatchesMessage="No coffees match your filters"
        gridCols={3}
        loading={loading}
      />

      {/* Coffee Creation Modal */}
      <CoffeeCreationModal
        show={showCoffeeModal}
        onClose={handleCloseModal}
        onSubmit={() => {
          handleSubmitCoffee();
        }}
        formData={coffeeFormData}
        setFormData={setCoffeeFormData}
        isLoading={isSubmitting}
        error={modalError}
        availableTastingNotes={availableTastingNotes}
        availableOrigins={availableOrigins}
        availableProcesses={availableProcesses}
      />
    </>
  );
}
