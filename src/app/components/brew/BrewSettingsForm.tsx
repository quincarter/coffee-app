"use client";

import { useState, useEffect } from "react";
import { BrewingDevice } from "@prisma/client";
import SearchableDropdown from "../SearchableDropdown";

type BrewSettingsFormData = {
  brewDeviceId: string;
  waterAmount: string;
  coffeeAmount: string;
  ratio: string;
};

type BrewSettingsFormProps = {
  formData: BrewSettingsFormData;
  onChange: (data: BrewSettingsFormData) => void;
  disabled?: boolean;
};

export default function BrewSettingsForm({
  formData,
  onChange,
  disabled = false,
}: BrewSettingsFormProps) {
  // State
  const [brewDevices, setBrewDevices] = useState<BrewingDevice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [waterUnit, setWaterUnit] = useState<"g" | "oz">("g");
  const [isCustomRatio, setIsCustomRatio] = useState(
    !["1:2", "1:4", "1:8", "1:12", "1:15", "1:16", "1:17"].includes(
      formData.ratio || "1:16"
    )
  );

  // Fetch brewing devices on component mount
  useEffect(() => {
    const fetchBrewDevices = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/brewing-devices");
        if (!response.ok) {
          throw new Error("Failed to fetch brewing devices");
        }
        const data = await response.json();
        setBrewDevices(data);
      } catch (err) {
        console.error("Error fetching brewing devices:", err);
        setError("Failed to load brewing devices");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrewDevices();
  }, []);

  // Handle water/coffee ratio calculations
  useEffect(() => {
    if (formData.waterAmount && formData.ratio) {
      const [coffee, water] = formData.ratio.split(":").map(Number);
      if (!isNaN(coffee) && !isNaN(water)) {
        const waterAmount = parseFloat(formData.waterAmount);
        if (!isNaN(waterAmount)) {
          // Convert water to grams if in ounces
          const waterInGrams =
            waterUnit === "oz" ? waterAmount * 28.35 : waterAmount;
          // Calculate coffee amount based on ratio
          const coffeeAmount = (waterInGrams / water) * coffee;
          onChange({
            ...formData,
            coffeeAmount: coffeeAmount.toFixed(1),
          });
        }
      }
    }
  }, [formData.waterAmount, formData.ratio, waterUnit]);

  // Convert between grams and ounces
  const handleWaterUnitChange = (unit: "g" | "oz") => {
    if (unit === waterUnit) return;

    const currentWater = parseFloat(formData.waterAmount);
    if (!isNaN(currentWater)) {
      let newWaterAmount: number;
      if (unit === "oz") {
        // Convert from grams to ounces
        newWaterAmount = currentWater / 28.35;
      } else {
        // Convert from ounces to grams
        newWaterAmount = currentWater * 28.35;
      }

      onChange({
        ...formData,
        waterAmount: newWaterAmount.toFixed(1),
      });
    }

    setWaterUnit(unit);
  };

  // Handle form field changes
  const handleChange = (field: keyof BrewSettingsFormData, value: string) => {
    onChange({
      ...formData,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      {/* Brewing Device */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Brewing Device
        </label>
        <SearchableDropdown
          options={brewDevices.map((device) => ({
            value: device.id,
            label: device.name,
          }))}
          value={formData.brewDeviceId}
          onChange={(value) => {
            if (Array.isArray(value)) {
              handleChange("brewDeviceId", value[0] || "");
            } else {
              handleChange("brewDeviceId", value);
            }
          }}
          label=""
          placeholder="Select a brewing device..."
          disabled={disabled}
          noOptionsMessage="No brewing devices found"
          multiple={false}
        />
      </div>

      {/* Water Amount */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Water Amount
        </label>
        <div className="flex items-center">
          <input
            type="number"
            value={formData.waterAmount}
            onChange={(e) => handleChange("waterAmount", e.target.value)}
            className="input input-bordered flex-grow"
            step="0.1"
            min="0"
            placeholder="Enter water amount"
            disabled={disabled}
          />
          <div className="flex ml-2">
            <button
              type="button"
              className={`btn btn-sm ${
                waterUnit === "g" ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => handleWaterUnitChange("g")}
              disabled={disabled}
            >
              g
            </button>
            <button
              type="button"
              className={`btn btn-sm ${
                waterUnit === "oz" ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => handleWaterUnitChange("oz")}
              disabled={disabled}
            >
              oz
            </button>
          </div>
        </div>
      </div>

      {/* Ratio */}
      <div>
        <label className="block text-sm font-medium mb-1">Ratio</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {["1:2", "1:4", "1:8", "1:12", "1:15", "1:16", "1:17"].map(
            (ratio) => (
              <button
                key={ratio}
                type="button"
                className={`btn btn-sm ${
                  formData.ratio === ratio && !isCustomRatio
                    ? "btn-primary"
                    : "btn-outline"
                }`}
                onClick={() => {
                  handleChange("ratio", ratio);
                  setIsCustomRatio(false);
                }}
                disabled={disabled}
              >
                {ratio}
              </button>
            )
          )}
          <button
            type="button"
            className={`btn btn-sm ${
              isCustomRatio ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => setIsCustomRatio(true)}
            disabled={disabled}
          >
            Custom
          </button>
        </div>
        {isCustomRatio && (
          <input
            type="text"
            value={formData.ratio}
            onChange={(e) => handleChange("ratio", e.target.value)}
            className="input input-bordered w-full"
            placeholder="Enter ratio (e.g., 1:16)"
            disabled={disabled}
          />
        )}
      </div>

      {/* Coffee Amount (Calculated) */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Coffee Amount (g)
        </label>
        <input
          type="number"
          value={formData.coffeeAmount}
          onChange={(e) => handleChange("coffeeAmount", e.target.value)}
          className="input input-bordered w-full"
          step="0.1"
          min="0"
          placeholder="Coffee amount will be calculated"
          readOnly
          disabled={disabled}
        />
        <p className="text-xs text-gray-500 mt-1">
          Calculated based on water amount and ratio
        </p>
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}
    </div>
  );
}
