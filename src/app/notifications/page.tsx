import { NotificationList } from "@/app/components/NotificationList";
import { NotificationsHeader } from "@/app/components/NotificationsHeader";

export default function NotificationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <NotificationsHeader />
      <NotificationList showViewAll={false} />
    </div>
  );
}
