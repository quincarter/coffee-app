"use client";

import { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { Heart } from "lucide-react";

type BrewSession = {
  id: string;
  name: string;
  notes: string;
  userId: string;
  brewingDeviceId: string;
  brewingDevice: {
    name: string;
    image: string;
  };
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  session: BrewSession;
  isSelected?: boolean;
  onClick?: () => void;
  variant?: "list" | "card" | "timeline";
};

export default function BrewItem({ 
  session, 
  isSelected = false, 
  onClick,
  variant = "list" 
}: Props) {
  const [favorite, setFavorite] = useState(session.isFavorite || false);
  
  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    
    try {
      const response = await fetch(`/api/brew-sessions/${session.id}/favorite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isFavorite: !favorite }),
      });
      
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
          <button 
            onClick={toggleFavorite}
            className="text-gray-400 hover:text-red-500 focus:outline-none"
          >
            <Heart className={`h-5 w-5 ${favorite ? "fill-red-500 text-red-500" : ""}`} />
          </button>
        </div>
        
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
        
        <div className="text-xs text-gray-400 coffee:text-gray-500 mt-2">
          {format(new Date(session.createdAt), "MMM d, yyyy")}
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
                src={session.brewingDevice.image || "/placeholder-device.png"}
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
              <button 
                onClick={toggleFavorite}
                className="text-gray-400 hover:text-red-500 focus:outline-none"
              >
                <Heart className={`h-5 w-5 ${favorite ? "fill-red-500 text-red-500" : ""}`} />
              </button>
            </div>
            
            <p className="text-sm text-gray-500 coffee:text-gray-400 mt-1 line-clamp-2">
              {session.notes || "No notes"}
            </p>
            
            <div className="text-xs text-gray-400 coffee:text-gray-500 mt-2">
              {format(new Date(session.createdAt), "MMM d, yyyy")}
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
        <p className="text-sm font-medium truncate">{session.name}</p>
        <div className="ml-2 flex-shrink-0 flex items-center">
          <button 
            onClick={toggleFavorite}
            className="mr-2 text-gray-400 hover:text-red-500 focus:outline-none"
          >
            <Heart className={`h-5 w-5 ${favorite ? "fill-red-500 text-red-500" : ""}`} />
          </button>
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
        <div className="mt-2 flex items-center text-sm text-gray-500 coffee:text-gray-400 sm:mt-0">
          <p>{format(new Date(session.createdAt), "MMM d, yyyy")}</p>
        </div>
      </div>
    </div>
  );
}