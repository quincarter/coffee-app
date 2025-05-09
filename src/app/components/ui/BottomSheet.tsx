"use client";

import { useEffect, useState, useRef, ReactNode } from "react";
import { X } from "lucide-react";

type BottomSheetProps = {
  show: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  showCloseButton?: boolean;
};

export default function BottomSheet({
  show,
  onClose,
  title,
  children,
  showCloseButton = true,
}: BottomSheetProps) {
  const [animation, setAnimation] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const initialTouchY = useRef<number | null>(null);
  const currentTouchY = useRef<number | null>(null);

  // Handle animation on show/hide
  useEffect(() => {
    if (show) {
      // Prevent body scrolling when modal is open
      document.body.style.overflow = "hidden";
      // Start animation after a tiny delay to ensure the modal is in the DOM
      setTimeout(() => setAnimation(true), 10);
    } else {
      document.body.style.overflow = "";
      setAnimation(false);
    }

    return () => {
      // Cleanup when component unmounts
      document.body.style.overflow = "";
    };
  }, [show]);

  // Detect keyboard visibility on mobile
  useEffect(() => {
    if (typeof window === "undefined") return;

    const detectKeyboard = () => {
      // This is a heuristic - when the keyboard opens on mobile, the viewport height decreases
      const viewportHeight =
        window.visualViewport?.height || window.innerHeight;
      const windowHeight = window.innerHeight;

      // If the viewport height is significantly less than the window height,
      // we can assume the keyboard is visible
      const isKeyboardVisible = windowHeight - viewportHeight > 150;
      setKeyboardVisible(isKeyboardVisible);
    };

    // Listen for viewport changes (keyboard appearing/disappearing)
    window.visualViewport?.addEventListener("resize", detectKeyboard);
    window.addEventListener("resize", detectKeyboard);

    return () => {
      window.visualViewport?.removeEventListener("resize", detectKeyboard);
      window.removeEventListener("resize", detectKeyboard);
    };
  }, []);

  // Handle swipe down to close on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    initialTouchY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (initialTouchY.current === null) return;
    currentTouchY.current = e.touches[0].clientY;

    // Calculate the distance swiped
    const deltaY = currentTouchY.current - initialTouchY.current;

    // Only allow swiping down, not up
    if (deltaY > 0 && contentRef.current) {
      // Apply transform to follow finger, with resistance
      contentRef.current.style.transform = `translateY(${deltaY * 0.4}px)`;
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    if (initialTouchY.current === null || currentTouchY.current === null)
      return;

    // Calculate the distance swiped
    const deltaY = currentTouchY.current - initialTouchY.current;

    // If swiped down more than 100px, close the sheet
    if (deltaY > 100) {
      onClose();
    } else if (contentRef.current) {
      // Otherwise, animate back to original position
      contentRef.current.style.transform = "";
    }

    // Reset values
    initialTouchY.current = null;
    currentTouchY.current = null;
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-opacity-25 backdrop-blur-sm flex items-end md:items-center justify-center z-[100]"
      onClick={onClose}
      style={{ touchAction: "none" }}
    >
      <div
        ref={contentRef}
        className="bg-white w-full md:w-auto rounded-t-lg md:rounded-lg shadow-lg transition-all duration-300 ease-in-out"
        style={{
          transform: animation ? "translateY(0)" : "translateY(100%)",
          maxHeight: keyboardVisible ? "100vh" : "85vh",
          height: keyboardVisible ? "100vh" : "auto",
          width:
            typeof window !== "undefined" && window.innerWidth < 768
              ? "100%"
              : "auto",
          minWidth:
            typeof window !== "undefined" && window.innerWidth < 768
              ? "100%"
              : "32rem",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header with drag handle */}
        <div className="sticky top-0 bg-white z-10 px-6 pt-4 pb-2">
          {/* Drag indicator for mobile */}
          <div className="md:hidden w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4"></div>

          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">{title}</h3>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 pt-2">{children}</div>
      </div>
    </div>
  );
}
