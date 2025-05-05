"use client";

import { useState, useEffect } from "react";
import BrewItem from "./BrewItem";
import Link from "next/link";
import { BrewSession } from "@/app/types";

export default function PublicBrews() {
  const [brews, setBrews] = useState<BrewSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPublicBrews() {
      try {
        const response = await fetch("/api/public-brews");
        if (response.ok) {
          const data = await response.json();
          // Filter out brews without images
          const brewsWithImages = data.filter(
            (brew: BrewSession) => brew.image
          );
          setBrews(brewsWithImages);
        }
      } catch (error) {
        console.error("Error fetching public brews:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPublicBrews();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (brews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No brews to display yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        style={{ alignItems: "center" }}
      >
        {brews.map((brew) => (
          <div
            key={brew.id}
            className="transform transition hover:-translate-y-1"
          >
            <BrewItem session={brew} variant="card" showFavorite={false} />
          </div>
        ))}
      </div>
      <div className="text-center mt-8">
        <Link href="/register" className="btn btn-primary">
          Join to Track Your Own Brews
        </Link>
      </div>
    </div>
  );
}
