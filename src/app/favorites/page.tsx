"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BrewSessionList from "../brew-log/components/BrewSessionList";
import { BrewSession } from "@/app/types";

const ITEMS_PER_PAGE = 10;

export default function FavoritesPage() {
  const router = useRouter();
  const [favoriteBrews, setFavoriteBrews] = useState<BrewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalFavorites, setTotalFavorites] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchFavorites() {
      try {
        setLoading(true);
        const skip = (currentPage - 1) * ITEMS_PER_PAGE;
        const response = await fetch(
          `/api/brew-sessions/favorites?limit=${ITEMS_PER_PAGE}&skip=${skip}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch favorites");
        }
        const data = await response.json();
        setFavoriteBrews(data.brews);
        setTotalFavorites(data.total);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFavorites();
  }, [currentPage]);

  const handleSelectBrew = (brew: { id: string }) => {
    router.push(`/brew-log?session=${brew.id}`);
  };

  const totalPages = Math.ceil(totalFavorites / ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Favorite Brews</h1>
        <p className="text-gray-600 coffee:text-gray-400">
          {totalFavorites} favorite brews
        </p>
      </div>

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
          <p className="text-gray-500 coffee:text-gray-400">
            You haven&apos;t favorited any brews yet.
          </p>
        </div>
      )}
    </div>
  );
}
