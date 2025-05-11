"use client";

import CoffeeImage from "../coffee/CoffeeImage";

export default function CoffeeImageWrapper({
  image,
  alt,
  height,
}: {
  image: string;
  alt: string;
  height?: "sm" | "md" | "lg";
}) {
  return <CoffeeImage image={image} alt={alt} height={height} />;
}
