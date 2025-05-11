import { MetadataRoute } from "next";
import prisma from "@/app/lib/db";

type ChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get all roasters (they are public by default)
  const roasters = await prisma.coffeeRoaster.findMany({
    select: { id: true, updatedAt: true },
  });

  // Get all coffees (they are public by default)
  const coffees = await prisma.coffee.findMany({
    select: { id: true, updatedAt: true },
  });

  // Get all public brew profiles
  const brewProfiles = await prisma.brewProfile.findMany({
    where: { isPublic: true },
    select: { id: true, updatedAt: true },
  });

  const roasterUrls: MetadataRoute.Sitemap = roasters.map((roaster) => ({
    url: `${process.env.NEXT_PUBLIC_APP_URL}/roasters/${roaster.id}`,
    lastModified: roaster.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const coffeeUrls: MetadataRoute.Sitemap = coffees.map((coffee) => ({
    url: `${process.env.NEXT_PUBLIC_APP_URL}/coffees/${coffee.id}`,
    lastModified: coffee.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const brewProfileUrls: MetadataRoute.Sitemap = brewProfiles.map(
    (profile) => ({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/brew-profiles/${profile.id}`,
      lastModified: profile.updatedAt,
      changeFrequency: "monthly",
      priority: 0.7,
    })
  );

  // Static routes with priority and change frequency
  const staticRoutes: Array<{
    path: string;
    priority: number;
    changeFrequency: ChangeFrequency;
  }> = [
    { path: "", priority: 1.0, changeFrequency: "daily" },
    { path: "/roasters", priority: 0.9, changeFrequency: "daily" },
    { path: "/coffees", priority: 0.9, changeFrequency: "daily" },
    { path: "/brew-profiles", priority: 0.9, changeFrequency: "daily" },
  ];

  const routes: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${process.env.NEXT_PUBLIC_APP_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  return [...routes, ...roasterUrls, ...coffeeUrls, ...brewProfileUrls];
}
