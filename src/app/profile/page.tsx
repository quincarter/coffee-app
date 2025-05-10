"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@prisma/client";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import ProfileTabs from "./components/ProfileTabs";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <div className="alert alert-error">
          <p>Failed to load user profile. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold">Your Profile</h1>
        <span className="ml-2 text-gray-500">@{user.name}</span>
      </div>

      <ProfileTabs userId={user.id} userRole={user.userRole} user={user} />
    </div>
  );
}
