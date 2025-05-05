import React from "react";
import { X, Star } from "lucide-react";

type ChipProps = {
  label: string;
  onRemove?: () => void;
  className?: string;
  isPrimary?: boolean;
};

export default function Chip({
  label,
  onRemove,
  className = "",
  isPrimary = false,
}: ChipProps) {
  return (
    <div
      className={`inline-flex items-center ${isPrimary ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"} rounded-full px-3 py-1 text-sm ${className}`}
    >
      {isPrimary && <Star className="h-3 w-3 mr-1 fill-primary" />}
      <span className="mr-1">{label}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="text-primary hover:text-primary-focus cursor-pointer"
          aria-label={`Remove ${label}`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
