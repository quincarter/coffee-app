"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Beaker, Coffee, Heart, MapPin, Store } from "lucide-react";
import { FavoriteType } from "@/app/types";
import BrewSessionList from "../../brew-log/components/BrewSessionList";
import BrewProfileCard from "../../components/BrewProfileCard";
import CoffeeCard from "../../components/coffee/CoffeeCard";
import LocationCard from "../../components/coffee/LocationCard";
import RoasterCard from "../../components/coffee/RoasterCard";

interface Props {
  initialData: {
    brews: any[];
    brewProfiles: any[];
    coffees: any[];
    roasters: any[];
    locations: any[];
  };
  initialCounts: {
    brews: number;
    profiles: number;
    coffees: number;
    roasters: number;
    locations: number;
  };
  userId: string;
}

const ITEMS_PER_PAGE = 10;

export default function FavoritesPageClient({
  initialData,
  initialCounts,
  userId,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial tab from URL or default to "brews"
  const tabParam = searchParams.get("tab") as FavoriteType;
  const validTabs: FavoriteType[] = [
    "brews",
    "profiles",
    "coffees",
    "roasters",
    "locations",
  ];
  const [activeTab, setActiveTab] = useState<FavoriteType>(
    tabParam && validTabs.includes(tabParam) ? tabParam : "brews"
  );

  // Get initial page from URL or default to 1
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const [currentPage, setCurrentPage] = useState(
    isNaN(pageParam) || pageParam < 1 ? 1 : pageParam
  );

  const [data, setData] = useState<Props["initialData"]>(initialData);
  const [counts, setCounts] = useState<Props["initialCounts"]>(initialCounts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update URL when tab or page changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", activeTab);
    params.set("page", currentPage.toString());
    router.push(`/favorites?${params.toString()}`, { scroll: false });

    // Fetch data for the new tab/page
    fetchData();
  }, [activeTab, currentPage, searchParams, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const skip = (currentPage - 1) * ITEMS_PER_PAGE;
      let response;

      if (activeTab === "brews") {
        response = await fetch(
          `/api/brew-sessions/favorites?limit=${ITEMS_PER_PAGE}&skip=${skip}`
        );
      } else {
        response = await fetch("/api/user/favorites");
      }

      if (!response.ok) {
        throw new Error("Failed to fetch favorites");
      }

      const newData = await response.json();
      setData(newData);

      // Update counts
      const countsResponse = await fetch("/api/user/favorites/counts");
      if (countsResponse.ok) {
        const newCounts = await countsResponse.json();
        setCounts(newCounts);
      }
    } catch (err) {
      console.error("Error fetching favorites:", err);
      setError("Failed to load favorites. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(
    counts[activeTab === "profiles" ? "profiles" : activeTab] / ITEMS_PER_PAGE
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <Heart className="mr-2 h-6 w-6 text-red-500" />
          Your Favorites
        </h1>
      </div>

      {/* Tab Navigation */}
      <div className="tabs tabs-boxed mb-6">
        <button
          className={`tab gap-2 ${activeTab === "brews" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("brews")}
        >
          <Beaker className="h-4 w-4" />
          Brews
          {counts.brews > 0 && (
            <span className="badge badge-sm">{counts.brews}</span>
          )}
        </button>
        <button
          className={`tab gap-2 ${activeTab === "profiles" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("profiles")}
        >
          <Coffee className="h-4 w-4" />
          Profiles
          {counts.profiles > 0 && (
            <span className="badge badge-sm">{counts.profiles}</span>
          )}
        </button>
        <button
          className={`tab gap-2 ${activeTab === "coffees" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("coffees")}
        >
          <Coffee className="h-4 w-4" />
          Coffees
          {counts.coffees > 0 && (
            <span className="badge badge-sm">{counts.coffees}</span>
          )}
        </button>
        <button
          className={`tab gap-2 ${activeTab === "roasters" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("roasters")}
        >
          <Store className="h-4 w-4" />
          Roasters
          {counts.roasters > 0 && (
            <span className="badge badge-sm">{counts.roasters}</span>
          )}
        </button>
        <button
          className={`tab gap-2 ${activeTab === "locations" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("locations")}
        >
          <MapPin className="h-4 w-4" />
          Locations
          {counts.locations > 0 && (
            <span className="badge badge-sm">{counts.locations}</span>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error mb-6">
          <p>{error}</p>
        </div>
      )}

      {/* Content */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-base-100/50 flex items-center justify-center">
            <div className="loading loading-spinner text-primary"></div>
          </div>
        )}

        {activeTab === "brews" && data.brews?.length > 0 ? (
          <BrewSessionList
            sessions={data.brews}
            selectedSessionId={undefined}
            onSelectSession={(brew) =>
              router.push(`/brew-log?session=${brew.id}`)
            }
          />
        ) : activeTab === "profiles" && data.brewProfiles?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.brewProfiles.map((profile: any) => (
              <BrewProfileCard
                key={profile.id}
                profile={profile}
                showFavorite={true}
                isLoggedIn={!!userId}
              />
            ))}
          </div>
        ) : activeTab === "coffees" && data.coffees?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.coffees.map((coffee: any) => (
              <CoffeeCard
                key={coffee.id}
                coffee={coffee}
                currentUserId={userId}
                showFavorite={true}
              />
            ))}
          </div>
        ) : activeTab === "roasters" && data.roasters?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.roasters.map((roaster: any) => (
              <RoasterCard
                key={roaster.id}
                roaster={roaster}
                currentUserId={userId}
                showFavorite={true}
              />
            ))}
          </div>
        ) : activeTab === "locations" && data.locations?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.locations.map((location: any) => (
              <LocationCard
                key={location.id}
                location={location}
                roasterName={location.roaster?.name || "Unknown Roaster"}
                onUpdate={() => fetchData()}
                onDelete={() => fetchData()}
                onSetMainLocation={() => fetchData()}
                isOwner={location.createdBy === userId}
                showFavorite={true}
                userId={userId}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No favorites found</p>
            {activeTab === "brews" ? (
              <p className="text-gray-500 mt-2">
                Start by favoriting some brews in your brew log.
              </p>
            ) : activeTab === "profiles" ? (
              <p className="text-gray-500 mt-2">
                Start by favoriting some brew profiles.
              </p>
            ) : activeTab === "coffees" ? (
              <p className="text-gray-500 mt-2">
                Start by favoriting some coffees.
              </p>
            ) : activeTab === "roasters" ? (
              <p className="text-gray-500 mt-2">
                Start by favoriting some roasters.
              </p>
            ) : (
              <p className="text-gray-500 mt-2">
                Start by favoriting some locations.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          <button
            className="btn btn-outline btn-sm"
            disabled={currentPage === 1 || loading}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          >
            Previous
          </button>
          <span className="inline-flex items-center px-4 py-2 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn btn-outline btn-sm"
            disabled={currentPage === totalPages || loading}
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
