"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import { useFeatureFlag } from "@/app/hooks/useFeatureFlag";

type RelatedItemsProps = {
  title: string;
  items: React.ReactNode[];
  viewAllLink?: string;
  viewAllText?: string;
  emptyMessage?: string;
  maxItems?: number;
  className?: string;
};

/**
 * A reusable component for displaying related items sections
 *
 * @param title - The title of the section
 * @param items - Array of React nodes to display (usually cards)
 * @param viewAllLink - Optional link to view all items
 * @param viewAllText - Optional text for the view all link (defaults to "View all")
 * @param emptyMessage - Optional message to display when there are no items
 * @param maxItems - Optional maximum number of items to display (defaults to 3)
 * @param className - Optional additional CSS classes
 */
export default function RelatedItems({
  title,
  items,
  viewAllLink,
  viewAllText = "View all",
  emptyMessage = "No items found",
  maxItems = 3,
  className = "",
}: RelatedItemsProps) {
  const auth = useAuth();
  const { isEnabled, wrapComponent } = useFeatureFlag(
    "related-items",
    auth.session
  );

  if (!isEnabled && auth?.session?.user.role !== "admin") return null;

  // If there are no items, show the empty message
  if (items.length === 0) {
    return (
      <div className={`mt-8 ${className}`}>
        <h2 className="text-xl font-medium mb-4">{title}</h2>
        <div className="bg-gray-50 coffee:bg-gray-700 rounded-lg p-6 text-center">
          <p className="text-gray-500 coffee:text-gray-400">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  // Limit the number of items to display
  const displayItems = items.slice(0, maxItems);

  return wrapComponent(
    <div className={`mt-8 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">{title}</h2>
        {viewAllLink && (
          <Link
            href={viewAllLink}
            className="text-primary hover:text-primary-focus flex items-center text-sm"
          >
            {viewAllText}
            <ArrowRight size={16} className="ml-1" />
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayItems}
      </div>
    </div>
  );
}
