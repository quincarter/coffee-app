import React from "react";

type LoadingSpinnerProps = {
  size?: "xs" | "sm" | "md" | "lg";
  fullPage?: boolean;
  containerClassName?: string;
};

export default function LoadingSpinner({
  size = "lg",
  fullPage = false,
  containerClassName = "",
}: LoadingSpinnerProps) {
  const containerClasses = fullPage
    ? "flex justify-center items-center min-h-[50vh]"
    : "flex justify-center items-center h-64";

  return (
    <div className={`${containerClasses} ${containerClassName}`}>
      <div className={`loading loading-spinner loading-${size}`}></div>
    </div>
  );
}
