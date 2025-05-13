"use client";

import SearchableDropdown from "@/app/components/SearchableDropdown";

export type CoffeeVariety =
  | "single_origin"
  | "blend"
  | "microlot"
  | "seasonal"
  | "signature_blend";

interface VarietyDropdownProps {
  value: CoffeeVariety | "";
  onChange: (value: CoffeeVariety | "") => void;
  label?: string;
  disabled?: boolean;
  required?: boolean;
}

export default function VarietyDropdown({
  value,
  onChange,
  label = "Variety",
  disabled = false,
  required = false,
}: VarietyDropdownProps) {
  const varieties = [
    { value: "single_origin", label: "Single Origin" },
    { value: "blend", label: "Blend" },
    { value: "microlot", label: "Microlot" },
    { value: "seasonal", label: "Seasonal" },
    { value: "signature_blend", label: "Signature Blend" },
  ];

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <SearchableDropdown
        options={varieties}
        value={value}
        onChange={(newValue) => {
          if (Array.isArray(newValue)) {
            onChange((newValue[0] as CoffeeVariety) || "");
          } else {
            onChange(newValue as CoffeeVariety);
          }
        }}
        placeholder="Select a variety..."
        label=""
        allowAddNew={false}
        multiple={false}
        disabled={disabled}
      />
    </div>
  );
}
