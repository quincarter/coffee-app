"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { NotificationItem } from "./NotificationItem";
import { Notification } from "@/app/types/notification";

interface NotificationListProps {
  limit?: number;
  showViewAll?: boolean;
  onNotificationRead?: (id: string) => void;
}

export const NotificationList = ({
  limit,
  showViewAll = true,
  onNotificationRead,
}: NotificationListProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications/get");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error fetching notifications");
      }

      setNotifications(
        limit ? data.notifications.slice(0, limit) : data.notifications
      );
      setUnreadCount(data.unreadCount);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications");
      setLoading(false);
    }
  };

  const handleNotificationRead = (notificationId: string) => {
    setUnreadCount((prev) => Math.max(0, prev - 1));
    onNotificationRead?.(notificationId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-2">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-2 text-sm text-error">{error}</div>;
  }

  if (notifications.length === 0) {
    return (
      <div className="p-2 text-sm text-base-content/70">
        No notifications yet
      </div>
    );
  }

  return (
    <div>
      <div className="divide-y divide-base-300">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRead={handleNotificationRead}
          />
        ))}
      </div>
      {showViewAll && notifications.length >= (limit || 0) && (
        <div className="p-2 text-center border-t border-base-300">
          <Link
            href="/notifications"
            className="text-primary hover:underline text-sm"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
};
