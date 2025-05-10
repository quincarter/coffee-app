"use client";

import { useState, ReactNode } from "react";
import { Filter, Plus } from "lucide-react";
import Link from "next/link";
import SearchableDropdown from "./SearchableDropdown";
import LoadingSpinner from "./LoadingSpinner";

export type FilterOption = {
  value: string;
  label: string;
};

export type FilterConfig = {
  name: string;
  options: FilterOption[];
  placeholder: string;
};

type FilterableListProps = {
  title: string;
  items: any[];
  renderItem: (item: any) => ReactNode;
  filters?: FilterConfig[];
  searchPlaceholder?: string;
  createButtonLabel?: string;
  createButtonLink?: string;
  createButtonOnClick?: () => void;
  loginButtonLabel?: string;
  loginButtonLink?: string;
  isLoggedIn?: boolean;
  emptyStateMessage?: string;
  noMatchesMessage?: string;
  gridCols?: number;
  loading?: boolean;
};

export default function FilterableList({
  title,
  items,
  renderItem,
  filters = [],
  searchPlaceholder = "Search...",
  createButtonLabel = "Create New",
  createButtonLink = "",
  createButtonOnClick,
  loginButtonLabel = "Log in",
  loginButtonLink = "/login",
  isLoggedIn = false,
  emptyStateMessage = "No items found",
  noMatchesMessage = "No items match your filters",
  gridCols = 3,
  loading = false,
}: FilterableListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string>
  >({});
  const [viewFilter, setViewFilter] = useState("all"); // all, mine, public

  // Apply filters to items
  const filteredItems = items.filter((item) => {
    // Filter by view type if applicable (all, mine, public)
    if (viewFilter === "mine" && item.userId !== item.currentUserId)
      return false;
    if (viewFilter === "public" && !item.isPublic) return false;

    // Apply custom filters
    for (const filter of filters) {
      const selectedValue = selectedFilters[filter.name];
      if (selectedValue && item[filter.name] !== selectedValue) {
        return false;
      }
    }

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      // This is a simple search implementation - customize as needed
      return Object.values(item).some(
        (value) =>
          typeof value === "string" && value.toLowerCase().includes(term)
      );
    }

    return true;
  });

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedFilters({});
    setViewFilter("all");
  };

  const hasActiveFilters =
    searchTerm ||
    Object.values(selectedFilters).some(Boolean) ||
    viewFilter !== "all";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        {loading ? (
          // Skeleton loader for the button while loading
          <div className="h-9 w-36 bg-gray-200 coffee:bg-gray-700 rounded animate-pulse"></div>
        ) : isLoggedIn ? (
          createButtonOnClick ? (
            <button
              onClick={createButtonOnClick}
              className="btn btn-primary btn-sm flex items-center gap-2"
            >
              <Plus size={16} />
              {createButtonLabel}
            </button>
          ) : createButtonLink ? (
            <Link
              href={createButtonLink}
              className="btn btn-primary btn-sm flex items-center gap-2"
            >
              <Plus size={16} />
              {createButtonLabel}
            </Link>
          ) : null
        ) : (
          <Link href={loginButtonLink} className="btn btn-outline btn-sm">
            {loginButtonLabel}
          </Link>
        )}
      </div>

      <div className="bg-white coffee:bg-gray-800 rounded-lg shadow-sm border border-gray-200 coffee:border-gray-700 p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={16} className="text-gray-500" />
          <span className="text-sm font-medium">Filters</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* View type filter (if needed) */}
          <div>
            <div className="flex gap-2">
              <button
                className={`btn btn-sm ${
                  viewFilter === "all" ? "btn-primary" : "btn-outline"
                }`}
                onClick={() => setViewFilter("all")}
                disabled={loading}
              >
                All
              </button>
              {loading ? (
                // Skeleton loader for "My Items" button while loading
                <div className="h-8 w-20 bg-gray-200 coffee:bg-gray-700 rounded animate-pulse"></div>
              ) : (
                isLoggedIn && (
                  <button
                    className={`btn btn-sm ${
                      viewFilter === "mine" ? "btn-primary" : "btn-outline"
                    }`}
                    onClick={() => setViewFilter("mine")}
                  >
                    My Items
                  </button>
                )
              )}
              <button
                className={`btn btn-sm ${
                  viewFilter === "public" ? "btn-primary" : "btn-outline"
                }`}
                onClick={() => setViewFilter("public")}
                disabled={loading}
              >
                Public
              </button>
            </div>
          </div>

          {/* Custom filters */}
          {filters.map((filter) => (
            <div key={filter.name}>
              {loading ? (
                // Skeleton loader for filter dropdown
                <div className="h-10 bg-gray-200 coffee:bg-gray-700 rounded animate-pulse"></div>
              ) : (
                <SearchableDropdown
                  options={filter.options}
                  value={selectedFilters[filter.name] || ""}
                  onChange={(value) => {
                    if (Array.isArray(value)) {
                      setSelectedFilters({
                        ...selectedFilters,
                        [filter.name]: value[0] || "",
                      });
                    } else {
                      setSelectedFilters({
                        ...selectedFilters,
                        [filter.name]: value,
                      });
                    }
                  }}
                  placeholder={filter.placeholder}
                  multiple={false}
                  disabled={loading}
                />
              )}
            </div>
          ))}

          {/* Search */}
          <div>
            <div className="relative">
              {loading ? (
                // Skeleton loader for search input
                <div className="h-10 bg-gray-200 coffee:bg-gray-700 rounded animate-pulse"></div>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    className="input input-bordered w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={loading}
                  />
                  {hasActiveFilters && (
                    <button
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={handleClearFilters}
                      disabled={loading}
                    >
                      Clear
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            {hasActiveFilters ? noMatchesMessage : emptyStateMessage}
          </p>
          {hasActiveFilters ? (
            <button onClick={handleClearFilters} className="btn btn-outline">
              Clear Filters
            </button>
          ) : isLoggedIn ? (
            createButtonOnClick ? (
              <button onClick={createButtonOnClick} className="btn btn-primary">
                {createButtonLabel}
              </button>
            ) : createButtonLink ? (
              <Link href={createButtonLink} className="btn btn-primary">
                {createButtonLabel}
              </Link>
            ) : null
          ) : (
            <Link href={loginButtonLink} className="btn btn-primary">
              {loginButtonLabel}
            </Link>
          )}
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${gridCols} gap-6`}
        >
          {filteredItems.map(renderItem)}
        </div>
      )}
    </div>
  );
}
