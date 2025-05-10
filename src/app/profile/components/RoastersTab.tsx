"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import RoasterCard from "@/app/components/coffee/RoasterCard";
import RoasterModalWrapper from "./RoasterModalWrapper";
import LoadingSpinner from "@/app/components/LoadingSpinner";

type Props = {
  userId: string;
};

export default function RoastersTab({ userId }: Props) {
  const [roasters, setRoasters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRoasterModal, setShowRoasterModal] = useState(false);

  useEffect(() => {
    const fetchRoasters = async () => {
      try {
        setLoading(true);
        // Fetch roasters created by the user
        const response = await fetch(
          `/api/coffee-roasters?createdBy=${userId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch roasters");
        }

        const data = await response.json();
        setRoasters(data);
      } catch (err) {
        console.error("Error fetching roasters:", err);
        setError("Failed to load roasters. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoasters();
  }, [userId]);

  const handleRoasterCreated = (newRoaster: any) => {
    setRoasters((prevRoasters) => [newRoaster, ...prevRoasters]);
    setShowRoasterModal(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Your Roasters</h2>
        <button
          onClick={() => setShowRoasterModal(true)}
          className="btn btn-primary btn-sm flex items-center gap-2"
        >
          <Plus size={16} />
          Add Roaster
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="alert alert-error">
          <p>{error}</p>
        </div>
      ) : roasters.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            You haven't added any roasters yet
          </p>
          <button
            onClick={() => setShowRoasterModal(true)}
            className="btn btn-primary"
          >
            Add Your First Roaster
          </button>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-auto"
          style={{
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 450px), 1fr))",
          }}
        >
          {roasters.map((roaster: any) => (
            <RoasterCard
              key={roaster.id}
              roaster={roaster}
              currentUserId={userId}
              showEditButton={true}
            />
          ))}
        </div>
      )}

      {/* Roaster Creation Modal */}
      <RoasterModalWrapper
        show={showRoasterModal}
        onClose={() => setShowRoasterModal(false)}
        onRoasterCreated={handleRoasterCreated}
      />
    </div>
  );
}
