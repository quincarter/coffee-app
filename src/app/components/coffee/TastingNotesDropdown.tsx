"use client";

import SearchableDropdown from "@/app/components/SearchableDropdown";
import { useState } from "react";

interface TastingNotesDropdownProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: { id: string; name: string }[];
  label?: string;
  disabled?: boolean;
  required?: boolean;
}

export default function TastingNotesDropdown({
  value,
  onChange,
  options: initialOptions,
  label = "Tasting Notes",
  disabled = false,
  required = false,
}: TastingNotesDropdownProps) {
  const [options, setOptions] = useState(() => {
    // Add any values that aren't in initialOptions
    const newOptions = [...initialOptions];
    value.forEach((val) => {
      if (!initialOptions.find((opt) => opt.name === val)) {
        newOptions.push({ id: val, name: val });
      }
    });
    return newOptions;
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
        options={options.map((note: { id: string; name: string }) => ({
          value: note.name,
          label: note.name,
        }))}
        value={value}
        onChange={(newValue) => {
          if (Array.isArray(newValue)) {
            onChange(newValue);
          } else {
            onChange([newValue]);
          }
        }}
        label=""
        placeholder="Select or type tasting notes..."
        allowAddNew={true}
        onAddNew={(newValue) => {
          // Add the new value to both our local options state and the selected values
          const newOption = { id: newValue, name: newValue };
          setOptions([...options, newOption]);
          onChange([...value, newValue]);
        }}
        multiple={true}
        disabled={disabled}
      />
    </div>
  );
}
