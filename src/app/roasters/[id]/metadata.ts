import { Metadata } from "next";
import prisma from "@/app/lib/db";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Fetch the roaster data
  const resolvedParams = await params;
  const id = resolvedParams.id;

  try {
    const roaster = await prisma.coffeeRoaster.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            coffees: true,
          },
        },
      },
    });

    // If the roaster doesn't exist, return default metadata
    if (!roaster) {
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      return {
        title: "Roaster | BrewMe",
        description: "A coffee roaster on BrewMe",
        metadataBase: new URL(baseUrl),
        openGraph: {
          title: "Roaster | BrewMe",
          description: "A coffee roaster on BrewMe",
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
          title: "Roaster | BrewMe",
          description: "A coffee roaster on BrewMe",
          images: [`${baseUrl}/chemex-brewing-landing.png`],
        },
      };
    }

    // Extract the data we need for metadata
    const roasterName = roaster.name;
    const coffeeCount = roaster._count?.coffees || 0;
    const description =
      roaster.notes ||
      `${roasterName} - Coffee Roaster with ${coffeeCount} coffees`;

    // Use roaster image if available, otherwise use fallback
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    let imageUrl = roaster.image || `${baseUrl}/chemex-brewing-landing.png`;

    // If the image URL is not absolute, make it absolute
    if (!imageUrl.startsWith("http")) {
      imageUrl = `${baseUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
    }

    // Create a descriptive title and description
    const title = `${roasterName} | Coffee Roaster | BrewMe`;
    const metaDescription =
      description.length > 160
        ? description.substring(0, 157) + "..."
        : description;

    // Create canonical URL for this roaster
    const canonicalUrl = `${baseUrl}/roasters/${id}`;

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
            alt: roasterName,
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
    console.error("Error generating metadata for roaster:", error);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return {
      title: "Roaster | BrewMe",
      description: "A coffee roaster on BrewMe",
      metadataBase: new URL(baseUrl),
      openGraph: {
        title: "Roaster | BrewMe",
        description: "A coffee roaster on BrewMe",
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
        title: "Roaster | BrewMe",
        description: "A coffee roaster on BrewMe",
        images: [`${baseUrl}/chemex-brewing-landing.png`],
      },
    };
  }
}
