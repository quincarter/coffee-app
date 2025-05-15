"use client";

import { FeatureFlagIndicator } from "../components/FeatureFlagIndicator";
import * as React from "react";
import { useEffect, useState } from "react";
import type { AuthSession } from "./useAuth";

interface UseFeatureFlagOptions {
  defaultValue?: boolean;
  showAdminIndicator?: boolean;
}

interface FeatureFlagResponse {
  isEnabled: boolean;
  isAdminOnly?: boolean;
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

  const wrapComponent = (children: React.ReactNode) => {
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
