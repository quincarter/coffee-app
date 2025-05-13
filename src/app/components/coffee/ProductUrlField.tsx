"use client";

"use client";

import { ExternalLink } from "lucide-react";

type ProductUrlFieldProps = {
  value?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  hideText?: boolean;
  label?: string;
};

export default function ProductUrlField({
  value = "",
  onChange,
  readOnly = false,
  hideText = false,
  label = "View Product Page",
}: ProductUrlFieldProps) {
  if (readOnly && value) {
    return (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-secondary btn-sm"
        title={label}
      >
        <span className={`${hideText ? `hidden` : `hidden sm:block`}`}>
          {label}
        </span>
        <ExternalLink size={14} />
      </a>
    );
  }

  if (readOnly) {
    return null;
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-1">Product URL</label>
      <input
        type="url"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="input input-bordered w-full"
        placeholder="https://..."
        pattern="https?://.*"
      />
    </div>
  );
}
