"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface CoffeeImageProps {
  image: string;
  alt: string;
  height?: "sm" | "md" | "lg";
  className?: string;
  showZoomIndicator?: boolean;
}

const CoffeeImage: React.FC<CoffeeImageProps> = ({
  image,
  alt,
  height = "md",
  className = "",
  showZoomIndicator = true,
}) => {
  const [showImageModal, setShowImageModal] = useState(false);

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent the parent Link from navigating
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  // Define height based on the prop
  const heightClass = {
    sm: "h-40",
    md: "h-64",
    lg: "h-80",
  }[height];

  return (
    <>
      <div
        className={`relative ${heightClass} rounded-md overflow-hidden cursor-pointer ${className}`}
        onClick={handleImageClick}
      >
        <Image src={image} alt={alt} fill className="object-cover" />
        {showZoomIndicator && (
          <div className="absolute inset-0  bg-opacity-0 hover:bg-opacity-10 flex items-center justify-center">
            <span className="text-white text-xs font-medium px-2 py-1 bg-opacity-50 rounded-md">
              Click to zoom
            </span>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 bg-opacity-75 flex items-center justify-center z-50"
          onClick={closeImageModal}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full mx-4">
            <button
              className="absolute top-4 right-4 text-white  bg-opacity-50 rounded-full p-2 hover:bg-opacity-70"
              onClick={closeImageModal}
            >
              <X size={24} />
            </button>

            <div className="relative w-full h-[80vh]">
              <Image src={image} alt={alt} fill className="object-contain" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CoffeeImage;
