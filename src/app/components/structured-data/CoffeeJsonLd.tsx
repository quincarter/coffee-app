import { Coffee, CoffeeRoaster } from "@prisma/client";

export default function CoffeeJsonLd({
  coffee,
  roaster,
}: {
  coffee: Coffee;
  roaster: CoffeeRoaster;
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: coffee.name,
    description: coffee.description || `${coffee.name} by ${roaster.name}`,
    image: [coffee.image || "/chemex-brewing-landing.png"],
    brand: {
      "@type": "Brand",
      name: roaster.name,
      logo: roaster.image || "/chemex-brewing-landing.png",
    },
    manufacturer: {
      "@type": "Organization",
      name: roaster.name,
      image: roaster.image || "/chemex-brewing-landing.png",
    },
    additionalProperty: [
      coffee.process && {
        "@type": "PropertyValue",
        name: "Process",
        value: coffee.process,
      },
      coffee.countryOfOrigin && {
        "@type": "PropertyValue",
        name: "Country of Origin",
        value: coffee.countryOfOrigin,
      },
      coffee.elevation && {
        "@type": "PropertyValue",
        name: "Elevation",
        value: coffee.elevation,
      },
    ].filter(Boolean),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}
