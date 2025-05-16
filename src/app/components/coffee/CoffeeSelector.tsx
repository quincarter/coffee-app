"use client";

import { useState, useEffect } from "react";
import { Coffee, CoffeeRoaster } from "@prisma/client";
import SearchableDropdown from "../SearchableDropdown";
import BottomSheet from "../ui/BottomSheet";
import ImageUpload from "../ImageUpload";
import CoffeeImage from "./CoffeeImage";
import VarietyDropdown, { CoffeeVariety } from "./VarietyDropdown";
import TastingNotesDropdown from "./TastingNotesDropdown";
import CoffeeNameField from "./CoffeeNameField";
import ProcessDropdown from "./ProcessDropdown";

type CoffeeSelectorProps = {
  selectedRoaster: string;
  selectedCoffeeId: string;
  onCoffeeSelect: (coffeeId: string) => void;
  userId?: string;
  disabled?: boolean;
};

export default function CoffeeSelector({
  selectedRoaster,
  selectedCoffeeId,
  onCoffeeSelect,
  userId,
  disabled = false,
}: CoffeeSelectorProps) {
  // State
  const [coffees, setCoffees] = useState<Coffee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal state
  const [showCoffeeModal, setShowCoffeeModal] = useState(false);

  // Coffee form data
  const [coffeeFormData, setCoffeeFormData] = useState({
    name: "",
    roasterId: selectedRoaster,
    description: "",
    countryOfOrigin: "",
    elevation: "",
    process: "",
    variety: "",
    tastingNotes: [] as string[],
  });
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Data for coffee form dropdowns
  const [availableTastingNotes, setAvailableTastingNotes] = useState<
    { id: string; name: string }[]
  >([]);
  const [availableOrigins, setAvailableOrigins] = useState<
    { id: string; name: string }[]
  >([]);
  const [availableProcesses, setAvailableProcesses] = useState<
    { id: string; name: string }[]
  >([]);

  // Fetch coffees when the selected roaster changes
  useEffect(() => {
    const fetchCoffees = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/coffees");
        if (!response.ok) {
          throw new Error("Failed to fetch coffees");
        }
        const data = await response.json();
        setCoffees(data);
      } catch (err) {
        console.error("Error fetching coffees:", err);
        setError("Failed to load coffees");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoffees();
  }, []);

  // Fetch dropdown data
  useEffect(() => {
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
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };

    if (showCoffeeModal) {
      fetchDropdownData();
    }
  }, [showCoffeeModal]);

  // Filter coffees by selected roaster
  const filteredCoffees = coffees.filter(
    (coffee) => !selectedRoaster || coffee.roasterId === selectedRoaster
  );

  // Handle adding a new coffee
  const handleAddCoffee = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!coffeeFormData.name) throw new Error("Coffee name is required");
      if (!selectedRoaster) throw new Error("Please select a roaster");

      const response = await fetch("/api/coffees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...coffeeFormData,
          roasterId: selectedRoaster,
          createdBy: userId,
          image: imageUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add coffee");
      }

      const newCoffee = await response.json();

      // Update coffees list
      setCoffees([...coffees, newCoffee]);

      // Select the new coffee
      onCoffeeSelect(newCoffee.id);

      // Reset form
      setCoffeeFormData({
        name: "",
        roasterId: selectedRoaster,
        description: "",
        countryOfOrigin: "",
        elevation: "",
        process: "",
        variety: "",
        tastingNotes: [],
      });
      setImageUrl(null);

      // Close modal with animation
      closeCoffeeModal();

      // Show success message
      setSuccess("Coffee added successfully!");
    } catch (err) {
      console.error("Error adding coffee:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Functions to handle coffee modal opening and closing
  const openCoffeeModal = () => {
    setShowCoffeeModal(true);
  };

  const closeCoffeeModal = () => {
    setShowCoffeeModal(false);
    // Reset form when closing
    setCoffeeFormData({
      name: "",
      roasterId: selectedRoaster,
      description: "",
      countryOfOrigin: "",
      elevation: "",
      process: "",
      variety: "",
      tastingNotes: [],
    });
    setImageUrl(null);
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1">Coffee</label>
      <div className="flex items-center gap-2">
        <div className="flex-grow">
          <SearchableDropdown
            options={filteredCoffees.map((coffee) => ({
              value: coffee.id,
              label: coffee.name,
            }))}
            value={selectedCoffeeId}
            onChange={(value) => {
              if (Array.isArray(value)) {
                onCoffeeSelect(value[0] || "");
              } else {
                onCoffeeSelect(value);
              }
            }}
            label=""
            placeholder={
              selectedRoaster
                ? "Search for a coffee..."
                : "Select a roaster first"
            }
            disabled={disabled || !selectedRoaster || showCoffeeModal}
            noOptionsMessage={
              selectedRoaster
                ? "No coffees found for this roaster"
                : "Select a roaster first"
            }
            multiple={false}
          />
        </div>
        <button
          type="button"
          className="btn btn-sm btn-outline"
          onClick={openCoffeeModal}
          disabled={!selectedRoaster}
        >
          Add New
        </button>
      </div>

      {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
      {success && <div className="text-green-500 text-sm mt-1">{success}</div>}

      {/* Display selected coffee image if available */}
      {selectedCoffeeId && (
        <>
          {coffees.find((coffee) => coffee.id === selectedCoffeeId)?.image && (
            <div className="mt-3">
              <CoffeeImage
                image={
                  coffees.find((coffee) => coffee.id === selectedCoffeeId)
                    ?.image || ""
                }
                alt={
                  coffees.find((coffee) => coffee.id === selectedCoffeeId)
                    ?.name || "Coffee"
                }
                height="sm"
              />
            </div>
          )}
        </>
      )}

      {/* Coffee Creation Modal */}
      {showCoffeeModal && (
        <BottomSheet
          show={showCoffeeModal}
          onClose={closeCoffeeModal}
          title="Add New Coffee"
        >
          {error && (
            <div className="alert alert-error mb-4 text-sm">{error}</div>
          )}

          <div className="space-y-3">
            {/* Coffee Name */}
            <CoffeeNameField
              value={coffeeFormData.name}
              onChange={(value) =>
                setCoffeeFormData({
                  ...coffeeFormData,
                  name: value,
                })
              }
            />

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                value={coffeeFormData.description}
                onChange={(e) =>
                  setCoffeeFormData({
                    ...coffeeFormData,
                    description: e.target.value,
                  })
                }
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
                value={coffeeFormData.countryOfOrigin}
                onChange={(value) => {
                  if (Array.isArray(value)) {
                    setCoffeeFormData({
                      ...coffeeFormData,
                      countryOfOrigin: value[0] || "",
                    });
                  } else {
                    setCoffeeFormData({
                      ...coffeeFormData,
                      countryOfOrigin: value,
                    });
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
            <ProcessDropdown
              value={coffeeFormData.process}
              onChange={(value) => {
                setCoffeeFormData({
                  ...coffeeFormData,
                  process: value,
                });
              }}
              options={availableProcesses}
            />

            {/* Elevation */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Elevation
              </label>
              <input
                type="text"
                value={coffeeFormData.elevation}
                onChange={(e) =>
                  setCoffeeFormData({
                    ...coffeeFormData,
                    elevation: e.target.value,
                  })
                }
                className="input input-bordered w-full"
                placeholder="e.g., 1200-1500 masl"
              />
            </div>

            {/* Variety */}
            <VarietyDropdown
              value={coffeeFormData.variety as CoffeeVariety}
              onChange={(value) => {
                setCoffeeFormData({
                  ...coffeeFormData,
                  variety: value,
                });
              }}
            />

            {/* Coffee Image */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Coffee Image
              </label>
              <ImageUpload
                initialImage={imageUrl}
                onImageUploaded={setImageUrl}
                uploadContext="coffee"
                label="Image"
                height="sm"
                className="w-full"
              />
            </div>

            {/* Tasting Notes */}
            <TastingNotesDropdown
              value={coffeeFormData.tastingNotes}
              onChange={(value) => {
                setCoffeeFormData({
                  ...coffeeFormData,
                  tastingNotes: value,
                });
              }}
              options={availableTastingNotes}
            />

            <div className="flex justify-end space-x-2 mt-4">
              <button
                type="button"
                onClick={closeCoffeeModal}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAddCoffee}
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
      )}
    </div>
  );
}
