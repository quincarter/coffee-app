"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function BackgroundImage() {
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [opacity, setOpacity] = useState(0.8);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBackgroundSettings() {
      try {
        const response = await fetch("/api/user/background-settings");
        if (response.ok) {
          const data = await response.json();
          setBackgroundImage(data.backgroundImage);
          setOpacity(data.backgroundOpacity || 0.8);
        }
      } catch (error) {
        console.error("Error fetching background settings:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBackgroundSettings();
  }, []);

  if (loading || !backgroundImage) {
    return null;
  }

  return (
    <div className="fixed inset-0 -z-10">
      <Image
        src={backgroundImage}
        alt="Background"
        fill
        className="object-cover"
        style={{ opacity }}
        priority
      />
    </div>
  );
}
