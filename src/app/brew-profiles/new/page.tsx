"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BrewProfileForm from "@/app/components/BrewProfileForm";

export default function NewBrewProfilePage() {
  const router = useRouter();
  
  const handleProfileCreated = (profile: any) => {
    router.push(`/brew-profiles/${profile.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/brew-profiles"
          className="flex items-center text-gray-600 coffee:text-gray-300 hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Brew Profiles
        </Link>
      </div>

      <div className="bg-white coffee:bg-gray-800 rounded-lg shadow-sm border border-gray-200 coffee:border-gray-700 overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Create New Brew Profile</h1>
          <BrewProfileForm onProfileCreated={handleProfileCreated} />
        </div>
      </div>
    </div>
  );
}