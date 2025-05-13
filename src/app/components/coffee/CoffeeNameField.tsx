"use client";

interface CoffeeNameFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
  required?: boolean;
}

export default function CoffeeNameField({
  value,
  onChange,
  label = "Coffee Name",
  disabled = false,
  required = true,
}: CoffeeNameFieldProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input input-bordered w-full"
        placeholder="Enter coffee name"
        required={required}
        disabled={disabled}
      />
    </div>
  );
}
