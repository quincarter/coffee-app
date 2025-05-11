"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  Edit,
  Trash,
  Share,
  MapPin,
  Phone,
  Globe,
  Coffee,
  MapPinned,
} from "lucide-react";
import CoffeeCard from "@/app/components/coffee/CoffeeCard";
import Toast from "@/app/components/Toast";
import CustomNotFound from "@/app/components/CustomNotFound";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import CoffeeCreationModal from "@/app/components/coffee/CoffeeCreationModal";
import LocationCard from "@/app/components/coffee/LocationCard";
import LocationCreationModal from "@/app/components/coffee/LocationCreationModal";
import FavoriteButton from "@/app/components/FavoriteButton";

export default function RoasterDetail({
  id,
  userId,
}: {
  id: string;
  userId: string | undefined;
}) {
  const router = useRouter();
  const [roaster, setRoaster] = useState<any>(null);
  const [coffees, setCoffees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // State for coffee creation modal
  const [showCoffeeModal, setShowCoffeeModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
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
    roasterId: id,
    description: "",
    countryOfOrigin: "",
    elevation: "",
    process: "",
    tastingNotes: [] as string[],
  });

  // Fetch user info to determine if they're logged in and the owner
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const userData = await response.json();
          setIsLoggedIn(true);
          setCurrentUserId(userData.id);
        } else {
          setIsLoggedIn(false);
          setCurrentUserId(null);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        setIsLoggedIn(false);
        setCurrentUserId(null);
      }
    };

    fetchUserInfo();
  }, []);

  // Fetch roaster data
  useEffect(() => {
    const fetchRoaster = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/coffee-roasters/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Roaster not found");
          } else {
            throw new Error("Failed to fetch roaster");
          }
        }

        const data = await response.json();
        setRoaster(data);
      } catch (err) {
        console.error("Error fetching roaster:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchRoaster();
  }, [id]);

  // Fetch coffees for this roaster
  useEffect(() => {
    const fetchCoffees = async () => {
      try {
        const response = await fetch("/api/coffees");
        if (response.ok) {
          const allCoffees = await response.json();
          // Filter coffees for this roaster
          const roasterCoffees = allCoffees.filter(
            (coffee: any) => coffee.roasterId === id
          );
          setCoffees(roasterCoffees);
        }
      } catch (err) {
        console.error("Error fetching coffees:", err);
      }
    };

    if (roaster) {
      fetchCoffees();
    }
  }, [id, roaster]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/coffee-roasters/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete roaster");
      }

      router.push("/roasters");
    } catch (err) {
      console.error("Error deleting roaster:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      // Hide any existing toast first to ensure animation works properly
      setShowToast(false);

      // Small delay to ensure state updates before showing new toast
      setTimeout(() => {
        setToastMessage("Link copied to clipboard!");
        setShowToast(true);
      }, 100);
    } catch (err) {
      console.error("Failed to copy link:", err);
      // Hide any existing toast first
      setShowToast(false);

      // Small delay to ensure state updates before showing new toast
      setTimeout(() => {
        setToastMessage("Failed to copy link");
        setShowToast(true);
      }, 100);
    }
  };

  // Function to fetch dropdown data for the coffee modal
  const fetchDropdownData = async () => {
    try {
      // Fetch tasting notes
      const tastingNotesResponse = await fetch("/api/coffee-tasting-notes");
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
      roasterId: id,
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
      const tastingNotesData = [...coffeeFormData.tastingNotes];

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

      // Get the response data
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

      // Show success toast
      setToastMessage("Coffee added successfully!");
      setShowToast(true);
    } catch (err) {
      console.error("Error creating coffee:", err);
      setModalError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !roaster) {
    return (
      <CustomNotFound
        explorePath="/roasters"
        exploreText="Explore Roasters"
        customMessage={error || "Roaster not found"}
      />
    );
  }

  // Check if the user is logged in and is the owner of the roaster
  const isOwner = isLoggedIn && currentUserId === roaster.createdBy;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/roasters"
          className="flex items-center text-gray-600 coffee:text-gray-300 hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Roasters
        </Link>
      </div>

      <div className="bg-white coffee:bg-gray-800 rounded-lg shadow-sm border border-gray-200 coffee:border-gray-700 overflow-hidden">
        <div className="p-6">
          {/* Action buttons - shown in a row above the title on all devices */}
          <div className="flex flex-wrap justify-end gap-2 mb-4">
            {isOwner && (
              <>
                <Link
                  href={`/roasters/${roaster.id}/edit`}
                  className="btn btn-outline btn-sm"
                >
                  <Edit size={16} className="mr-1" />
                  <span className="hidden sm:inline">Edit</span>
                </Link>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn btn-outline btn-error btn-sm"
                  disabled={roaster._count?.coffees > 0}
                  title={
                    roaster._count?.coffees > 0
                      ? "Cannot delete roaster with associated coffees"
                      : "Delete roaster"
                  }
                >
                  <Trash size={16} className="mr-1" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </>
            )}
            <button onClick={handleShare} className="btn btn-outline btn-sm">
              <Share size={16} className="mr-1" />
              <span className="hidden sm:inline">Share</span>
            </button>
            <FavoriteButton
              entityType="roaster"
              entityId={id}
              showText={true}
              className="btn btn-outline btn-sm"
            />
          </div>

          {/* Roaster header */}
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 coffee:bg-gray-700 mr-4 flex-shrink-0">
              {roaster.image ? (
                <Image
                  src={roaster.image}
                  alt={roaster.name}
                  width={64}
                  height={64}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                  ☕
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{roaster.name}</h1>
              <div className="flex items-center mt-1">
                <Coffee size={16} className="mr-1 text-gray-500" />
                <span className="text-gray-600 coffee:text-gray-300">
                  {roaster._count?.coffees || 0}{" "}
                  {roaster._count?.coffees === 1 ? "coffee" : "coffees"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-lg font-medium mb-4">Contact Information</h2>
              <div className="space-y-3">
                {roaster.address && (
                  <div className="flex items-start">
                    <MapPin size={18} className="mr-2 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 coffee:text-gray-400">
                        Address
                      </p>
                      <p>
                        {roaster.mapsLink ? (
                          <a
                            href={roaster.mapsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {roaster.address}
                          </a>
                        ) : (
                          roaster.address
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {roaster.phoneNumber && (
                  <div className="flex items-start">
                    <Phone size={18} className="mr-2 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 coffee:text-gray-400">
                        Phone
                      </p>
                      <p>
                        <a
                          href={`tel:${roaster.phoneNumber}`}
                          className="text-primary hover:underline"
                        >
                          {roaster.phoneNumber}
                        </a>
                      </p>
                    </div>
                  </div>
                )}

                {roaster.website && (
                  <div className="flex items-start">
                    <Globe size={18} className="mr-2 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 coffee:text-gray-400">
                        Website
                      </p>
                      <p>
                        <a
                          href={roaster.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {roaster.website.replace(/^https?:\/\//, "")}
                        </a>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              {roaster.notes && (
                <div>
                  <h2 className="text-lg font-medium mb-4">About</h2>
                  <p className="text-gray-600 coffee:text-gray-300 whitespace-pre-line">
                    {roaster.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Locations section */}
          <div className="mt-8 border-t border-gray-200 coffee:border-gray-700 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium">Locations</h2>
              <div className="flex items-center gap-2">
                {isOwner && (
                  <div className="flex items-center">
                    <label className="cursor-pointer flex items-center">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary checkbox-sm mr-2"
                        checked={roaster.hasSingleLocation}
                        onChange={async () => {
                          try {
                            const response = await fetch(
                              `/api/coffee-roasters/${id}`,
                              {
                                method: "PUT",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                  ...roaster,
                                  hasSingleLocation: !roaster.hasSingleLocation,
                                }),
                              }
                            );

                            if (response.ok) {
                              const data = await response.json();
                              setRoaster(data);
                              setToastMessage(
                                data.hasSingleLocation
                                  ? "Using main roaster info as single location"
                                  : "Multiple locations enabled"
                              );
                              setShowToast(true);
                            }
                          } catch (err) {
                            console.error("Error updating roaster:", err);
                          }
                        }}
                      />
                      <span className="text-sm">Single location only</span>
                    </label>
                  </div>
                )}
                {isLoggedIn && !roaster.hasSingleLocation && (
                  <button
                    onClick={() => setShowLocationModal(true)}
                    className="btn btn-primary btn-sm"
                  >
                    <MapPinned size={16} className="mr-1" />
                    Add Location
                  </button>
                )}
              </div>
            </div>

            {roaster.hasSingleLocation ? (
              // Show main roaster info as a single location
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <div className="bg-white coffee:bg-gray-800 rounded-lg shadow-sm border border-gray-200 coffee:border-gray-700 overflow-hidden">
                  <div className="p-4">
                    {/* Location header with image */}
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 coffee:bg-gray-700 mr-3 flex-shrink-0">
                        {roaster.image ? (
                          <Image
                            src={roaster.image}
                            alt={roaster.name}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">
                            🏬
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium">
                            Main Location
                            <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                              Main
                            </span>
                          </h3>
                        </div>
                        <p className="text-sm text-gray-500 coffee:text-gray-400">
                          {roaster.name}
                        </p>
                      </div>
                    </div>

                    {/* Location details */}
                    <div className="space-y-2">
                      {roaster.address && (
                        <div className="flex items-start">
                          <MapPin
                            size={16}
                            className="mr-2 text-gray-500 mt-0.5"
                          />
                          <div>
                            {roaster.mapsLink ? (
                              <a
                                href={roaster.mapsLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {roaster.address}
                              </a>
                            ) : (
                              <span>{roaster.address}</span>
                            )}
                          </div>
                        </div>
                      )}

                      {roaster.phoneNumber && (
                        <div className="flex items-center">
                          <Phone size={16} className="mr-2 text-gray-500" />
                          <a
                            href={`tel:${roaster.phoneNumber}`}
                            className="text-primary hover:underline"
                          >
                            {roaster.phoneNumber}
                          </a>
                        </div>
                      )}

                      {roaster.website && (
                        <div className="flex items-center">
                          <Globe size={16} className="mr-2 text-gray-500" />
                          <a
                            href={roaster.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {roaster.website.replace(/^https?:\/\//, "")}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : roaster.locations && roaster.locations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {roaster.locations.map((location: any) => (
                  <LocationCard
                    key={location.id}
                    location={location}
                    roasterName={roaster.name}
                    onUpdate={() => {
                      // Refresh roaster data to get updated locations
                      const fetchRoaster = async () => {
                        try {
                          const response = await fetch(
                            `/api/coffee-roasters/${id}`
                          );
                          if (response.ok) {
                            const data = await response.json();
                            setRoaster(data);
                          }
                        } catch (err) {
                          console.error("Error refreshing roaster data:", err);
                        }
                      };
                      fetchRoaster();
                    }}
                    onDelete={() => {
                      // Refresh roaster data to get updated locations
                      const fetchRoaster = async () => {
                        try {
                          const response = await fetch(
                            `/api/coffee-roasters/${id}`
                          );
                          if (response.ok) {
                            const data = await response.json();
                            setRoaster(data);
                          }
                        } catch (err) {
                          console.error("Error refreshing roaster data:", err);
                        }
                      };
                      fetchRoaster();
                    }}
                    onSetMainLocation={() => {
                      // Refresh roaster data to get updated locations
                      const fetchRoaster = async () => {
                        try {
                          const response = await fetch(
                            `/api/coffee-roasters/${id}`
                          );
                          if (response.ok) {
                            const data = await response.json();
                            setRoaster(data);
                          }
                        } catch (err) {
                          console.error("Error refreshing roaster data:", err);
                        }
                      };
                      fetchRoaster();
                    }}
                    isOwner={isOwner}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 coffee:bg-gray-700 rounded-lg p-6 text-center mb-8">
                <p className="text-gray-500 coffee:text-gray-400">
                  {roaster.hasSingleLocation
                    ? "Using main roaster information as the single location."
                    : "No locations found for this roaster."}
                </p>
                {isLoggedIn && !roaster.hasSingleLocation && (
                  <button
                    onClick={() => setShowLocationModal(true)}
                    className="btn btn-primary btn-sm mt-4"
                  >
                    <MapPinned size={16} className="mr-1" />
                    Add First Location
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Coffees section */}
          <div className="mt-8 border-t border-gray-200 coffee:border-gray-700 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium">Coffees</h2>
              {isLoggedIn && (
                <button
                  onClick={handleAddCoffeeClick}
                  className="btn btn-primary btn-sm"
                >
                  <Coffee size={16} className="mr-1" />
                  Add Coffee
                </button>
              )}
            </div>

            {coffees.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {coffees.map((coffee) => (
                  <CoffeeCard
                    key={coffee.id}
                    coffee={coffee}
                    currentUserId={currentUserId || undefined}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 coffee:bg-gray-700 rounded-lg p-6 text-center">
                <p className="text-gray-500 coffee:text-gray-400">
                  No coffees found for this roaster.
                </p>
                {isLoggedIn && (
                  <button
                    onClick={handleAddCoffeeClick}
                    className="btn btn-primary btn-sm mt-4"
                  >
                    <Coffee size={16} className="mr-1" />
                    Add First Coffee
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 coffee:border-gray-700 mt-8 pt-4 flex items-center justify-between text-sm text-gray-500 coffee:text-gray-400">
            <div>
              Added{" "}
              {formatDistanceToNow(new Date(roaster.createdAt), {
                addSuffix: true,
              })}
            </div>
          </div>
        </div>
      </div>

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
                className="btn btn-outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button className="btn btn-error" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      <div className="toast-container">
        {showToast && (
          <Toast
            message={toastMessage}
            type="success"
            duration={3000}
            onClose={() => setShowToast(false)}
          />
        )}
      </div>

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

      {/* Location Creation Modal */}
      <LocationCreationModal
        show={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        roasterId={id}
        roasterName={roaster.name}
        isFirstLocation={!roaster.locations || roaster.locations.length === 0}
        onSuccess={() => {
          setShowLocationModal(false);
          // Refresh roaster data to get updated locations
          const fetchRoaster = async () => {
            try {
              const response = await fetch(`/api/coffee-roasters/${id}`);
              if (response.ok) {
                const data = await response.json();
                setRoaster(data);
                // Show success toast
                setToastMessage("Location added successfully!");
                setShowToast(true);
              }
            } catch (err) {
              console.error("Error refreshing roaster data:", err);
            }
          };
          fetchRoaster();
        }}
      />
    </div>
  );
}
