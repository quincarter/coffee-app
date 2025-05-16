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
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialTouchY = useRef<number | null>(null);
  const currentTouchY = useRef<number | null>(null);
  const lastTouchTime = useRef<number | null>(null);
  const lastTouchY = useRef<number | null>(null);

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
    lastTouchY.current = e.touches[0].clientY;
    lastTouchTime.current = Date.now();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (initialTouchY.current === null || !scrollRef.current) return;

    // Only allow swipe-to-close when at the top of the content
    if (scrollRef.current.scrollTop > 0) return;

    currentTouchY.current = e.touches[0].clientY;
    const deltaY = currentTouchY.current - initialTouchY.current;

    // Calculate velocity
    const now = Date.now();
    const deltaTime = now - (lastTouchTime.current || now);
    const velocity = lastTouchY.current
      ? (currentTouchY.current - lastTouchY.current) / deltaTime
      : 0;

    lastTouchY.current = currentTouchY.current;
    lastTouchTime.current = now;

    // Only allow swiping down with reduced sensitivity
    if (deltaY > 0 && contentRef.current) {
      // More resistance to the swipe (0.3 instead of 0.4)
      contentRef.current.style.transform = `translateY(${deltaY * 0.3}px)`;
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    if (
      initialTouchY.current === null ||
      currentTouchY.current === null ||
      !contentRef.current
    )
      return;

    const deltaY = currentTouchY.current - initialTouchY.current;

    // Calculate final velocity
    const deltaTime = Date.now() - (lastTouchTime.current || Date.now());
    const finalVelocity = lastTouchY.current
      ? (currentTouchY.current - lastTouchY.current) / deltaTime
      : 0;

    // Get the height of the bottom sheet
    const sheetHeight = contentRef.current.offsetHeight;

    // Close if either:
    // 1. Swiped down more than 30% of sheet height
    // 2. Swiped down more than 15% with high velocity
    const heightThreshold = sheetHeight * 0.3;
    const velocityThreshold = 0.5; // pixels per millisecond

    if (
      deltaY > heightThreshold ||
      (deltaY > sheetHeight * 0.15 && finalVelocity > velocityThreshold)
    ) {
      onClose();
    } else {
      // Animate back to original position
      contentRef.current.style.transform = "";
    }

    // Reset values
    initialTouchY.current = null;
    currentTouchY.current = null;
    lastTouchY.current = null;
    lastTouchTime.current = null;
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
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 pt-2">
          {children}
        </div>
      </div>
    </div>
  );
}
