import Link from "next/link";
import { Filter } from "lucide-react";
import FilterableListClient from "./FilterableListClient";

type FilterOption = {
  value: string;
  label: string;
};

type FilterConfig = {
  name: string;
  options: FilterOption[];
  placeholder: string;
};

type FilterableListServerProps = {
  title: string;
  items: any[];
  staticItems: React.ReactNode[];
  filters: FilterConfig[];
  searchPlaceholder?: string;
  createButtonLabel?: string;
  createButtonLink?: string;
  loginButtonLabel?: string;
  loginButtonLink?: string;
  isLoggedIn?: boolean;
  emptyStateMessage?: string;
  noMatchesMessage?: string;
  loading?: boolean;
};

export default function FilterableListServer({
  title,
  items,
  staticItems,
  filters,
  searchPlaceholder = "Search...",
  createButtonLabel = "Create New",
  createButtonLink = "#",
  loginButtonLabel = "Log in",
  loginButtonLink = "/login",
  isLoggedIn = false,
  emptyStateMessage = "No items found",
  noMatchesMessage = "No items match your filters",
  loading = false,
}: FilterableListServerProps) {
  // Initial server-rendered view with static items
  // Debug authentication state
  console.log("FilterableListServer - isLoggedIn:", isLoggedIn);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">{title}</h1>

        {isLoggedIn ? (
          <Link href={createButtonLink} className="btn btn-primary btn-sm">
            {createButtonLabel}
          </Link>
        ) : (
          <Link href={loginButtonLink} className="btn btn-outline btn-sm">
            {loginButtonLabel}
          </Link>
        )}
      </div>

      {/* Client-side filtering component */}
      <FilterableListClient
        items={items}
        filters={filters}
        searchPlaceholder={searchPlaceholder}
        noMatchesMessage={noMatchesMessage}
        renderItem={(item) => {
          // Find the corresponding static item by ID
          const index = items.findIndex((i) => i.id === item.id);
          return index >= 0 && index < staticItems.length
            ? staticItems[index]
            : null;
        }}
      >
        {/* Initial server-rendered items */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-auto"
          style={{
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 450px), 1fr))",
          }}
        >
          {staticItems}
        </div>
      </FilterableListClient>
    </div>
  );
}
