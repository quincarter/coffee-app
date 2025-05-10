import { Metadata } from "next";
import prisma from "@/app/lib/db";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Fetch the coffee data
  const resolvedParams = await params;
  const id = resolvedParams.id;

  try {
    const coffee = await prisma.coffee.findUnique({
      where: { id },
      include: {
        roaster: true,
        tastingNotes: true,
      },
    });

    // If the coffee doesn't exist, return default metadata
    if (!coffee) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      return {
        title: "Coffee | BrewMe",
        description: "A coffee on BrewMe",
        metadataBase: new URL(baseUrl),
        openGraph: {
          title: "Coffee | BrewMe",
          description: "A coffee on BrewMe",
          images: [
            {
              url: `${baseUrl}/chemex-brewing-landing.png`,
              width: 1200,
              height: 630,
              alt: "BrewMe Coffee App",
            },
          ],
          type: "website",
        },
        twitter: {
          card: "summary_large_image",
          title: "Coffee | BrewMe",
          description: "A coffee on BrewMe",
          images: [`${baseUrl}/chemex-brewing-landing.png`],
        },
      };
    }

    // Extract the data we need for metadata
    const coffeeName = coffee.name;
    const roasterName = coffee.roaster?.name || "Unknown Roaster";
    
    // Get tasting notes as a comma-separated string
    const tastingNotes = coffee.tastingNotes?.map((note) => note.name).join(", ") || "";
    
    // Create a description that includes origin, process, and tasting notes if available
    let description = `${coffeeName} by ${roasterName}`;
    if (coffee.countryOfOrigin) {
      description += `, from ${coffee.countryOfOrigin}`;
    }
    if (coffee.process) {
      description += `, ${coffee.process} process`;
    }
    if (tastingNotes) {
      description += `. Tasting notes: ${tastingNotes}`;
    }
    
    // Use coffee image if available, otherwise use fallback
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    let imageUrl = coffee.image || `${baseUrl}/chemex-brewing-landing.png`;

    // If the image URL is not absolute, make it absolute
    if (!imageUrl.startsWith("http")) {
      imageUrl = `${baseUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
    }

    // Create a descriptive title
    const title = `${coffeeName} by ${roasterName} | BrewMe`;
    
    // Ensure description isn't too long for meta tags
    const metaDescription = description.length > 160 ? description.substring(0, 157) + "..." : description;

    // Create canonical URL for this coffee
    const canonicalUrl = `${baseUrl}/coffees/${id}`;

    return {
      title,
      description: metaDescription,
      metadataBase: new URL(baseUrl),
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description: metaDescription,
        url: canonicalUrl,
        siteName: "BrewMe",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: coffeeName,
          },
        ],
        locale: "en_US",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description: metaDescription,
        images: [imageUrl],
        creator: "@brewme",
      },
    };
  } catch (error) {
    console.error("Error generating metadata for coffee:", error);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return {
      title: "Coffee | BrewMe",
      description: "A coffee on BrewMe",
      metadataBase: new URL(baseUrl),
      openGraph: {
        title: "Coffee | BrewMe",
        description: "A coffee on BrewMe",
        images: [
          {
            url: `${baseUrl}/chemex-brewing-landing.png`,
            width: 1200,
            height: 630,
            alt: "BrewMe Coffee App",
          },
        ],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: "Coffee | BrewMe",
        description: "A coffee on BrewMe",
        images: [`${baseUrl}/chemex-brewing-landing.png`],
      },
    };
  }
}
