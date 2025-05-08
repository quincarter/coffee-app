"use client";

import { useState, useEffect } from "react";
import SearchableDropdown from "./SearchableDropdown";
import { Coffee, CoffeeRoaster, BrewingDevice } from "@prisma/client";

type BrewProfileFormProps = {
  userId?: string;
  onProfileCreated?: (profile: any) => void;
  onCancel?: () => void;
  initialProfile?: any;
  isEditing?: boolean;
};

export default function BrewProfileForm({
  userId,
  onProfileCreated,
  onCancel,
  initialProfile,
  isEditing = false,
}: BrewProfileFormProps) {
  // Form state
  const [formData, setFormData] = useState({
    coffeeId: initialProfile?.coffeeId || "",
    brewDeviceId: initialProfile?.brewDeviceId || "",
    waterAmount: initialProfile?.waterAmount?.toString() || "",
    coffeeAmount: initialProfile?.coffeeAmount?.toString() || "",
    ratio: initialProfile?.ratio || "1:16",
    roasterNotes: initialProfile?.roasterNotes || "",
    tastingNotes: initialProfile?.tastingNotes || "",
    roastDate: initialProfile?.roastDate 
      ? new Date(initialProfile.roastDate).toISOString().split('T')[0]
      : "",
    wash: initialProfile?.wash || "",
    process: initialProfile?.process || "",
    roastLevel: initialProfile?.roastLevel || "",
    isPublic: initialProfile?.isPublic || false,
  });

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Data for dropdowns
  const [roasters, setRoasters] = useState<CoffeeRoaster[]>([]);
  const [coffees, setCoffees] = useState<Coffee[]>([]);
  const [brewDevices, setBrewDevices] = useState<BrewingDevice[]>([]);
  const [selectedRoaster, setSelectedRoaster] = useState<string>(
    initialProfile?.coffee?.roasterId || ""
  );

  // New roaster form
  const [showRoasterForm, setShowRoasterForm] = useState(false);
  const [roasterFormData, setRoasterFormData] = useState({
    name: "",
    address: "",
    mapsLink: "",
    phoneNumber: "",
    notes: "",
    website: "", // Add website field
  });
  const [roasterImage, setRoasterImage] = useState<File | null>(null);

  // New coffee form
  const [showCoffeeForm, setShowCoffeeForm] = useState(false);
  const [coffeeFormData, setCoffeeFormData] = useState({
    name: "",
    roasterId: "",
  });

  // Water/coffee calculation
  const [waterUnit, setWaterUnit] = useState<"g" | "oz">("g");

  // Add this with the other state declarations
  const [isCustomRatio, setIsCustomRatio] = useState(
    !["1:2", "1:4", "1:8", "1:12", "1:15", "1:16", "1:17"].includes(initialProfile?.ratio || "1:16")
  );

  // Fetch roasters, coffees, and brew devices
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch roasters
        const roastersRes = await fetch("/api/coffee-roasters");
        const roastersData = await roastersRes.json();
        setRoasters(roastersData);

        // Fetch coffees
        const coffeesRes = await fetch("/api/coffees");
        const coffeesData = await coffeesRes.json();
        setCoffees(coffeesData);

        // Fetch brew devices
        const devicesRes = await fetch("/api/brewing-devices");
        const devicesData = await devicesRes.json();
        setBrewDevices(devicesData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter coffees by selected roaster
  const filteredCoffees = coffees.filter(
    (coffee) => !selectedRoaster || coffee.roasterId === selectedRoaster
  );

  // Handle water/coffee ratio calculations
  useEffect(() => {
    if (formData.waterAmount && formData.ratio) {
      const [coffee, water] = formData.ratio.split(":").map(Number);
      if (!isNaN(coffee) && !isNaN(water)) {
        const waterAmount = parseFloat(formData.waterAmount);
        if (!isNaN(waterAmount)) {
          // Convert water to grams if in ounces
          const waterInGrams = waterUnit === "oz" ? waterAmount * 28.35 : waterAmount;
          // Calculate coffee amount based on ratio
          const coffeeAmount = (waterInGrams / water) * coffee;
          setFormData({
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
      
      setFormData({
        ...formData,
        waterAmount: newWaterAmount.toFixed(1),
      });
    }
    
    setWaterUnit(unit);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate form
      if (!formData.coffeeId) throw new Error("Please select a coffee");
      if (!formData.brewDeviceId) throw new Error("Please select a brewing device");
      if (!formData.waterAmount) throw new Error("Please enter water amount");
      if (!formData.coffeeAmount) throw new Error("Please enter coffee amount");
      if (!formData.ratio) throw new Error("Please enter a ratio");

      // Convert water amount to grams for storage
      const waterInGrams = waterUnit === "oz" 
        ? parseFloat(formData.waterAmount) * 28.35 
        : parseFloat(formData.waterAmount);

      // Prepare payload
      const payload = {
        ...formData,
        userId,
        waterAmount: waterInGrams,
        coffeeAmount: parseFloat(formData.coffeeAmount),
        roastDate: formData.roastDate ? new Date(formData.roastDate).toISOString() : null,
      };

      // Send request
      const url = isEditing 
        ? `/api/brew-profiles/${initialProfile.id}` 
        : "/api/brew-profiles";
      
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save brew profile");
      }

      const data = await response.json();
      setSuccess("Brew profile saved successfully!");
      
      if (onProfileCreated) {
        onProfileCreated(data);
      }
    } catch (err) {
      console.error("Error saving brew profile:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding a new roaster
  const handleAddRoaster = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!roasterFormData.name) throw new Error("Roaster name is required");

      let imageUrl = null;

      // Upload image if one was selected
      if (roasterImage) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", roasterImage);
        uploadFormData.append("context", "coffee-roaster");

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image");
        }

        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.url;
      }

      const response = await fetch("/api/coffee-roasters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...roasterFormData,
          image: imageUrl,
          createdBy: userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add roaster");
      }

      const newRoaster = await response.json();
      
      // Update roasters list
      setRoasters([...roasters, newRoaster]);
      
      // Select the new roaster
      setSelectedRoaster(newRoaster.id);
      
      // Reset form
      setRoasterFormData({
        name: "",
        address: "",
        mapsLink: "",
        phoneNumber: "",
        notes: "",
        website: "", // Add website field
      });
      
      // Close form
      setShowRoasterForm(false);
      
      // Show success message
      setSuccess("Roaster added successfully!");
    } catch (err) {
      console.error("Error adding roaster:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding a new coffee
  const handleAddCoffee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!coffeeFormData.name) throw new Error("Coffee name is required");
      if (!selectedRoaster) throw new Error("Please select a roaster");

      const response = await fetch("/api/coffees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: coffeeFormData.name,
          roasterId: selectedRoaster,
          createdBy: userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add coffee");
      }

      const newCoffee = await response.json();
      
      // Update coffees list
      setCoffees([...coffees, newCoffee]);
      
      // Select the new coffee
      setFormData({
        ...formData,
        coffeeId: newCoffee.id,
      });
      
      // Reset form
      setCoffeeFormData({
        name: "",
        roasterId: "",
      });
      
      // Close form
      setShowCoffeeForm(false);
      
      // Show success message
      setSuccess("Coffee added successfully!");
    } catch (err) {
      console.error("Error adding coffee:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white coffee:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">
        {isEditing ? "Edit Brew Profile" : "New Brew Profile"}
      </h2>

      {error && (
        <div className="alert alert-error mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Roaster Selection */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Coffee Roaster
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-grow">
              <SearchableDropdown
                options={roasters.map(roaster => ({
                  value: roaster.id,
                  label: roaster.name,
                }))}
                value={selectedRoaster}
                onChange={(value) => {
                  if (Array.isArray(value)) {
                    setSelectedRoaster(value[0] || "");
                  } else {
                    setSelectedRoaster(value);
                  }
                  // Clear coffee selection when roaster changes
                  setFormData({
                    ...formData,
                    coffeeId: "",
                  });
                }}
                label=""
                placeholder="Search for a roaster..."
                disabled={isLoading || showRoasterForm}
                noOptionsMessage="No roasters found"
                multiple={false}
              />
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => setShowRoasterForm(!showRoasterForm)}
            >
              {showRoasterForm ? "Cancel" : "Add New"}
            </button>
          </div>
        </div>

        {/* New Roaster Form */}
        {showRoasterForm && (
          <div className="bg-gray-50 coffee:bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-3">Add New Roaster</h3>
            <form onSubmit={handleAddRoaster} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Roaster Name*
                </label>
                <input
                  type="text"
                  value={roasterFormData.name}
                  onChange={(e) => setRoasterFormData({...roasterFormData, name: e.target.value})}
                  className="input input-bordered w-full"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={roasterFormData.address}
                  onChange={(e) => setRoasterFormData({...roasterFormData, address: e.target.value})}
                  className="input input-bordered w-full"
                />
              </div>
              
              {/* Add Website field */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={roasterFormData.website}
                  onChange={(e) => setRoasterFormData({...roasterFormData, website: e.target.value})}
                  className="input input-bordered w-full"
                  placeholder="https://example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Notes
                </label>
                <textarea
                  value={roasterFormData.notes}
                  onChange={(e) => setRoasterFormData({...roasterFormData, notes: e.target.value})}
                  className="textarea textarea-bordered w-full"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowRoasterForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Roaster"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Coffee Selection */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Coffee
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-grow">
              <SearchableDropdown
                options={filteredCoffees.map(coffee => ({
                  value: coffee.id,
                  label: coffee.name,
                }))}
                value={formData.coffeeId}
                onChange={(value) => {
                  if (Array.isArray(value)) {
                    setFormData({...formData, coffeeId: value[0] || ""});
                  } else {
                    setFormData({...formData, coffeeId: value});
                  }
                }}
                label=""
                placeholder={selectedRoaster ? "Search for a coffee..." : "Select a roaster first"}
                disabled={isLoading || !selectedRoaster || showCoffeeForm}
                noOptionsMessage={selectedRoaster ? "No coffees found for this roaster" : "Select a roaster first"}
                multiple={false}
              />
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => setShowCoffeeForm(!showCoffeeForm)}
              disabled={!selectedRoaster}
            >
              {showCoffeeForm ? "Cancel" : "Add New"}
            </button>
          </div>
        </div>

        {/* New Coffee Form */}
        {showCoffeeForm && (
          <div className="bg-gray-50 coffee:bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-3">Add New Coffee</h3>
            <form onSubmit={handleAddCoffee} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Coffee Name*
                </label>
                <input
                  type="text"
                  value={coffeeFormData.name}
                  onChange={(e) => setCoffeeFormData({...coffeeFormData, name: e.target.value})}
                  className="input input-bordered w-full"
                  required
                />
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowCoffeeForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Coffee"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Brewing Device */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Brewing Device
          </label>
          <SearchableDropdown
            options={brewDevices.map(device => ({
              value: device.id,
              label: device.name,
            }))}
            value={formData.brewDeviceId}
            onChange={(value) => {
              if (Array.isArray(value)) {
                setFormData({...formData, brewDeviceId: value[0] || ""});
              } else {
                setFormData({...formData, brewDeviceId: value});
              }
            }}
            label=""
            placeholder="Search for a brewing device..."
            disabled={isLoading}
            noOptionsMessage="No brewing devices found"
            multiple={false}
          />
        </div>

        {/* Water and Coffee Measurements */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Water Amount
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={formData.waterAmount}
              onChange={(e) => setFormData({...formData, waterAmount: e.target.value})}
              className="input input-bordered w-full"
              step="0.1"
              min="0"
              placeholder="Enter water amount"
            />
            <div className="flex border rounded-md overflow-hidden">
              <button
                type="button"
                className={`px-3 py-2 ${waterUnit === 'g' ? 'bg-primary text-white' : 'bg-gray-100 coffee:bg-gray-700'}`}
                onClick={() => handleWaterUnitChange('g')}
              >
                g
              </button>
              <button
                type="button"
                className={`px-3 py-2 ${waterUnit === 'oz' ? 'bg-primary text-white' : 'bg-gray-100 coffee:bg-gray-700'}`}
                onClick={() => handleWaterUnitChange('oz')}
              >
                oz
              </button>
            </div>
          </div>
        </div>

        {/* Ratio */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Ratio (Coffee:Water)
          </label>
          <div className="space-y-2">
            <select
              value={isCustomRatio ? "custom" : formData.ratio}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "custom") {
                  setIsCustomRatio(true);
                } else {
                  setIsCustomRatio(false);
                  setFormData({...formData, ratio: value});
                }
              }}
              className="select select-bordered w-full"
            >
              <option value="1:2">1:2 (Espresso)</option>
              <option value="1:4">1:4 (Concentrated)</option>
              <option value="1:8">1:8 (Strong)</option>
              <option value="1:12">1:12 (Medium)</option>
              <option value="1:15">1:15 (Pour Over)</option>
              <option value="1:16">1:16 (Standard Pour Over)</option>
              <option value="1:17">1:17 (Light Pour Over)</option>
              <option value="custom">Custom Ratio...</option>
            </select>
            
            {isCustomRatio && (
              <div className="flex items-center mt-2">
                <span className="text-lg font-medium mr-2">1:</span>
                <input
                  type="text" // Changed from number to text for better control
                  value={formData.ratio.split(':')[1] || ''}
                  onChange={(e) => {
                    const waterPart = e.target.value;
                    // Allow empty string or valid numbers (including decimals)
                    if (waterPart === '' || /^(\d*\.?\d*)$/.test(waterPart)) {
                      setFormData({...formData, ratio: `1:${waterPart}`});
                    }
                  }}
                  className="input input-bordered w-full"
                  placeholder="Enter water ratio (e.g. 16.5)"
                />
              </div>
            )}
          </div>
        </div>

        {/* Coffee Amount (Calculated) */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Coffee Amount (g)
          </label>
          <input
            type="number"
            value={formData.coffeeAmount}
            onChange={(e) => setFormData({...formData, coffeeAmount: e.target.value})}
            className="input input-bordered w-full"
            step="0.1"
            min="0"
            placeholder="Coffee amount will be calculated"
            readOnly
          />
          <p className="text-xs text-gray-500 mt-1">
            Calculated based on water amount and ratio
          </p>
        </div>

        {/* Optional Fields */}
        <div className="border-t pt-4 mt-4">
          <h3 className="text-lg font-medium mb-3">Additional Information (Optional)</h3>
          
          <div className="space-y-4">
            {/* Roaster Notes */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Roaster Notes
              </label>
              <textarea
                value={formData.roasterNotes || ""}
                onChange={(e) => setFormData({...formData, roasterNotes: e.target.value})}
                className="textarea textarea-bordered w-full"
                rows={3}
                placeholder="Notes from the roaster about this coffee"
              />
            </div>
            
            {/* Tasting Notes */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Your Tasting Notes
              </label>
              <textarea
                value={formData.tastingNotes || ""}
                onChange={(e) => setFormData({...formData, tastingNotes: e.target.value})}
                className="textarea textarea-bordered w-full"
                rows={3}
                placeholder="What did you taste?"
              />
            </div>
            
            {/* Roast Date */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Roast Date
              </label>
              <input
                type="date"
                value={formData.roastDate}
                onChange={(e) => setFormData({...formData, roastDate: e.target.value})}
                className="input input-bordered w-full"
              />
            </div>
            
            {/* Process */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Process
              </label>
              <select
                value={formData.process || ""}
                onChange={(e) => setFormData({...formData, process: e.target.value})}
                className="select select-bordered w-full"
              >
                <option value="">Select process method</option>
                <option value="Wet">Wet</option>
                <option value="Dry">Dry</option>
                <option value="Anaerobic">Anaerobic</option>
                <option value="Carbonic Maceration">Carbonic Maceration</option>
                <option value="Washed">Washed</option>
                <option value="Natural">Natural</option>
              </select>
            </div>
            
            {/* Roast Level */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Roast Level
              </label>
              <select
                value={formData.roastLevel || ""}
                onChange={(e) => setFormData({...formData, roastLevel: e.target.value})}
                className="select select-bordered w-full"
              >
                <option value="">Select roast level</option>
                <option value="Light">Light</option>
                <option value="Medium-Light">Medium-Light</option>
                <option value="Medium">Medium</option>
                <option value="Medium-Dark">Medium-Dark</option>
                <option value="Dark">Dark</option>
                <option value="French">French</option>
              </select>
            </div>
            
            {/* Public/Private */}
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Make this brew profile public</span>
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
                  className="checkbox checkbox-primary"
                />
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Public profiles can be viewed by other users
              </p>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-2 pt-4">
          {onCancel && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : (isEditing ? "Update Profile" : "Create Profile")}
          </button>
        </div>
      </form>
    </div>
  );
}
