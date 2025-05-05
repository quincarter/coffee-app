import React from "react";
import { X } from "lucide-react";

type ChipProps = {
  label: string;
  onRemove?: () => void;
  className?: string;
};

export default function Chip({ label, onRemove, className = "" }: ChipProps) {
  return (
    <div className={`inline-flex items-center bg-primary/10 text-primary rounded-full px-3 py-1 text-sm ${className}`}>
      <span className="mr-1">{label}</span>
      {onRemove && (
        <button 
          onClick={onRemove} 
          className="text-primary hover:text-primary-focus"
          aria-label={`Remove ${label}`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}