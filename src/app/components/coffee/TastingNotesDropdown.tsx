"use client";

import SearchableDropdown from "@/app/components/SearchableDropdown";

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
  options,
  label = "Tasting Notes",
  disabled = false,
  required = false,
}: TastingNotesDropdownProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <SearchableDropdown
        options={options.map((note) => ({
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
        onAddNew={(_newValue) => {
          // New value will be added to the form data automatically
        }}
        multiple={true}
        disabled={disabled}
      />
    </div>
  );
}
