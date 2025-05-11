import { CoffeeRoaster, RoasterLocation } from "@prisma/client";

type RoasterStructuredData = {
  "@context": string;
  "@type": string;
  "@id": string;
  name: string;
  image: string[];
  description: string;
  url: string;
  telephone?: string;
  hasMap?: string;
  address: {
    "@type": string;
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  location: {
    "@type": string;
    address: {
      "@type": string;
      streetAddress: string;
      addressLocality: string;
      addressRegion: string;
      postalCode: string;
      addressCountry: string;
    };
  };
  sameAs: string[];
};

export default function RoasterJsonLd({
  roaster,
  mainLocation,
}: {
  roaster: CoffeeRoaster;
  mainLocation: RoasterLocation;
}) {
  const structuredData: RoasterStructuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": mainLocation ? `${process.env.NEXT_PUBLIC_APP_URL}/roasters/${roaster.id}/locations/${mainLocation.id}` : `${process.env.NEXT_PUBLIC_APP_URL}/roasters/${roaster.id}`,
    name: roaster.name,
    image: [roaster.image || "/chemex-brewing-landing.png"],
    description: roaster.notes || `Coffee roaster: ${roaster.name}`,
    url: roaster.website || `${process.env.NEXT_PUBLIC_APP_URL}/roasters/${roaster.id}`,
    telephone: mainLocation?.phoneNumber || roaster.phoneNumber || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: mainLocation?.address || roaster.address || "Address not provided",
      addressLocality: "Location not specified",
      addressRegion: "Region not specified",
      postalCode: "00000",
      addressCountry: "US",
    },
    location: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        streetAddress: mainLocation?.address || roaster.address || "Address not provided",
        addressLocality: "Location not specified",
        addressRegion: "Region not specified",
        postalCode: "00000",
        addressCountry: "US",
      },
    },
    sameAs: [
      roaster.website,
    ].filter(Boolean) as string[],
  };

  // Only include hasMap if mapsLink exists and is not null
  if (mainLocation?.mapsLink) {
    structuredData.hasMap = mainLocation.mapsLink;
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
