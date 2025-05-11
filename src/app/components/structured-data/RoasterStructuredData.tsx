import { CoffeeRoaster, RoasterLocation } from "@prisma/client";

type RoasterStructuredData = {
  "@context": string;
  "@type": string;
  name: string;
  image: string[];
  description?: string;
  url?: string;
  address?: {
    "@type": string;
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo?: {
    "@type": string;
    latitude: number;
    longitude: number;
  };
  telephone?: string;
  hasMap?: string;
  location?: {
    "@type": string;
    name: string;
    address: {
      "@type": string;
      streetAddress: string;
      addressLocality: string;
      addressRegion: string;
      postalCode: string;
      addressCountry: string;
    };
  }[];
};

export default function RoasterStructuredData({
  roaster,
  locations,
}: {
  roaster: CoffeeRoaster;
  locations: RoasterLocation[];
}) {
  const structuredData: RoasterStructuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: roaster.name,
    image: [roaster.image || "/chemex-brewing-landing.png"],
    description: roaster.notes || `Coffee roaster: ${roaster.name}`,
    url: roaster.website || undefined,
  };

  // Add address if there's a main location
  if (locations.length > 0) {
    structuredData.address = {
      "@type": "PostalAddress",
      streetAddress: locations[0].address,
      addressLocality: "Location not specified",
      addressRegion: "Region not specified",
      postalCode: "00000",
      addressCountry: "US",
    };

    structuredData.telephone =
      locations[0].phoneNumber || roaster.phoneNumber || undefined;
    if (locations[0].mapsLink) {
      structuredData.hasMap = locations[0].mapsLink;
    }

    // Add all locations
    if (locations.length > 1) {
      structuredData.location = locations.map((loc) => ({
        "@type": "Place",
        name: loc.name,
        address: {
          "@type": "PostalAddress",
          streetAddress: loc.address,
          addressLocality: "Location not specified",
          addressRegion: "Region not specified",
          postalCode: "00000",
          addressCountry: "US",
        },
      }));
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}
