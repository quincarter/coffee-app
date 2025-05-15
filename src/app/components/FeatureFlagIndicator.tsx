"use client";

import React from "react";

interface FeatureFlagIndicatorProps {
  isEnabled: boolean;
  flagName: string;
}

export const FeatureFlagIndicator = ({
  isEnabled,
  flagName,
}: FeatureFlagIndicatorProps): React.ReactElement => {
  return (
    <div
      className="absolute top-0 right-0 z-50 px-2 py-1 text-xs rounded-bl-md tooltip tooltip-left"
      data-tip={`Feature Flag: ${flagName}`}
      style={{
        backgroundColor: isEnabled
          ? "rgba(0, 255, 0, 0.1)"
          : "rgba(255, 0, 0, 0.1)",
        border: `1px solid ${isEnabled ? "rgba(0, 255, 0, 0.2)" : "rgba(255, 0, 0, 0.2)"}`,
        color: isEnabled ? "rgb(0, 200, 0)" : "rgb(200, 0, 0)",
      }}
    >
      {isEnabled ? "🟢" : "🔴"} {flagName}
    </div>
  );
};

export default FeatureFlagIndicator;
