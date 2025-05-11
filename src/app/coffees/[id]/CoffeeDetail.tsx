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
  Tag,
  Coffee,
  Heart,
} from "lucide-react";
import CoffeeImage from "@/app/components/coffee/CoffeeImage";
import BrewProfileCard from "@/app/components/BrewProfileCard";
import CoffeeCard from "@/app/components/coffee/CoffeeCard";
import RelatedItems from "@/app/components/RelatedItems";
import Toast from "@/app/components/Toast";
import CustomNotFound from "@/app/components/CustomNotFound";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import FavoriteButton from "@/app/components/FavoriteButton";

export default function CoffeeDetail({ id }: { id: string }) {
  const router = useRouter();
  const [coffee, setCoffee] = useState<any>(null);
  const [brewProfiles, setBrewProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Related coffees
  const [roasterCoffees, setRoasterCoffees] = useState<any[]>([]);
  const [similarCoffees, setSimilarCoffees] = useState<any[]>([]);

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

  // Fetch coffee data
  useEffect(() => {
    const fetchCoffee = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/coffees/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Coffee not found");
          } else {
            throw new Error("Failed to fetch coffee");
          }
        }

        const data = await response.json();
        setCoffee(data);
      } catch (err) {
        console.error("Error fetching coffee:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchCoffee();
  }, [id]);

  // Fetch brew profiles for this coffee
  useEffect(() => {
    const fetchBrewProfiles = async () => {
      if (!isLoggedIn) return;

      try {
        const response = await fetch("/api/brew-profiles");
        if (response.ok) {
          const allProfiles = await response.json();
          // Filter profiles for this coffee
          const coffeeProfiles = allProfiles.filter(
            (profile: any) => profile.coffeeId === id
          );
          setBrewProfiles(coffeeProfiles);
        }
      } catch (err) {
        console.error("Error fetching brew profiles:", err);
      }
    };

    if (coffee && isLoggedIn) {
      fetchBrewProfiles();
    }
  }, [id, coffee, isLoggedIn]);

  // Fetch related coffees
  useEffect(() => {
    const fetchRelatedCoffees = async () => {
      if (!coffee) return;

      try {
        // Fetch all coffees
        const response = await fetch("/api/coffees");
        if (response.ok) {
          const allCoffees = await response.json();

          // More from this roaster (excluding current coffee)
          const fromSameRoaster = allCoffees.filter(
            (c: any) => c.roasterId === coffee.roasterId && c.id !== coffee.id
          );
          setRoasterCoffees(fromSameRoaster);

          // Similar coffees based on tasting notes or process
          let similar: any[] = [];

          if (coffee.tastingNotes && coffee.tastingNotes.length > 0) {
            // Get tasting note names
            const currentTastingNotes = coffee.tastingNotes.map((note: any) =>
              note.name.toLowerCase()
            );

            // Find coffees with at least one matching tasting note
            similar = allCoffees.filter((c: any) => {
              if (c.id === coffee.id) return false; // Exclude current coffee
              if (c.roasterId === coffee.roasterId) return false; // Exclude coffees from same roaster

              // Check if this coffee has any matching tasting notes
              if (c.tastingNotes && c.tastingNotes.length > 0) {
                const otherTastingNotes = c.tastingNotes.map((note: any) =>
                  note.name.toLowerCase()
                );
                return currentTastingNotes.some((note: string) =>
                  otherTastingNotes.includes(note)
                );
              }

              return false;
            });
          }

          // If we don't have enough similar coffees by tasting notes, add some based on process
          if (similar.length < 3 && coffee.process) {
            const processSimilar = allCoffees.filter((c: any) => {
              if (c.id === coffee.id) return false; // Exclude current coffee
              if (c.roasterId === coffee.roasterId) return false; // Exclude coffees from same roaster
              if (similar.some((s) => s.id === c.id)) return false; // Exclude already added coffees

              return (
                c.process &&
                c.process.toLowerCase() === coffee.process.toLowerCase()
              );
            });

            similar = [...similar, ...processSimilar];
          }

          // If we still don't have enough, add some based on origin
          if (similar.length < 3 && coffee.countryOfOrigin) {
            const originSimilar = allCoffees.filter((c: any) => {
              if (c.id === coffee.id) return false; // Exclude current coffee
              if (c.roasterId === coffee.roasterId) return false; // Exclude coffees from same roaster
              if (similar.some((s) => s.id === c.id)) return false; // Exclude already added coffees

              return (
                c.countryOfOrigin &&
                c.countryOfOrigin.toLowerCase() ===
                  coffee.countryOfOrigin.toLowerCase()
              );
            });

            similar = [...similar, ...originSimilar];
          }

          setSimilarCoffees(similar.slice(0, 6)); // Limit to 6 similar coffees
        }
      } catch (err) {
        console.error("Error fetching related coffees:", err);
      }
    };

    fetchRelatedCoffees();
  }, [coffee]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/coffees/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete coffee");
      }

      router.push("/coffees");
    } catch (err) {
      console.error("Error deleting coffee:", err);
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !coffee) {
    return (
      <CustomNotFound
        explorePath="/coffees"
        exploreText="Explore Coffees"
        customMessage={error || "Coffee not found"}
      />
    );
  }

  // Debug log to check values
  console.log("CoffeeDetail - currentUserId:", currentUserId);
  console.log("CoffeeDetail - coffee.createdBy:", coffee.createdBy);

  // Temporarily allow any logged-in user to edit
  const isOwner = isLoggedIn; // Remove the check for currentUserId === coffee.createdBy

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/coffees"
          className="flex items-center text-gray-600 coffee:text-gray-300 hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Coffees
        </Link>
      </div>

      <div className="bg-white coffee:bg-gray-800 rounded-lg shadow-sm border border-gray-200 coffee:border-gray-700 overflow-hidden">
        <div className="p-6">
          {/* Action buttons - shown in a row above the title on all devices */}
          <div className="flex flex-wrap justify-end gap-2 mb-4">
            {isOwner && (
              <>
                <Link
                  href={`/coffees/${coffee.id}/edit`}
                  className="btn btn-outline btn-sm"
                >
                  <Edit size={16} className="mr-1" />
                  <span className="hidden sm:inline">Edit</span>
                </Link>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn btn-outline btn-error btn-sm"
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
              entityType="coffee"
              entityId={id}
              showText={true}
              className="btn btn-outline btn-sm"
            />
          </div>

          {/* Coffee header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">{coffee.name}</h1>
            <Link
              href={`/roasters/${coffee.roaster.id}`}
              className="flex items-center text-gray-600 coffee:text-gray-300 hover:text-primary transition-colors"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 coffee:bg-gray-700 mr-2">
                {coffee.roaster?.image ? (
                  <Image
                    src={coffee.roaster.image}
                    alt={coffee.roaster.name}
                    width={24}
                    height={24}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    ☕
                  </div>
                )}
              </div>
              <span>{coffee.roaster?.name}</span>
            </Link>
          </div>

          {/* Coffee Image */}
          {coffee.image && (
            <div className="mb-6">
              <CoffeeImage image={coffee.image} alt={coffee.name} height="md" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-lg font-medium mb-4">Coffee Details</h2>
              <div className="grid grid-cols-2 gap-4">
                {coffee.countryOfOrigin && (
                  <div className="flex items-start">
                    <MapPin size={18} className="mr-2 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 coffee:text-gray-400">
                        Origin
                      </p>
                      <p>{coffee.countryOfOrigin}</p>
                    </div>
                  </div>
                )}

                {coffee.process && (
                  <div className="flex items-start">
                    <Tag size={18} className="mr-2 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 coffee:text-gray-400">
                        Process
                      </p>
                      <p>{coffee.process}</p>
                    </div>
                  </div>
                )}

                {coffee.elevation && (
                  <div className="flex items-start">
                    <MapPin size={18} className="mr-2 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 coffee:text-gray-400">
                        Elevation
                      </p>
                      <p>{coffee.elevation}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Tasting Notes */}
              {coffee.tastingNotes && coffee.tastingNotes.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-md font-medium mb-2 flex items-center">
                    <Tag size={16} className="mr-2 text-gray-500" />
                    Tasting Notes
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {coffee.tastingNotes.map((note: any) => (
                      <span key={note.id} className="badge badge-sm">
                        {note.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              {coffee.description && (
                <div>
                  <h2 className="text-lg font-medium mb-4">Description</h2>
                  <p className="text-gray-600 coffee:text-gray-300 whitespace-pre-line">
                    {coffee.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Brew Profiles section */}
          {isLoggedIn && (
            <div className="mt-8 border-t border-gray-200 coffee:border-gray-700 pt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium">Brew Profiles</h2>
                <Link
                  href={`/brew-profiles/new?coffee=${coffee.id}`}
                  className="btn btn-primary btn-sm"
                >
                  <Coffee size={16} className="mr-1" />
                  Create Brew Profile
                </Link>
              </div>

              {brewProfiles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {brewProfiles.map((profile) => (
                    <BrewProfileCard key={profile.id} profile={profile} />
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 coffee:bg-gray-700 rounded-lg p-6 text-center">
                  <p className="text-gray-500 coffee:text-gray-400">
                    No brew profiles found for this coffee.
                  </p>
                  <Link
                    href={`/brew-profiles/new?coffee=${coffee.id}`}
                    className="btn btn-primary btn-sm mt-4"
                  >
                    <Coffee size={16} className="mr-1" />
                    Create First Brew Profile
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="border-t border-gray-200 coffee:border-gray-700 mt-8 pt-4 flex items-center justify-between text-sm text-gray-500 coffee:text-gray-400">
            <div>
              Added{" "}
              {formatDistanceToNow(new Date(coffee.createdAt), {
                addSuffix: true,
              })}
            </div>
          </div>
        </div>
      </div>

      {/* More from this roaster section */}
      {roasterCoffees.length > 0 && (
        <RelatedItems
          title={`More from ${coffee.roaster?.name}`}
          items={roasterCoffees.map((relatedCoffee) => (
            <CoffeeCard
              key={relatedCoffee.id}
              coffee={relatedCoffee}
              currentUserId={currentUserId || undefined}
            />
          ))}
          viewAllLink={`/coffees?roasterName=${encodeURIComponent(coffee.roaster?.name || "")}`}
          viewAllText="View all coffees from this roaster"
          emptyMessage={`No other coffees found from ${coffee.roaster?.name}`}
          maxItems={3}
          className="border-t border-gray-200 coffee:border-gray-700 pt-6"
        />
      )}

      {/* Similar coffees section */}
      {similarCoffees.length > 0 && (
        <RelatedItems
          title="You might also like"
          items={similarCoffees.map((relatedCoffee) => (
            <CoffeeCard
              key={relatedCoffee.id}
              coffee={relatedCoffee}
              currentUserId={currentUserId || undefined}
            />
          ))}
          emptyMessage="No similar coffees found"
          maxItems={3}
          className="border-t border-gray-200 coffee:border-gray-700 pt-6"
        />
      )}

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
    </div>
  );
}
