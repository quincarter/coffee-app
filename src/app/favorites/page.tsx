"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BrewSessionList from "../brew-log/components/BrewSessionList";
import BrewProfileCard from "../components/BrewProfileCard";
import CoffeeCard from "../components/coffee/CoffeeCard";
import RoasterCard from "../components/coffee/RoasterCard";
import LocationCard from "../components/coffee/LocationCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { BrewSession } from "@/app/types";
import { Coffee, Beaker, Store, MapPin, Heart } from "lucide-react";

const ITEMS_PER_PAGE = 10;

type FavoriteType = "brews" | "profiles" | "coffees" | "roasters" | "locations";

export default function FavoritesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as FavoriteType | null;

  const [activeTab, setActiveTab] = useState<FavoriteType>(() => {
    const validTabs: FavoriteType[] = [
      "brews",
      "profiles",
      "coffees",
      "roasters",
      "locations",
    ];
    return tabParam && validTabs.includes(tabParam) ? tabParam : "brews";
  });

  const [favoriteBrews, setFavoriteBrews] = useState<BrewSession[]>([]);
  const [favoriteProfiles, setFavoriteProfiles] = useState<any[]>([]);
  const [favoriteCoffees, setFavoriteCoffees] = useState<any[]>([]);
  const [favoriteRoasters, setFavoriteRoasters] = useState<any[]>([]);
  const [favoriteLocations, setFavoriteLocations] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [totalItems, setTotalItems] = useState({
    brews: 0,
    profiles: 0,
    coffees: 0,
    roasters: 0,
    locations: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);

  // Update URL when tab changes
  const handleTabChange = (tab: FavoriteType) => {
    setActiveTab(tab);
    setCurrentPage(1);
    router.push(`/favorites?tab=${tab}`);
  };

  // Fetch user info
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const userData = await response.json();
          setCurrentUserId(userData.id);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
  }, []);

  // Fetch brew sessions for the active tab
  useEffect(() => {
    if (activeTab !== "brews") return;

    async function fetchFavoriteBrews() {
      try {
        setLoading(true);
        const skip = (currentPage - 1) * ITEMS_PER_PAGE;
        const response = await fetch(
          `/api/brew-sessions/favorites?limit=${ITEMS_PER_PAGE}&skip=${skip}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch favorite brews");
        }
        const data = await response.json();
        setFavoriteBrews(data.brews);
        setTotalItems((prev) => ({ ...prev, brews: data.total }));
      } catch (error) {
        console.error("Error fetching favorite brews:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFavoriteBrews();
  }, [activeTab, currentPage]);

  // Fetch all favorites data on initial load
  useEffect(() => {
    async function fetchAllFavorites() {
      try {
        setLoading(true);

        // Fetch brew sessions count
        const brewsResponse = await fetch(
          `/api/brew-sessions/favorites?limit=1&skip=0`
        );
        if (brewsResponse.ok) {
          const brewsData = await brewsResponse.json();
          setTotalItems((prev) => ({ ...prev, brews: brewsData.total }));
        }

        // Fetch all other favorites
        const favoritesResponse = await fetch(`/api/user/favorites`);
        if (favoritesResponse.ok) {
          const data = await favoritesResponse.json();

          // Only set the data for the active tab to avoid unnecessary re-renders
          if (activeTab === "profiles") {
            setFavoriteProfiles(data.brewProfiles || []);
          } else if (activeTab === "coffees") {
            setFavoriteCoffees(data.coffees || []);
          } else if (activeTab === "roasters") {
            setFavoriteRoasters(data.roasters || []);
          } else if (activeTab === "locations") {
            setFavoriteLocations(data.locations || []);
          }

          // Always update the counts
          setTotalItems((prev) => ({
            ...prev,
            profiles: data.brewProfiles?.length || 0,
            coffees: data.coffees?.length || 0,
            roasters: data.roasters?.length || 0,
            locations: data.locations?.length || 0,
          }));
        }
      } catch (error) {
        console.error("Error fetching all favorites:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAllFavorites();
  }, []);

  // Fetch data for the active tab (except brews, which is handled separately)
  useEffect(() => {
    if (activeTab === "brews") return;

    async function fetchFavorites() {
      try {
        setLoading(true);
        const response = await fetch(`/api/user/favorites`);

        if (!response.ok) {
          throw new Error("Failed to fetch favorites");
        }

        const data = await response.json();

        // Only update the data for the active tab
        if (activeTab === "profiles") {
          setFavoriteProfiles(data.brewProfiles || []);
        } else if (activeTab === "coffees") {
          setFavoriteCoffees(data.coffees || []);
        } else if (activeTab === "roasters") {
          setFavoriteRoasters(data.roasters || []);
        } else if (activeTab === "locations") {
          setFavoriteLocations(data.locations || []);
        }

        // Always update the counts
        setTotalItems((prev) => ({
          ...prev,
          profiles: data.brewProfiles?.length || 0,
          coffees: data.coffees?.length || 0,
          roasters: data.roasters?.length || 0,
          locations: data.locations?.length || 0,
        }));
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFavorites();
  }, [activeTab]);

  const handleSelectBrew = (brew: { id: string }) => {
    router.push(`/brew-log?session=${brew.id}`);
  };

  const totalPages = Math.ceil(totalItems[activeTab] / ITEMS_PER_PAGE);

  const handleLocationUpdate = () => {
    // Refresh favorites if on locations tab
    if (activeTab === "locations") {
      setLoading(true);
      fetch(`/api/user/favorites`)
        .then((res) => res.json())
        .then((data) => {
          setFavoriteLocations(data.locations || []);
          setTotalItems((prev) => ({
            ...prev,
            locations: data.locations?.length || 0,
          }));
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error refreshing locations:", err);
          setLoading(false);
        });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Favorites</h1>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Favorites</h1>

      {/* Tabs */}
      <div className="border-b mb-6 overflow-x-auto">
        <ul className="flex flex-wrap -mb-px min-w-max">
          <li className="mr-2">
            <button
              className={`tab flex items-center ${
                activeTab === "brews"
                  ? "tab-active text-primary border-primary"
                  : ""
              }`}
              onClick={() => handleTabChange("brews")}
            >
              <Beaker className="h-4 w-4 mr-2" />
              Brew Sessions
              {totalItems.brews > 0 && (
                <span className="ml-2 badge badge-sm">{totalItems.brews}</span>
              )}
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`tab flex items-center ${
                activeTab === "profiles"
                  ? "tab-active text-primary border-primary"
                  : ""
              }`}
              onClick={() => handleTabChange("profiles")}
            >
              <Coffee className="h-4 w-4 mr-2" />
              Brew Profiles
              {totalItems.profiles > 0 && (
                <span className="ml-2 badge badge-sm">
                  {totalItems.profiles}
                </span>
              )}
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`tab flex items-center ${
                activeTab === "coffees"
                  ? "tab-active text-primary border-primary"
                  : ""
              }`}
              onClick={() => handleTabChange("coffees")}
            >
              <Coffee className="h-4 w-4 mr-2" />
              Coffees
              {totalItems.coffees > 0 && (
                <span className="ml-2 badge badge-sm">
                  {totalItems.coffees}
                </span>
              )}
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`tab flex items-center ${
                activeTab === "roasters"
                  ? "tab-active text-primary border-primary"
                  : ""
              }`}
              onClick={() => handleTabChange("roasters")}
            >
              <Store className="h-4 w-4 mr-2" />
              Roasters
              {totalItems.roasters > 0 && (
                <span className="ml-2 badge badge-sm">
                  {totalItems.roasters}
                </span>
              )}
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`tab flex items-center ${
                activeTab === "locations"
                  ? "tab-active text-primary border-primary"
                  : ""
              }`}
              onClick={() => handleTabChange("locations")}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Locations
              {totalItems.locations > 0 && (
                <span className="ml-2 badge badge-sm">
                  {totalItems.locations}
                </span>
              )}
            </button>
          </li>
        </ul>
      </div>

      {/* Content based on active tab */}
      <div>
        {/* Brew Sessions Tab */}
        {activeTab === "brews" && (
          <>
            {favoriteBrews.length > 0 ? (
              <>
                <BrewSessionList
                  sessions={favoriteBrews}
                  selectedSessionId={undefined}
                  onSelectSession={handleSelectBrew}
                  variant="list"
                />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded bg-white coffee:bg-gray-800 shadow disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded bg-white coffee:bg-gray-800 shadow disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 coffee:text-gray-400">
                  You haven&apos;t favorited any brew sessions yet.
                </p>
              </div>
            )}
          </>
        )}

        {/* Brew Profiles Tab */}
        {activeTab === "profiles" && (
          <>
            {favoriteProfiles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteProfiles.map((profile) => (
                  <BrewProfileCard key={profile.id} profile={profile} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 coffee:text-gray-400">
                  You haven&apos;t favorited any brew profiles yet.
                </p>
              </div>
            )}
          </>
        )}

        {/* Coffees Tab */}
        {activeTab === "coffees" && (
          <>
            {favoriteCoffees.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteCoffees.map((coffee) => (
                  <CoffeeCard
                    key={coffee.id}
                    coffee={coffee}
                    currentUserId={currentUserId || undefined}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 coffee:text-gray-400">
                  You haven&apos;t favorited any coffees yet.
                </p>
              </div>
            )}
          </>
        )}

        {/* Roasters Tab */}
        {activeTab === "roasters" && (
          <>
            {favoriteRoasters.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteRoasters.map((roaster) => (
                  <RoasterCard
                    key={roaster.id}
                    roaster={roaster}
                    currentUserId={currentUserId || undefined}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 coffee:text-gray-400">
                  You haven&apos;t favorited any roasters yet.
                </p>
              </div>
            )}
          </>
        )}

        {/* Locations Tab */}
        {activeTab === "locations" && (
          <>
            {favoriteLocations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteLocations.map((location) => (
                  <LocationCard
                    key={location.id}
                    location={location}
                    roasterName={location.roaster?.name || "Unknown Roaster"}
                    onUpdate={handleLocationUpdate}
                    onDelete={handleLocationUpdate}
                    onSetMainLocation={handleLocationUpdate}
                    isOwner={false}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 coffee:text-gray-400">
                  You haven&apos;t favorited any locations yet.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
