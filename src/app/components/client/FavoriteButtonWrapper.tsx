"use client";

import FavoriteButton from "../FavoriteButton";

export default function FavoriteButtonWrapper({
  entityType,
  entityId,
  size,
}: {
  entityType: "brew-profile" | "coffee" | "roaster" | "location";
  entityId: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <FavoriteButton entityType={entityType} entityId={entityId} size={size} />
  );
}
