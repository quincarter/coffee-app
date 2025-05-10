"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BrewProfileForm from "@/app/components/brew/BrewProfileForm";

type BrewProfileEditFormProps = {
  profile: any;
};

export default function BrewProfileEditForm({ profile }: BrewProfileEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProfileCreated = (updatedProfile: any) => {
    router.push(`/brew-profiles/${updatedProfile.id}`);
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Edit Brew Profile</h1>
      <BrewProfileForm
        initialProfile={profile}
        isEditing={true}
        onProfileCreated={handleProfileCreated}
      />
    </>
  );
}
