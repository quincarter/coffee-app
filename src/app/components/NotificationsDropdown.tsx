"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { NotificationList } from "./NotificationList";
import { useState, useEffect } from "react";

export const NotificationsDropdown = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch unread count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch("/api/notifications/unread-count");
        const data = await response.json();
        setUnreadCount(data.count);
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    fetchUnreadCount();
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      await fetch("/api/notifications/mark-all-read", {
        method: "POST",
      });
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  return (
    <div className="dropdown dropdown-end mx-2">
      {/* Mobile: Direct link to notifications */}
      <Link
        href="/notifications"
        className="md:hidden btn btn-ghost btn-circle indicator"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="indicator-item badge badge-primary badge-sm">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Link>

      {/* Desktop: Dropdown with notifications */}
      <div
        tabIndex={0}
        role="button"
        className="hidden md:flex btn btn-ghost btn-circle indicator"
        onClick={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="indicator-item badge badge-primary badge-sm">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>
      <div
        tabIndex={0}
        className={`dropdown-content z-[1] hidden md:block menu p-2 shadow bg-base-100 rounded-box w-96 max-h-[80vh] overflow-y-auto transform transition-transform duration-200 ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div className="p-2 border-b border-base-300">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Notifications</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs hover:text-primary"
              >
                Mark all as read
              </button>
              <Link
                href="/notifications/settings"
                className="text-xs hover:text-primary"
              >
                Settings
              </Link>
            </div>
          </div>
        </div>
        <NotificationList
          limit={5}
          showViewAll={true}
          onNotificationRead={(id) => {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }}
        />
      </div>
    </div>
  );
};
