"use client";

import Image from "next/image";

type UserAvatarProps = {
  user:
    | {
        name: string;
        image?: string;
      }
    | undefined;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  className?: string;
};

export default function UserAvatar({
  user,
  size = "sm",
  showName = true,
  className = "",
}: UserAvatarProps) {
  if (!user) return null;

  // Size mappings
  const sizeMap = {
    sm: {
      container: "h-5 w-5",
      text: "text-xs",
    },
    md: {
      container: "h-8 w-8",
      text: "text-sm",
    },
    lg: {
      container: "h-10 w-10",
      text: "text-base",
    },
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`${sizeMap[size].container} relative mr-1`}>
        <Image
          src={user.image || "/default-avatar.webp"}
          alt={user.name}
          fill
          className="rounded-full object-cover"
          onError={(e) => {
            console.error("Image load error:", e);
            // Fallback to default avatar on error
            e.currentTarget.src = "/default-avatar.webp";
          }}
        />
      </div>
      {showName && (
        <div
          className={`${sizeMap[size].text} text-gray-500 coffee:text-gray-400`}
        >
          {user.name}
        </div>
      )}
    </div>
  );
}
