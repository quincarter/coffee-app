"use client";

import { useState } from "react";
import Image from "next/image";
import { format, formatDistanceToNow } from "date-fns";
import { Heart, Clock } from "lucide-react";
import UserAvatar from "./UserAvatar";
import { BrewSession } from "@/app/types";

type Props = {
  session: any; // Use any type to avoid conflicts
  isSelected?: boolean;
  onClick?: () => void;
  variant?: "list" | "card" | "timeline";
  showFavorite?: boolean;
};

export default function BrewItem({
  session,
  isSelected = false,
  onClick,
  variant = "list",
  showFavorite = true,
}: Props) {
  const [favorite, setFavorite] = useState(session.isFavorite || false);

  console.log("Session with user:", session);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent onClick

    try {
      const response = await fetch(
        `/api/brew-sessions/${session.id}/favorite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isFavorite: !favorite }),
        }
      );

      if (response.ok) {
        setFavorite(!favorite);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  if (variant === "card") {
    return (
      <div
        className={`bg-white coffee:bg-gray-800 rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition ${
          isSelected ? "ring-2 ring-blue-500" : ""
        }`}
        onClick={onClick}
      >
        <div className="flex justify-between items-start">
          <h3 className="font-medium">{session.name}</h3>
          {showFavorite && (
            <button
              onClick={toggleFavorite}
              className="text-gray-400 hover:text-red-500 focus:outline-none"
            >
              <Heart
                className={`h-5 w-5 ${
                  favorite ? "fill-red-500 text-red-500" : ""
                }`}
              />
            </button>
          )}
        </div>

        {/* Show session image if available, otherwise show placeholder */}
        {session.image ? (
          <div className="mt-2 h-32 w-full relative rounded overflow-hidden">
            <Image
              src={session.image}
              alt={session.name}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="mt-2 h-32 w-full relative rounded overflow-hidden bg-gray-100 coffee:bg-gray-700">
            <Image
              src="/placeholder-brew.webp"
              alt="Placeholder"
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="flex items-center mt-2">
          <div className="h-8 w-8 relative mr-2">
            <Image
              src={session.brewingDevice.image || "/placeholder-device.png"}
              alt={session.brewingDevice.name}
              fill
              className="rounded object-cover"
            />
          </div>
          <span className="text-sm text-gray-600 coffee:text-gray-300">
            {session.brewingDevice.name}
          </span>
        </div>

        <p className="text-sm text-gray-500 coffee:text-gray-400 mt-2 line-clamp-2">
          {session.notes || "No notes"}
        </p>

        <div className="flex items-center justify-between mt-2">
          <UserAvatar user={session.user} size="sm" />
          <div className="text-xs text-gray-400 coffee:text-gray-500 flex items-center ml-auto">
            <Clock className="h-3 w-3 mr-1" />
            <span title={format(new Date(session.createdAt), "PPpp")}>
              {formatDistanceToNow(new Date(session.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "timeline") {
    return (
      <div className="relative pb-8">
        {/* Timeline connector */}
        <div className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200 coffee:bg-gray-700"></div>

        <div className="relative flex items-start space-x-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-blue-100 coffee:bg-blue-900 flex items-center justify-center ring-8 ring-white coffee:ring-gray-800">
              <Image
                src={
                  session.userBrewingDevice?.image ||
                  session.brewingDevice.image ||
                  "/placeholder-device.png"
                }
                alt={session.brewingDevice.name}
                fill
                className="rounded-full object-cover"
              />
            </div>
          </div>

          <div
            className={`min-w-0 flex-1 bg-white coffee:bg-gray-800 p-4 rounded-lg shadow cursor-pointer hover:shadow-md ${
              isSelected ? "ring-2 ring-blue-500" : ""
            }`}
            onClick={onClick}
          >
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-medium">{session.name}</h3>
              {showFavorite && (
                <button
                  onClick={toggleFavorite}
                  className="text-gray-400 hover:text-red-500 focus:outline-none"
                >
                  <Heart
                    className={`h-5 w-5 ${
                      favorite ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                </button>
              )}
            </div>

            {session.image && (
              <div className="mt-2 h-132 w-full relative rounded overflow-hidden">
                <Image
                  src={session.image}
                  alt={session.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <p className="text-sm text-gray-500 coffee:text-gray-400 mt-1 line-clamp-2">
              {session.notes || "No notes"}
            </p>

            <div className="text-xs text-gray-400 coffee:text-gray-500 mt-2 flex items-center">
              <UserAvatar user={session.user} size="sm" />

              <Clock className="h-3 w-3 mr-1" />
              <span title={format(new Date(session.createdAt), "PPpp")}>
                {formatDistanceToNow(new Date(session.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default list variant
  return (
    <div
      className={`px-4 py-4 sm:px-6 cursor-pointer hover:bg-gray-50 coffee:hover:bg-gray-700 transition ${
        isSelected ? "bg-blue-50 coffee:bg-blue-900/20" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {session.image && (
            <div className="h-12 w-12 relative mr-3 rounded overflow-hidden">
              <Image
                src={session.image}
                alt={session.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <p className="text-sm font-medium truncate">{session.name}</p>
        </div>
        <div className="ml-2 flex-shrink-0 flex items-center">
          {showFavorite && (
            <button
              onClick={toggleFavorite}
              className="mr-2 text-gray-400 hover:text-red-500 focus:outline-none"
            >
              <Heart
                className={`h-5 w-5 ${
                  favorite ? "fill-red-500 text-red-500" : ""
                }`}
              />
            </button>
          )}
          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            {session.brewingDevice.name}
          </p>
        </div>
      </div>
      <div className="mt-2 sm:flex sm:justify-between">
        <div className="sm:flex">
          <p className="flex items-center text-sm text-gray-500 coffee:text-gray-400">
            {session.notes.length > 30
              ? `${session.notes.substring(0, 30)}...`
              : session.notes || "No notes"}
          </p>
        </div>
        <div className="mt-2 flex items-center sm:mt-0">
          <UserAvatar user={session.user} size="sm" className="mr-3" />
          <div className="flex items-center text-sm text-gray-500 coffee:text-gray-400">
            <Clock className="h-4 w-4 mr-1" />
            <span title={format(new Date(session.createdAt), "PPpp")}>
              {formatDistanceToNow(new Date(session.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
