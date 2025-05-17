"use client";

import { UserDismissedBanner } from "@prisma/client";
import { AlertTriangle, CheckCircle, Info, X, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

type BannerColor = "success" | "info" | "danger" | "warning" | "neutral";

interface BannerData {
  id: string;
  title: string;
  description: string;
  color: BannerColor;
  isDismissable: boolean;
  isActive: boolean;
}

const iconMap = {
  success: CheckCircle,
  info: Info,
  danger: XCircle,
  warning: AlertTriangle,
  neutral: Info,
};

const colorMap = {
  success: "bg-success/30 text-success/100 border-success/30",
  info: "bg-info/30 text-info/100 border-info/30",
  danger: "bg-error/30 text-error/100 border-error/30",
  warning: "bg-warning/30 text-warning/100 border-warning/30",
  neutral: "bg-base-content/30 text-base-content/100 border-base-content/30",
};

export default function AdminBanner({ user = null }: any) {
  const [banner, setBanner] = useState<BannerData | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  const checkDismissedBanners = (banner: BannerData) => {
    // Check database dismissals first
    if (user?.dismissedBanners?.length > 0) {
      const isDismissedInDb = user.dismissedBanners.some(
        (dismissedBanner: UserDismissedBanner) =>
          dismissedBanner.bannerId === banner?.id
      );
      if (isDismissedInDb) return true;
    }

    // Fall back to localStorage for non-logged-in users or as backup
    const dismissedBanners = JSON.parse(
      localStorage.getItem("dismissedBanners") || "{}"
    );
    return dismissedBanners[banner?.id] === true;
  };
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await fetch("/api/admin/banner");
        if (!response.ok) return;
        const data = await response.json();
        if (data && data.isActive) {
          const isDismissedByUser = checkDismissedBanners(data);
          setIsDismissed(isDismissedByUser);
          setBanner(data);
        }
      } catch (error) {
        console.error("Error fetching banner:", error);
      }
    };

    fetchBanner();
  }, [user]);

  const handleDismiss = async () => {
    if (!banner) return;

    try {
      // For logged-in users, save dismissal in the database
      if (user?.id) {
        await fetch("/api/admin/banner/dismiss", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ bannerId: banner.id }),
        });
      }

      // Always update localStorage as a fallback
      const dismissedBanners = JSON.parse(
        localStorage.getItem("dismissedBanners") || "{}"
      );
      dismissedBanners[banner.id] = true;
      localStorage.setItem(
        "dismissedBanners",
        JSON.stringify(dismissedBanners)
      );

      setIsDismissed(true);
    } catch (error) {
      console.error("Error dismissing banner:", error);
    }
  };

  console.log("banner conditional", banner, banner?.isActive, isDismissed);
  if (!banner || !banner.isActive || isDismissed) return null;

  const Icon = iconMap[banner.color];

  return (
    <div className={`border ${colorMap[banner.color]} p-4 rounded-lg`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div className="mr-3 mt-0.5">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">{banner.title}</h3>
            <p className="mt-1">{banner.description}</p>
          </div>
        </div>
        {banner.isDismissable && (
          <button
            onClick={handleDismiss}
            className="ml-4 text-base-content/60 hover:text-base-content"
            aria-label="Dismiss banner"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
