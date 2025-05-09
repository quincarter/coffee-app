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
      return {
        title: "Brew Profile | BrewMe",
        description: "A coffee brewing profile on BrewMe",
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
    const imageUrl =
      brewProfile.coffee?.image ||
      `${process.env.NEXT_PUBLIC_APP_URL || ""}/chemex-brewing-landing.png`;

    // Create a descriptive title and description
    const title = `${coffeeName} Brew Profile | BrewMe`;
    const description = `Coffee: ${coffeeName}${tastingNotes ? ` with notes of ${tastingNotes}` : ""}. Ratio: ${ratio}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: coffeeName,
          },
        ],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch (error) {
    console.error("Error generating metadata for brew profile:", error);
    return {
      title: "Brew Profile | BrewMe",
      description: "A coffee brewing profile on BrewMe",
    };
  }
}
