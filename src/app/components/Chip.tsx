import React from "react";
import { X, Star } from "lucide-react";

type ChipProps = {
  label: string;
  onRemove?: () => void;
  className?: string;
  isPrimary?: boolean;
  disabled?: boolean;
};

export default function Chip({
  label,
  onRemove,
  className = "",
  isPrimary = false,
  disabled,
}: ChipProps) {
  return (
    <div
      className={`inline-flex items-center ${isPrimary ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"} rounded-full px-3 py-1 text-sm ${className}`}
    >
      {isPrimary && <Star className="h-3 w-3 mr-1 fill-primary" />}
      <span className="mr-1">{label}</span>
      {onRemove && (
        <button
          disabled={disabled}
          onClick={disabled ? () => {} : onRemove}
          className={`text-primary hover:text-primary-focus ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
          aria-label={`Remove ${label}`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
