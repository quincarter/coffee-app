"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BrewProfileForm from "@/app/components/brew/BrewProfileForm";

export default function EditBrewProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const id = (await params).id;
        const response = await fetch(`/api/brew-profiles/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Brew profile not found");
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
  }, [params]);

  const handleProfileCreated = (updatedProfile: any) => {
    router.push(`/brew-profiles/${updatedProfile.id}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-error">
          <p>{error}</p>
        </div>
        <div className="mt-4">
          <Link href="/brew-profiles" className="btn btn-outline">
            Back to Brew Profiles
          </Link>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/brew-profiles/${profile.id}`}
          className="flex items-center text-gray-600 coffee:text-gray-300 hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Profile
        </Link>
      </div>

      <div className="bg-white coffee:bg-gray-800 rounded-lg shadow-sm border border-gray-200 coffee:border-gray-700 overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Edit Brew Profile</h1>
          <BrewProfileForm
            initialProfile={profile}
            isEditing={true}
            onProfileCreated={handleProfileCreated}
          />
        </div>
      </div>
    </div>
  );
}
