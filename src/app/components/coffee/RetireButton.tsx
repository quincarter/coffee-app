"use client";

type RetireButtonProps = {
  coffeeId: string;
  isRetired?: boolean;
  onRetireStateChange?: (isRetired: boolean) => void;
  onError?: (error: Error) => void;
  onSuccess?: (isRetired: boolean) => void;
  className?: string;
};

export default function RetireButton({
  coffeeId,
  isRetired = false,
  onRetireStateChange,
  onError,
  onSuccess,
  className = "",
}: RetireButtonProps) {
  const handleRetireToggle = async () => {
    try {
      const response = await fetch(`/api/coffees/${coffeeId}/retire`, {
        method: isRetired ? "DELETE" : "POST",
      });

      if (!response.ok) throw new Error("Failed to update retirement status");

      const newIsRetired = !isRetired;

      // Call the callback with the new state if provided
      onRetireStateChange?.(newIsRetired);
      // Call success callback if provided
      onSuccess?.(newIsRetired);
    } catch (error) {
      console.error("Error updating retirement status:", error);
      // Call error callback if provided
      onError?.(
        error instanceof Error
          ? error
          : new Error("Failed to update retirement status")
      );
    }
  };

  return (
    <button
      onClick={handleRetireToggle}
      className={`btn btn-outline btn-sm ${className}`}
    >
      {isRetired ? "Mark as Available" : "Mark as Retired"}
    </button>
  );
}
