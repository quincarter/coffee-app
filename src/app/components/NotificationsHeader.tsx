"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export const NotificationsHeader = () => {
  const [unreadCount, setUnreadCount] = useState(0);

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
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-base-content">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <span className="badge badge-primary">{unreadCount} unread</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleMarkAllAsRead}
            className="btn btn-ghost btn-sm hover:text-primary"
            disabled={unreadCount === 0}
          >
            Mark all as read
          </button>
          <Link
            href="/notifications/settings"
            className="btn btn-ghost btn-sm hover:text-primary"
          >
            Settings
          </Link>
        </div>
      </div>
      {unreadCount > 0 && (
        <div className="alert alert-info">
          <span>
            You have {unreadCount} unread notification
            {unreadCount !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  );
};
