"use client";

import { useState } from "react";
import SearchableDropdown from "./SearchableDropdown";

const countries = [
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
  { value: "mx", label: "Mexico" },
  { value: "br", label: "Brazil" },
  { value: "ar", label: "Argentina" },
  { value: "co", label: "Colombia" },
  { value: "pe", label: "Peru" },
  { value: "ve", label: "Venezuela" },
  { value: "cl", label: "Chile" },
  { value: "ec", label: "Ecuador" },
  { value: "bo", label: "Bolivia" },
  { value: "py", label: "Paraguay" },
  { value: "uy", label: "Uruguay" },
  { value: "gy", label: "Guyana" },
  { value: "sr", label: "Suriname" },
  { value: "gf", label: "French Guiana" },
];

export default function SearchableDropdownExample() {
  const [selectedCountry, setSelectedCountry] = useState("");

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Country Selector</h2>
      
      <SearchableDropdown
        options={countries}
        value={selectedCountry}
        onChange={setSelectedCountry}
        label="Select a country"
        placeholder="Search countries..."
        required
      />
      
      {selectedCountry && (
        <div className="mt-4 p-4 bg-base-200 rounded-md">
          <p>Selected country: {countries.find(c => c.value === selectedCountry)?.label}</p>
          <p>Value: {selectedCountry}</p>
        </div>
      )}
    </div>
  );
}