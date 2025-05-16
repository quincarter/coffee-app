"use client";

import SearchableDropdown from "@/app/components/SearchableDropdown";
import { useState } from "react";

interface CountryOfOriginDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: { id: string; name: string }[];
  label?: string;
  disabled?: boolean;
  required?: boolean;
}

export default function CountryOfOriginDropdown({
  value,
  onChange,
  options: initialOptions,
  label = "Country of Origin",
  disabled = false,
  required = false,
}: CountryOfOriginDropdownProps) {
  // Ensure initialOptions includes the initial value if it exists
  const [options, setOptions] = useState(() => {
    if (value && !initialOptions.find((opt) => opt.name === value)) {
      return [...initialOptions, { id: value, name: value }];
    }
    return initialOptions;
  });
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <SearchableDropdown
        options={options.map((origin) => ({
          value: origin.name,
          label: origin.name,
        }))}
        value={value}
        onChange={(newValue) => {
          if (Array.isArray(newValue)) {
            onChange(newValue[0] || "");
          } else {
            onChange(newValue);
          }
        }}
        label=""
        placeholder="Select or type a country..."
        allowAddNew={true}
        onAddNew={(newValue) => {
          // Add it to our local options state
          const newOption = { id: newValue, name: newValue };
          setOptions([...options, newOption]);
          // Update the selected value
          onChange(newValue);
        }}
        multiple={false}
        disabled={disabled}
      />
    </div>
  );
}
