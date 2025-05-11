export type CoffeeProduct = {
  "@type": "Product";
  name: string;
  description: string;
  image: string[];
  brand: {
    "@type": "Brand";
    name: string;
  };
  offers?: {
    "@type": "Offer";
    price: string;
    priceCurrency: string;
    availability: string;
  };
  aggregateRating?: {
    "@type": "AggregateRating";
    ratingValue: string;
    reviewCount: string;
  };
};

export type CoffeeRoaster = {
  "@type": "LocalBusiness";
  "@context": "https://schema.org";
  name: string;
  description: string;
  image: string[];
  address?: {
    "@type": "PostalAddress";
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo?: {
    "@type": "GeoCoordinates";
    latitude: string;
    longitude: string;
  };
  url: string;
  telephone?: string;
  priceRange?: string;
};

export type BrewRecipe = {
  "@type": "Recipe";
  "@context": "https://schema.org";
  name: string;
  description: string;
  author: {
    "@type": "Person";
    name: string;
  };
  image: string[];
  recipeCategory: "Coffee";
  recipeCuisine: "Coffee Brewing";
  keywords: string[];
  recipeIngredient: string[];
  recipeInstructions: {
    "@type": "HowToStep";
    text: string;
  }[];
  prepTime?: string; // ISO 8601 duration format
  cookTime?: string; // ISO 8601 duration format
  totalTime?: string; // ISO 8601 duration format
  yield?: {
    "@type": "QuantitativeValue";
    value: number;
    unitText: string;
  };
};
