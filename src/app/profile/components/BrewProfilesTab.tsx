"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import BrewProfileCard from "@/app/components/BrewProfileCard";
import BrewProfileCreationModal from "@/app/components/brew/BrewProfileCreationModal";
import LoadingSpinner from "@/app/components/LoadingSpinner";

type Props = {
  userId: string;
};

export default function BrewProfilesTab({ userId }: Props) {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/brew-profiles");

        if (!response.ok) {
          throw new Error("Failed to fetch brew profiles");
        }

        const data = await response.json();
        setProfiles(data);
      } catch (err) {
        console.error("Error fetching brew profiles:", err);
        setError("Failed to load brew profiles. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  const handleProfileCreated = (newProfile: any) => {
    setProfiles((prevProfiles) => [newProfile, ...prevProfiles]);
    setShowProfileModal(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Your Brew Profiles</h2>
        <button
          onClick={() => setShowProfileModal(true)}
          className="btn btn-primary btn-sm flex items-center gap-2"
        >
          <Plus size={16} />
          New Profile
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="alert alert-error">
          <p>{error}</p>
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            You haven't created any brew profiles yet
          </p>
          <button
            onClick={() => setShowProfileModal(true)}
            className="btn btn-primary"
          >
            Create Your First Brew Profile
          </button>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-auto"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          }}
        >
          {profiles.map((profile: any) => (
            <BrewProfileCard
              isLoggedIn={!!userId}
              key={profile.id}
              profile={profile}
            />
          ))}
        </div>
      )}

      {/* Brew Profile Creation Modal */}
      <BrewProfileCreationModal
        show={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onProfileCreated={handleProfileCreated}
        userId={userId}
      />
    </div>
  );
}
