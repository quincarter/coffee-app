import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Notification } from "@/app/types/notification";

interface NotificationProps {
  notification: Notification;
  onRead?: (id: string) => void;
}

export const NotificationItem = ({
  notification,
  onRead,
}: NotificationProps) => {
  const [isRead, setIsRead] = useState(notification.read);

  const handleMarkAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationId: notification.id }),
      });

      if (response.ok) {
        setIsRead(true);
        onRead?.(notification.id);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const getNotificationLink = () => {
    const hash =
      notification.type === "COMMENT" ||
      notification.type === "COMMENT_REPLY" ||
      notification.type === "COMMENT_LIKE"
        ? `#comment-${notification.entityId}`
        : "";

    switch (notification.entityType) {
      case "comment":
        return notification.coffee
          ? `/coffees/${notification.coffee.id}${hash}`
          : notification.brewProfile
            ? `/brew-profiles/${notification.brewProfile.id}${hash}`
            : `/roasters/${notification.roaster?.id}${hash}`;
      case "coffee":
        return `/coffees/${notification.coffee?.id}${hash}`;
      case "brew-profile":
        return `/brew-profiles/${notification.brewProfile?.id}${hash}`;
      case "roaster":
        return `/roasters/${notification.roaster?.id}${hash}`;
      default:
        return "#";
    }
  };

  const getNotificationContent = () => {
    const actorName = notification.actor.name;

    switch (notification.type) {
      case "COMMENT":
        return `commented on your ${notification.entityType}`;
      case "COMMENT_REPLY":
        return "replied to your comment";
      case "COMMENT_LIKE":
        return "liked your comment";
      case "FAVORITE_COFFEE":
        return "favorited your coffee";
      case "FAVORITE_BREW_PROFILE":
        return "favorited your brew profile";
      case "FAVORITE_ROASTER":
        return "favorited a roaster";
      default:
        return "performed an action";
    }
  };

  return (
    <div
      className={`flex items-start p-4 ${
        !isRead ? "bg-base-200" : ""
      } hover:bg-base-300 transition-colors`}
    >
      <Link
        href={`/profile/${notification.actor.id}`}
        className="flex-shrink-0 group block"
      >
        <div className="flex items-center">
          <div>
            {notification.actor.image ? (
              <Image
                className="inline-block h-9 w-9 rounded-full"
                src={notification.actor.image}
                alt={notification.actor.name}
                width={36}
                height={36}
              />
            ) : (
              <div className="inline-block h-9 w-9 rounded-full bg-base-300" />
            )}
          </div>
        </div>
      </Link>
      <div className="ml-3 flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm text-base-content">
            <Link
              href={`/profile/${notification.actor.id}`}
              className="font-bold hover:underline"
            >
              {notification.actor.name}
            </Link>{" "}
            <span>{getNotificationContent()}</span>
          </p>
          <p className="text-xs text-base-content/70">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
            })}
          </p>
        </div>
        {notification.content && (
          <p className="mt-1 text-sm text-base-content/80">
            {notification.content}
          </p>
        )}
        <div className="mt-2 text-sm">
          <Link
            href={getNotificationLink()}
            className="text-primary hover:underline"
            onClick={handleMarkAsRead}
          >
            View details
          </Link>
          {!isRead && (
            <button
              type="button"
              onClick={handleMarkAsRead}
              className="ml-4 text-base-content/70 hover:text-base-content"
            >
              Mark as read
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
