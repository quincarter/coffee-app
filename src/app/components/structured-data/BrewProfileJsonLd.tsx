import type { BrewRecipe } from "@/app/types/schema";
import { BrewProfile, User, Coffee } from "@prisma/client";

export default function BrewProfileJsonLd({
  profile,
  author,
  coffee,
}: {
  profile: BrewProfile;
  author: User;
  coffee?: Coffee;
}) {
  const structuredData: BrewRecipe = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: `Brew profile for ${coffee?.name || "coffee"}`,
    description:
      profile.tastingNotes || `Brew profile for ${coffee?.name || "coffee"}`,
    author: {
      "@type": "Person",
      name: author.name || "Anonymous",
    },
    image: [coffee?.image || "/chemex-brewing-landing.png"],
    recipeCategory: "Coffee",
    recipeCuisine: "Coffee Brewing",
    keywords: ["coffee", "brewing", "recipe"],
    recipeIngredient: [
      `${profile.coffeeAmount}g coffee`,
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
    yield: {
      "@type": "QuantitativeValue",
      value: profile.waterAmount,
      unitText: "milliliter",
    },
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
