import { Metadata } from "next";
import prisma from "@/app/lib/db";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Fetch the brew profile data
  const resolvedParams = await params;
  const id = resolvedParams.id;

  try {
    const brewProfile = await prisma.brewProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        coffee: {
          select: {
            id: true,
            name: true,
            image: true,
            tastingNotes: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // If the profile doesn't exist or is private, return default metadata
    if (!brewProfile || !brewProfile.isPublic) {
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      return {
        title: "Brew Profile | BrewMe",
        description: "A coffee brewing profile on BrewMe",
        metadataBase: new URL(baseUrl),
        openGraph: {
          title: "Brew Profile | BrewMe",
          description: "A coffee brewing profile on BrewMe",
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
          title: "Brew Profile | BrewMe",
          description: "A coffee brewing profile on BrewMe",
          images: [`${baseUrl}/chemex-brewing-landing.png`],
        },
      };
    }

    // Extract the data we need for metadata
    const coffeeName = brewProfile.coffee?.name || "Coffee";
    const ratio = brewProfile.ratio || "";

    // Get tasting notes as a comma-separated string
    const tastingNotes =
      brewProfile.coffee?.tastingNotes?.map((note) => note.name).join(", ") ||
      brewProfile.tastingNotes ||
      "";

    // Use coffee image if available, otherwise use fallback
    // Ensure we have absolute URLs for social media sharing
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    let imageUrl =
      brewProfile.coffee?.image || `${baseUrl}/chemex-brewing-landing.png`;

    // If the image URL is not absolute, make it absolute
    if (!imageUrl.startsWith("http")) {
      imageUrl = `${baseUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
    }

    // Create a descriptive title and description
    const title = `${coffeeName} Brew Profile | BrewMe`;
    const description = `Coffee: ${coffeeName}${tastingNotes ? ` with notes of ${tastingNotes}` : ""}. Ratio: ${ratio}`;

    // Create canonical URL for this brew profile
    const canonicalUrl = `${baseUrl}/brew-profiles/${id}`;

    return {
      title,
      description,
      metadataBase: new URL(baseUrl),
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description,
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
        description,
        images: [imageUrl],
        creator: "@brewme",
      },
    };
  } catch (error) {
    console.error("Error generating metadata for brew profile:", error);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return {
      title: "Brew Profile | BrewMe",
      description: "A coffee brewing profile on BrewMe",
      metadataBase: new URL(baseUrl),
      openGraph: {
        title: "Brew Profile | BrewMe",
        description: "A coffee brewing profile on BrewMe",
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
        title: "Brew Profile | BrewMe",
        description: "A coffee brewing profile on BrewMe",
        images: [`${baseUrl}/chemex-brewing-landing.png`],
      },
    };
  }
}
