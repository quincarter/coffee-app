"use client";

import BrewProfileForm from "@/app/components/brew/BrewProfileForm";
import { useRouter } from "next/navigation";

type BrewProfileEditFormProps = {
  profile: any;
};

export default function BrewProfileEditForm({
  profile,
}: BrewProfileEditFormProps) {
  const router = useRouter();

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
