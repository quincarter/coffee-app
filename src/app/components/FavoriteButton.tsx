"use client";

import { useState, useEffect } from "react";
import { Heart, Loader2 } from "lucide-react";
import { cn } from "@/app/lib/utils";

type FavoriteButtonProps = {
  entityType: "brew-profile" | "coffee" | "roaster" | "location";
  entityId: string;
  initialFavorited?: boolean;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  onFavoriteChange?: (isFavorited: boolean) => void;
};

export default function FavoriteButton({
  entityType,
  entityId,
  initialFavorited = false,
  showText = false,
  size = "md",
  className = "",
  onFavoriteChange,
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(!initialFavorited);

  // Check if the item is already favorited on component mount
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!entityId) return;
      
      try {
        setIsChecking(true);
        const response = await fetch(`/api/user/favorites/check?entityType=${entityType}&entityId=${entityId}`);
        
        if (response.ok) {
          const data = await response.json();
          setIsFavorited(data.isFavorited);
          if (onFavoriteChange) {
            onFavoriteChange(data.isFavorited);
          }
        }
      } catch (error) {
        console.error("Error checking favorite status:", error);
      } finally {
        setIsChecking(false);
      }
    };

    if (!initialFavorited) {
      checkFavoriteStatus();
    }
  }, [entityId, entityType, initialFavorited, onFavoriteChange]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    try {
      setIsLoading(true);

      if (isFavorited) {
        // Find the favorite ID first
        const checkResponse = await fetch(`/api/user/favorites/check?entityType=${entityType}&entityId=${entityId}`);
        if (checkResponse.ok) {
          const { favoriteId } = await checkResponse.json();
          
          if (favoriteId) {
            // Delete the favorite
            const deleteResponse = await fetch(`/api/user/favorites/${favoriteId}`, {
              method: "DELETE",
            });
            
            if (deleteResponse.ok) {
              setIsFavorited(false);
              if (onFavoriteChange) {
                onFavoriteChange(false);
              }
            }
          }
        }
      } else {
        // Add to favorites
        const response = await fetch("/api/user/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            entityType,
            entityId,
          }),
        });

        if (response.ok) {
          setIsFavorited(true);
          if (onFavoriteChange) {
            onFavoriteChange(true);
          }
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Size classes
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  // Button classes based on size
  const buttonClasses = {
    sm: "btn-xs",
    md: "btn-sm",
    lg: "btn",
  };

  if (isChecking) {
    return (
      <button 
        className={cn(
          "btn btn-ghost btn-circle",
          buttonClasses[size],
          className
        )}
        disabled
      >
        <Loader2 className={cn(sizeClasses[size], "animate-spin")} />
      </button>
    );
  }

  if (showText) {
    return (
      <button
        onClick={toggleFavorite}
        className={cn(
          "btn",
          isFavorited ? "btn-primary" : "btn-outline",
          buttonClasses[size],
          isLoading && "loading",
          className
        )}
        disabled={isLoading}
      >
        <Heart
          className={cn(
            sizeClasses[size],
            isFavorited && "fill-current"
          )}
        />
        {isFavorited ? "Favorited" : "Favorite"}
      </button>
    );
  }

  return (
    <button
      onClick={toggleFavorite}
      className={cn(
        "btn btn-ghost btn-circle focus:outline-none",
        buttonClasses[size],
        className
      )}
      disabled={isLoading}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      {isLoading ? (
        <Loader2 className={cn(sizeClasses[size], "animate-spin")} />
      ) : (
        <Heart
          className={cn(
            sizeClasses[size],
            isFavorited ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"
          )}
        />
      )}
    </button>
  );
}
