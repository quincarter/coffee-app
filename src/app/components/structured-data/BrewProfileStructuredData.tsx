import { BrewProfile, User, Coffee } from "@prisma/client";

export default function BrewProfileStructuredData({
  profile,
  author,
  coffee,
}: {
  profile: BrewProfile;
  author: User;
  coffee?: Coffee;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: `Brew profile for ${coffee?.name || "coffee"}`,
    description:
      profile.tastingNotes || `Brew profile for ${coffee?.name || "coffee"}`,
    author: {
      "@type": "Person",
      name: author.name || "Anonymous",
    },
    image: [coffee?.image || `${baseUrl}/chemex-brewing-landing.png`],
    recipeCategory: "Coffee",
    recipeCuisine: "Coffee Brewing",
    keywords: ["coffee", "brewing", "recipe", coffee?.name || ""].filter(
      Boolean
    ),
    recipeIngredient: [
      `${profile.coffeeAmount}g ${coffee?.name || "coffee"}`,
      `${profile.waterAmount}g water`,
    ],
    recipeInstructions: [
      {
        "@type": "HowToStep",
        text: `Use ${profile.coffeeAmount}g of coffee with ${profile.waterAmount}g of water`,
      },
      {
        "@type": "HowToStep",
        text: `Follow the ratio ${profile.ratio}`,
      },
    ],
    totalTime: "PT5M",
    prepTime: "PT2M",
    cookTime: "PT3M",
    recipeYield: {
      "@type": "QuantitativeValue",
      value: profile.waterAmount,
      unitText: "milliliter",
    },
    tool: ["Coffee Grinder", "Scale", "Timer", "Kettle"],
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
