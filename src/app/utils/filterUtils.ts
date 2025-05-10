/**
 * Utility functions for filtering data in lists
 */

import { FilterConfig } from "../components/FilterableList";

/**
 * Type for filter parameters from URL
 */
export type FilterParams = Record<string, string>;

/**
 * Interface for filterable items
 * All items that can be filtered should have these properties
 */
export interface FilterableItem {
  [key: string]: any;
  userId?: string;
  isPublic?: boolean;
  roaster?: {
    id?: string;
    name?: string;
  };
}

/**
 * Apply filters to a list of items
 * 
 * @param items The items to filter
 * @param selectedFilters The currently selected filters
 * @param filters The filter configurations
 * @param viewFilter The view filter (all, mine, public)
 * @param searchTerm The search term
 * @param currentUserId The current user ID
 * @returns The filtered items
 */
export function applyFilters<T extends FilterableItem>(
  items: T[],
  selectedFilters: Record<string, string>,
  filters: FilterConfig[],
  viewFilter: string,
  searchTerm: string,
  currentUserId?: string
): T[] {
  return items.filter((item) => {
    // Filter by view type if applicable (all, mine, public)
    if (viewFilter === "mine" && item.userId !== currentUserId) {
      return false;
    }
    if (viewFilter === "public" && !item.isPublic) {
      return false;
    }

    // Apply custom filters
    for (const filter of filters) {
      const selectedValue = selectedFilters[filter.name];
      if (selectedValue) {
        // Special case for roasterId
        if (filter.name === "roasterId") {
          // If the item's roasterId doesn't match the selected value, filter it out
          if (item[filter.name] !== selectedValue) {
            return false;
          }
          continue;
        }
        // Standard filter matching
        if (item[filter.name] !== selectedValue) {
          return false;
        }
      }
    }

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      // Search in all string properties
      return Object.entries(item).some(([key, value]) => {
        // Skip non-string values and objects
        if (typeof value !== "string") {
          // Special case for roaster name
          if (key === "roaster" && item.roaster?.name) {
            return item.roaster.name.toLowerCase().includes(term);
          }
          return false;
        }
        return value.toLowerCase().includes(term);
      });
    }

    return true;
  });
}

/**
 * Process URL parameters to get filter values
 * 
 * @param searchParams The URL search parameters
 * @param filters The filter configurations
 * @param initialFilters The initial filter values
 * @returns The filter values from URL parameters
 */
export function getFiltersFromUrl(
  searchParams: URLSearchParams,
  filters: FilterConfig[],
  initialFilters: Record<string, string> = {}
): Record<string, string> {
  const newFilters: Record<string, string> = { ...initialFilters };
  let hasNewFilters = false;

  // Special case for roasterName - find the corresponding roaster ID
  const roasterName = searchParams.get("roasterName");
  if (roasterName) {
    // Find the filter for roasterId
    const roasterFilter = filters.find(filter => filter.name === "roasterId");
    
    if (roasterFilter) {
      // Find the roaster option with matching name
      const decodedRoasterName = decodeURIComponent(roasterName);
      
      const matchingRoaster = roasterFilter.options.find(
        option => option.label === decodedRoasterName
      );

      if (matchingRoaster) {
        newFilters["roasterId"] = matchingRoaster.value;
        hasNewFilters = true;
      } else if (searchParams.get("roaster")) {
        // Fall back to roaster ID if name doesn't match
        newFilters["roasterId"] = searchParams.get("roaster") || "";
        hasNewFilters = true;
      }
    }
  }

  // Check each filter to see if it's in the URL
  for (const filter of filters) {
    const paramValue = searchParams.get(filter.name);
    if (paramValue) {
      newFilters[filter.name] = paramValue;
      hasNewFilters = true;
    }
  }

  return hasNewFilters ? newFilters : initialFilters;
}

/**
 * Check if filters have changed
 * 
 * @param currentFilters The current filter values
 * @param newFilters The new filter values
 * @returns Whether the filters have changed
 */
export function filtersHaveChanged(
  currentFilters: Record<string, string>,
  newFilters: Record<string, string>
): boolean {
  const currentFiltersStr = JSON.stringify(currentFilters);
  const newFiltersStr = JSON.stringify(newFilters);
  
  return currentFiltersStr !== newFiltersStr;
}

/**
 * Clear URL parameters
 */
export function clearUrlParameters(): void {
  if (typeof window !== "undefined") {
    try {
      const url = new URL(window.location.href);
      url.search = "";
      window.history.replaceState({}, "", url.toString());
    } catch (error) {
      console.error("Error clearing URL parameters:", error);
    }
  }
}
