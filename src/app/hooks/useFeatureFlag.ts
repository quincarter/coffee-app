"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import type { AuthSession } from "@/app/hooks/useAuth";

interface UseFeatureFlagOptions {
  defaultValue?: boolean;
  showAdminIndicator?: boolean;
}

interface FeatureFlagResponse {
  isEnabled: boolean;
  isAdminOnly?: boolean;
}

function FeatureFlagIndicator({
  isEnabled,
  flagName,
}: {
  isEnabled: boolean;
  flagName: string;
}): React.JSX.Element {
  return React.createElement(
    "div",
    {
      className:
        "absolute top-0 right-0 z-50 px-2 py-1 text-xs rounded-bl-md tooltip tooltip-left",
      "data-tip": `Feature Flag: ${flagName}`,
      style: {
        backgroundColor: isEnabled
          ? "rgba(0, 255, 0, 0.1)"
          : "rgba(255, 0, 0, 0.1)",
        border: `1px solid ${isEnabled ? "rgba(0, 255, 0, 0.2)" : "rgba(255, 0, 0, 0.2)"}`,
        color: isEnabled ? "rgb(0, 200, 0)" : "rgb(200, 0, 0)",
      },
    },
    isEnabled ? "🟢" : "🔴",
    " ",
    flagName
  );
}

export function useFeatureFlag(
  flagName: string,
  session: AuthSession | null,
  options: UseFeatureFlagOptions = { showAdminIndicator: true }
) {
  const [isEnabled, setIsEnabled] = useState(options.defaultValue ?? false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminOnly, setIsAdminOnly] = useState(false);

  useEffect(() => {
    const checkFeatureFlag = async () => {
      try {
        const response = await fetch(`/api/feature-flags/${flagName}`);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch feature flag: ${response.statusText}`
          );
        }
        const data: FeatureFlagResponse = await response.json();
        setIsEnabled(data.isEnabled);
        setIsAdminOnly(data.isAdminOnly ?? false);
      } catch (error) {
        console.error(`Error checking feature flag ${flagName}:`, error);
        setIsEnabled(options.defaultValue ?? false);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      checkFeatureFlag();
    } else {
      setIsEnabled(options.defaultValue ?? false);
      setIsLoading(false);
    }
  }, [flagName, session?.user?.id, options.defaultValue]);

  const wrapComponent = (children: React.ReactNode): React.JSX.Element => {
    if (!options.showAdminIndicator || session?.user?.role !== "admin") {
      return React.createElement(React.Fragment, null, children);
    }

    return React.createElement(
      "div",
      { className: "relative" },
      React.createElement(FeatureFlagIndicator, {
        isEnabled,
        flagName,
      }),
      children
    );
  };

  return {
    isEnabled,
    isLoading,
    isAdminOnly,
    wrapComponent,
  };
}
