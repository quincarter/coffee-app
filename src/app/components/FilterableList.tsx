"use client";

import { useState, ReactNode, useEffect, useRef, useCallback } from "react";
import { Filter, Plus } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import SearchableDropdown from "./SearchableDropdown";
import LoadingSpinner from "./LoadingSpinner";
import {
  applyFilters,
  getFiltersFromUrl,
  filtersHaveChanged,
} from "../utils/filterUtils";

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
  initialFilters?: Record<string, string>;
  searchPlaceholder?: string;
  createButtonLabel?: string;
  createButtonLink?: string;
  createButtonOnClick?: () => void;
  loginButtonLabel?: string;
  loginButtonLink?: string;
  isLoggedIn?: boolean;
  emptyStateMessage?: string;
  noMatchesMessage?: string;
  // gridCols?: number; // No longer used
  loading?: boolean;
};

export default function FilterableList({
  title,
  items,
  renderItem,
  filters = [],
  initialFilters = {},
  searchPlaceholder = "Search...",
  createButtonLabel = "Create New",
  createButtonLink = "",
  createButtonOnClick,
  loginButtonLabel = "Log in",
  loginButtonLink = "/login",
  isLoggedIn = false,
  emptyStateMessage = "No items found",
  noMatchesMessage = "No items match your filters",
  // gridCols = 3, // Unused variable
  loading = false,
}: FilterableListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] =
    useState<Record<string, string>>(initialFilters);
  const [viewFilter, setViewFilter] = useState("all"); // all, mine, public
  const initialLoadDone = useRef(false); // Track if we've already processed URL params
  const isInitialLoad = useRef(true); // Track if this is the initial load
  const prevSearchParamsRef = useRef(""); // Track the previous searchParams string

  // Initialize filters from URL parameters
  useEffect(() => {
    // Store the current searchParams string to avoid unnecessary processing
    const searchParamsString = searchParams.toString();

    // Skip processing if we've already processed this exact URL and there are no relevant params
    if (
      initialLoadDone.current &&
      !searchParams.has("roasterName") &&
      !searchParams.has("roaster") &&
      !searchParams.has("search") &&
      !searchParams.has("view")
    ) {
      return;
    }

    // Skip if there are no URL params and no selected filters
    if (!searchParamsString && Object.keys(selectedFilters).length === 0) {
      initialLoadDone.current = true;
      return;
    }

    // Skip if the searchParams haven't changed
    if (
      initialLoadDone.current &&
      prevSearchParamsRef.current === searchParamsString
    ) {
      return;
    }

    // Update the ref with the current searchParams string
    prevSearchParamsRef.current = searchParamsString;

    // Get filters from URL parameters
    const newFilters = getFiltersFromUrl(searchParams, filters, initialFilters);

    // Only update state if filters have changed
    if (filtersHaveChanged(selectedFilters, newFilters)) {
      console.log("Setting new filters:", newFilters);
      setSelectedFilters(newFilters);
    }

    // Check for search term in URL
    const searchFromUrl = searchParams.get("search");
    if (searchFromUrl && searchFromUrl !== searchTerm) {
      setSearchTerm(searchFromUrl);
    }

    // Check for view filter in URL
    const viewFromUrl = searchParams.get("view");
    if (viewFromUrl && viewFromUrl !== viewFilter) {
      setViewFilter(viewFromUrl);
    }

    initialLoadDone.current = true;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  // We now handle roasterName in the useEffect hook

  // Update URL when filters change - memoized to prevent recreation on every render
  const updateUrlWithFilters = useCallback(() => {
    // Skip URL update during initial load
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    // Get the current URL parameters
    const currentParams = new URLSearchParams(window.location.search);
    const currentParamsString = currentParams.toString();

    // Create a new URLSearchParams object for the new parameters
    const newParams = new URLSearchParams();

    // Add selected filters to URL
    Object.entries(selectedFilters).forEach(([key, value]) => {
      if (value) {
        // For roasterId, we want to use the label (name) instead of the ID
        if (key === "roasterId") {
          const roasterFilter = filters.find(
            (filter) => filter.name === "roasterId"
          );
          if (roasterFilter) {
            const roasterOption = roasterFilter.options.find(
              (option) => option.value === value
            );
            if (roasterOption) {
              newParams.set("roasterName", roasterOption.label);
            }
          }
        } else {
          newParams.set(key, value);
        }
      }
    });

    // Add search term to URL if present
    if (searchTerm) {
      newParams.set("search", searchTerm);
    }

    // Add view filter to URL if not "all"
    if (viewFilter !== "all") {
      newParams.set("view", viewFilter);
    }

    // Check if the parameters have actually changed
    const newParamsString = newParams.toString();
    if (currentParamsString === newParamsString) {
      // No change in parameters, skip the URL update
      return;
    }

    // Update URL without causing a page reload
    const newUrl =
      window.location.pathname + (newParamsString ? `?${newParamsString}` : "");

    router.push(newUrl, { scroll: false });
  }, [selectedFilters, searchTerm, viewFilter, filters, router]);

  // Update URL when filters change, but use a debounce effect to prevent too many updates
  useEffect(() => {
    console.log("Current selected filters:", selectedFilters);

    // Don't update URL on initial load or if we're still loading
    if (initialLoadDone.current && !loading) {
      // Use a timeout to debounce URL updates
      const timeoutId = setTimeout(() => {
        updateUrlWithFilters();
      }, 300); // 300ms debounce

      // Clean up the timeout if the component unmounts or dependencies change
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilters, searchTerm, viewFilter]);

  // Apply filters to items using the utility function
  const filteredItems = applyFilters(
    items,
    selectedFilters,
    filters,
    viewFilter,
    searchTerm,
    items[0]?.currentUserId // Pass the current user ID from the first item if available
  );

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedFilters({});
    setViewFilter("all");

    // Clear URL parameters by updating the URL
    router.push(window.location.pathname, { scroll: false });
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

      {/* Desktop layout with filters on the left */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters section - left side on desktop */}
        <div className="w-full md:w-64 lg:w-72 flex-shrink-0">
          <div className="bg-white coffee:bg-gray-800 rounded-lg shadow-sm border border-gray-200 coffee:border-gray-700 p-4 mb-6 md:mb-0 sticky top-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={16} className="text-gray-500" />
              <span className="text-sm font-medium">Filters</span>
            </div>

            <div className="space-y-4">
              {/* View type filter (if needed) */}
              <div>
                <div className="flex flex-wrap gap-2">
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
                <div key={filter.name} className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    {filter.placeholder
                      .replace("Filter by ", "")
                      .replace("...", "")}
                  </label>
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
                <label className="block text-sm font-medium mb-1">Search</label>
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

              {/* Clear all filters button */}
              {hasActiveFilters && (
                <div className="mt-4">
                  <button
                    onClick={handleClearFilters}
                    className="btn btn-outline btn-sm w-full"
                    disabled={loading}
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content section - right side on desktop */}
        <div className="flex-grow">
          {loading ? (
            <LoadingSpinner />
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                {hasActiveFilters ? noMatchesMessage : emptyStateMessage}
              </p>
              {hasActiveFilters ? (
                <button
                  onClick={handleClearFilters}
                  className="btn btn-outline"
                >
                  Clear Filters
                </button>
              ) : isLoggedIn ? (
                createButtonOnClick ? (
                  <button
                    onClick={createButtonOnClick}
                    className="btn btn-primary"
                  >
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
              className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-auto"
              style={{
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 450px), 1fr))",
              }}
            >
              {filteredItems.map(renderItem)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
