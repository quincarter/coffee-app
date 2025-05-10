"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Edit,
  Trash,
  Share,
  Coffee,
  Droplet,
  Scale,
  Calendar,
  Tag,
  Heart,
} from "lucide-react";
import CoffeeImage from "@/app/components/coffee/CoffeeImage";
import CoffeeCard from "@/app/components/coffee/CoffeeCard";
import BrewProfileCard from "@/app/components/BrewProfileCard";
import RelatedItems from "@/app/components/RelatedItems";
import Toast from "@/app/components/Toast";
import CustomNotFound from "@/app/components/CustomNotFound";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import FavoriteButton from "@/app/components/FavoriteButton";

export default function BrewProfileDetail({ id }: { id: string }) {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Related items
  const [similarProfiles, setSimilarProfiles] = useState<any[]>([]);
  const [moreCoffeesFromRoaster, setMoreCoffeesFromRoaster] = useState<any[]>(
    []
  );

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

  // Fetch brew profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        // First try to fetch as an authenticated user
        let response = await fetch(`/api/brew-profiles/${id}`);

        // If unauthorized (not logged in), try to fetch as public
        if (response.status === 401) {
          response = await fetch(`/api/public/brew-profiles/${id}`);
        }

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Brew profile not found");
          } else if (response.status === 403) {
            throw new Error("This brew profile is private");
          } else {
            throw new Error("Failed to fetch brew profile");
          }
        }

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        console.error("Error fetching brew profile:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  // Fetch related items
  useEffect(() => {
    const fetchRelatedItems = async () => {
      if (!profile || !profile.coffee) return;

      try {
        // Fetch similar brew profiles
        const profilesResponse = await fetch("/api/brew-profiles");
        if (profilesResponse.ok) {
          const allProfiles = await profilesResponse.json();

          // Find profiles with the same coffee or similar brewing device
          const similar = allProfiles.filter((p: any) => {
            if (p.id === id) return false; // Exclude current profile

            // Same coffee
            if (p.coffeeId === profile.coffeeId) return true;

            // Same brewing device
            if (p.brewDeviceId === profile.brewDeviceId) return true;

            return false;
          });

          setSimilarProfiles(similar.slice(0, 3));
        }

        // Fetch more coffees from the same roaster
        if (profile.coffee.roasterId) {
          const coffeesResponse = await fetch("/api/coffees");
          if (coffeesResponse.ok) {
            const allCoffees = await coffeesResponse.json();

            // Filter coffees from the same roaster (excluding the current coffee)
            const roasterCoffees = allCoffees.filter(
              (c: any) =>
                c.roasterId === profile.coffee.roasterId &&
                c.id !== profile.coffeeId
            );

            setMoreCoffeesFromRoaster(roasterCoffees.slice(0, 3));
          }
        }
      } catch (err) {
        console.error("Error fetching related items:", err);
      }
    };

    fetchRelatedItems();
  }, [id, profile]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/brew-profiles/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete brew profile");
      }

      router.push("/brew-profiles");
    } catch (err) {
      console.error("Error deleting brew profile:", err);
      setError("Failed to delete brew profile. Please try again.");
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

  if (error || !profile) {
    return (
      <CustomNotFound
        explorePath="/brew-profiles"
        exploreText="Explore Brew Profiles"
        customMessage={error || "Brew profile not found"}
      />
    );
  }

  // Debug log to check values
  console.log("BrewProfileDetail - currentUserId:", currentUserId);
  console.log("BrewProfileDetail - profile.userId:", profile.userId);

  // Temporarily allow any logged-in user to edit
  const isOwner = isLoggedIn; // Remove the check for currentUserId === profile.userId

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href={isLoggedIn ? "/brew-profiles" : "/"}
          className="flex items-center text-gray-600 coffee:text-gray-300 hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          {isLoggedIn ? "Back to Brew Profiles" : "Back to Home"}
        </Link>
      </div>

      <div className="bg-white coffee:bg-gray-800 rounded-lg shadow-sm border border-gray-200 coffee:border-gray-700 overflow-hidden">
        <div className="p-6">
          {/* Action buttons - shown in a row above the title on all devices */}
          <div className="flex flex-wrap justify-end gap-2 mb-4">
            {isOwner && (
              <>
                <Link
                  href={`/brew-profiles/${profile.id}/edit`}
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
              entityType="brew-profile"
              entityId={id}
              showText={true}
              className="btn btn-outline btn-sm"
            />
          </div>

          {/* Title and roaster info */}
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <h1 className="text-2xl font-bold">{profile.coffee?.name}</h1>
              {profile.coffee?.id && (
                <Link
                  href={`/coffees/${profile.coffee.id}`}
                  className="ml-2 text-primary hover:text-primary-focus transition-colors"
                  aria-label="View coffee details"
                >
                  <ArrowLeft size={18} className="rotate-180" />
                </Link>
              )}
            </div>
            {profile.coffee?.roaster?.id && (
              <Link
                href={`/roasters/${profile.coffee.roaster.id}`}
                className="flex items-center hover:text-primary transition-colors"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 coffee:bg-gray-700 mr-2">
                  {profile.coffee?.roaster?.image ? (
                    <Image
                      src={profile.coffee.roaster.image}
                      alt={profile.coffee.roaster.name}
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
                <span className="text-gray-600 coffee:text-gray-300 hover:underline">
                  {profile.coffee?.roaster?.name}
                </span>
              </Link>
            )}
          </div>

          {/* Coffee Image */}
          {profile.coffee?.image && profile.coffee?.id && (
            <div className="mb-6">
              <Link href={`/coffees/${profile.coffee.id}`}>
                <CoffeeImage
                  image={profile.coffee.image}
                  alt={profile.coffee.name}
                  height="md"
                />
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-lg font-medium mb-4">Brew Details</h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Coffee size={18} className="mr-2 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500 coffee:text-gray-400">
                      Coffee Amount
                    </p>
                    <p>{profile.coffeeAmount}g</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Droplet size={18} className="mr-2 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500 coffee:text-gray-400">
                      Water
                    </p>
                    <p>{profile.waterAmount}g</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Scale size={18} className="mr-2 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500 coffee:text-gray-400">
                      Ratio
                    </p>
                    <p>{profile.ratio}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-5 h-5 mr-2 flex items-center justify-center">
                    {profile.brewDevice?.image ? (
                      <Image
                        src={profile.brewDevice.image}
                        alt={profile.brewDevice.name}
                        width={20}
                        height={20}
                        className="object-contain"
                      />
                    ) : (
                      <div className="w-5 h-5 bg-gray-200 coffee:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 text-xs">
                        ⚙️
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 coffee:text-gray-400">
                      Device
                    </p>
                    <p>{profile.brewDevice?.name}</p>
                  </div>
                </div>

                {profile.roastDate && (
                  <div className="flex items-center">
                    <Calendar size={18} className="mr-2 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500 coffee:text-gray-400">
                        Roast Date
                      </p>
                      <p>{new Date(profile.roastDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}

                {profile.roastLevel && (
                  <div className="flex items-center">
                    <Tag size={18} className="mr-2 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500 coffee:text-gray-400">
                        Roast Level
                      </p>
                      <p>{profile.roastLevel}</p>
                    </div>
                  </div>
                )}

                {profile.process && (
                  <div className="flex items-center">
                    <Tag size={18} className="mr-2 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500 coffee:text-gray-400">
                        Process
                      </p>
                      <p>{profile.process}</p>
                    </div>
                  </div>
                )}

                {profile.wash && (
                  <div className="flex items-center">
                    <Tag size={18} className="mr-2 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500 coffee:text-gray-400">
                        Wash
                      </p>
                      <p>{profile.wash}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              {profile.roasterNotes && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Roaster Notes</h3>
                  <p className="text-gray-600 coffee:text-gray-300 whitespace-pre-line">
                    {profile.roasterNotes}
                  </p>
                </div>
              )}

              {profile.tastingNotes && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Tasting Notes</h3>
                  <p className="text-gray-600 coffee:text-gray-300 whitespace-pre-line">
                    {profile.tastingNotes}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 coffee:border-gray-700 pt-4 flex items-center justify-between text-sm text-gray-500 coffee:text-gray-400">
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 coffee:bg-gray-700 mr-2">
                {profile.user?.image ? (
                  <Image
                    src={profile.user.image}
                    alt={profile.user.name}
                    width={24}
                    height={24}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    👤
                  </div>
                )}
              </div>
              <span>Created by {profile.user?.name}</span>
            </div>
            <div>
              {profile.isPublic ? (
                <span className="badge badge-primary">Public</span>
              ) : (
                <span className="badge">Private</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Similar brew profiles section */}
      {similarProfiles.length > 0 && (
        <RelatedItems
          title="Similar Brew Profiles"
          items={similarProfiles.map((relatedProfile) => (
            <BrewProfileCard key={relatedProfile.id} profile={relatedProfile} />
          ))}
          emptyMessage="No similar brew profiles found"
          maxItems={3}
          className="mt-8 border-t border-gray-200 coffee:border-gray-700 pt-6"
        />
      )}

      {/* More coffees from this roaster section */}
      {moreCoffeesFromRoaster.length > 0 && profile.coffee?.roaster && (
        <RelatedItems
          title={`More from ${profile.coffee.roaster.name}`}
          items={moreCoffeesFromRoaster.map((relatedCoffee) => (
            <CoffeeCard
              key={relatedCoffee.id}
              coffee={relatedCoffee}
              currentUserId={currentUserId || undefined}
            />
          ))}
          viewAllLink={`/coffees?roasterName=${encodeURIComponent(profile.coffee.roaster.name || "")}`}
          viewAllText="View all coffees from this roaster"
          emptyMessage={`No other coffees found from ${profile.coffee.roaster.name}`}
          maxItems={3}
          className="mt-8 border-t border-gray-200 coffee:border-gray-700 pt-6"
        />
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white coffee:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Delete Brew Profile</h3>
            <p className="mb-6">
              Are you sure you want to delete this brew profile? This action
              cannot be undone.
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
