"use client";

import { useState, ReactNode, useEffect } from "react";
import { Filter } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import SearchableDropdown from "./SearchableDropdown";
import { applyFilters, getFiltersFromUrl } from "../utils/filterUtils";
// No need to import CoffeeCardClient as we'll use renderItem prop

export type FilterOption = {
  value: string;
  label: string;
};

export type FilterConfig = {
  name: string;
  options: FilterOption[];
  placeholder: string;
};

type FilterableListClientProps = {
  items: any[];
  filters: FilterConfig[];
  searchPlaceholder?: string;
  noMatchesMessage?: string;
  children: ReactNode;
  renderItem?: (item: any) => ReactNode;
};

export default function FilterableListClient({
  items,
  filters,
  searchPlaceholder = "Search...",
  noMatchesMessage = "No items match your filters",
  children,
  renderItem,
}: FilterableListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>(
    {}
  );
  const [showFilters, setShowFilters] = useState(false);
  const [filteredItems, setFilteredItems] = useState<any[]>(items);

  // Initialize filters from URL on mount
  useEffect(() => {
    const urlFilters = getFiltersFromUrl(searchParams);
    setActiveFilters(urlFilters);

    // Get search term from URL
    const search = searchParams.get("search") || "";
    setSearchTerm(search);

    // Apply initial filters
    const filtered = applyFilters(items, search, urlFilters);
    setFilteredItems(filtered);
  }, [searchParams, items]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Update URL with search term
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    router.push(`?${params.toString()}`);

    // Apply filters
    const filtered = applyFilters(items, value, activeFilters);
    setFilteredItems(filtered);
  };

  // Handle filter change
  const handleFilterChange = (filterName: string, value: string) => {
    const newFilters = { ...activeFilters };

    if (value) {
      newFilters[filterName] = value;
    } else {
      delete newFilters[filterName];
    }

    setActiveFilters(newFilters);

    // Update URL with filters
    const params = new URLSearchParams(searchParams.toString());
    Object.keys(newFilters).forEach((key) => {
      params.set(key, newFilters[key]);
    });

    // Remove filters that are no longer active
    Array.from(params.keys()).forEach((key) => {
      if (key !== "search" && !newFilters[key]) {
        params.delete(key);
      }
    });

    router.push(`?${params.toString()}`);

    // Apply filters
    const filtered = applyFilters(items, searchTerm, newFilters);
    setFilteredItems(filtered);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setActiveFilters({});

    // Update URL by removing all filter params
    const params = new URLSearchParams();
    router.push(`?${params.toString()}`);

    // Reset to all items
    setFilteredItems(items);
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm || Object.keys(activeFilters).length > 0;

  // Determine if we should show the original children or the filtered results
  const showOriginalChildren = !hasActiveFilters;

  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        {/* Search input */}
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="input input-bordered w-full pr-10"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() =>
                handleSearchChange({
                  target: { value: "" },
                } as React.ChangeEvent<HTMLInputElement>)
              }
            >
              ×
            </button>
          )}
        </div>

        {/* Filter button */}
        <button
          className={`btn ${showFilters ? "btn-primary" : "btn-outline"} btn-sm md:btn-md`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={16} className="mr-2" />
          Filters
          {Object.keys(activeFilters).length > 0 && (
            <span className="badge badge-sm ml-2">
              {Object.keys(activeFilters).length}
            </span>
          )}
        </button>

        {/* Clear filters button */}
        {hasActiveFilters && (
          <button
            className="btn btn-ghost btn-sm md:btn-md"
            onClick={handleClearFilters}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Filter dropdowns */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {filters.map((filter) => (
            <div key={filter.name}>
              <SearchableDropdown
                options={filter.options}
                value={activeFilters[filter.name] || ""}
                onChange={(value) =>
                  handleFilterChange(filter.name, value as string)
                }
                placeholder={filter.placeholder}
                className="w-full"
              />
            </div>
          ))}
        </div>
      )}

      {/* Display items */}
      {showOriginalChildren ? (
        children
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">{noMatchesMessage}</p>
          <button onClick={handleClearFilters} className="btn btn-outline">
            Clear Filters
          </button>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-auto"
          style={{
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 450px), 1fr))",
          }}
        >
          {filteredItems.map((item, index) => (
            <div key={item.id || index}>
              {/* Use the renderItem prop if provided, otherwise just render the item */}
              {renderItem ? renderItem(item) : JSON.stringify(item)}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
