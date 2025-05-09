"use client";

import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";

type ToastProps = {
  message: string;
  type: "success" | "error" | "info";
  duration?: number;
  onClose: () => void;
};

export default function Toast({
  message,
  type = "success",
  duration = 3000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade-out animation before removing
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "info":
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "bg-green-50 coffee:bg-green-900/20 border-green-200 coffee:border-green-800";
      case "error":
        return "bg-red-50 coffee:bg-red-900/20 border-red-200 coffee:border-red-800";
      case "info":
        return "bg-blue-50 coffee:bg-blue-900/20 border-blue-200 coffee:border-blue-800";
      default:
        return "bg-gray-50 coffee:bg-gray-800 border-gray-200 coffee:border-gray-700";
    }
  };

  return (
    <div
      className={`fixed left-1/2 transform -translate-x-1/2 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      } z-[9999] md:left-auto md:right-4 md:transform-none bottom-20 md:bottom-4`}
    >
      <div
        className={`flex items-center p-4 rounded-lg shadow-md border max-w-[90vw] md:max-w-md ${getBackgroundColor()}`}
      >
        <div className="flex-shrink-0 mr-3">{getIcon()}</div>
        <div className="mr-3 text-sm font-medium text-gray-900 coffee:text-gray-100">
          {message}
        </div>
        <button
          type="button"
          className="ml-auto -mx-1.5 -my-1.5 bg-white coffee:bg-gray-800 text-gray-400 hover:text-gray-900 coffee:hover:text-gray-100 rounded-lg p-1.5 inline-flex h-8 w-8 items-center justify-center"
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Toast container component to manage multiple toasts
export function ToastContainer() {
  const [toasts, setToasts] = useState<
    Array<{ id: string; message: string; type: "success" | "error" | "info" }>
  >([]);

  // Function to add a toast
  const addToast = (
    message: string,
    type: "success" | "error" | "info" = "success"
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    return id;
  };

  // Function to remove a toast
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return {
    toasts,
    addToast,
    removeToast,
    ToastList: () => (
      <div className="fixed bottom-0 left-0 right-0 z-[9999] pointer-events-none">
        <div className="flex flex-col items-center space-y-2 p-4 pointer-events-none">
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => removeToast(toast.id)}
              />
            </div>
          ))}
        </div>
      </div>
    ),
  };
}
