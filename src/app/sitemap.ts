import { MetadataRoute } from 'next';
import prisma from '@/app/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // Define static routes
  const routes = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/coffees`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/roasters`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/brew-profiles`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ] as MetadataRoute.Sitemap;

  try {
    // Get all public brew profiles
    const brewProfiles = await prisma.brewProfile.findMany({
      where: { isPublic: true },
      select: { id: true, updatedAt: true },
    });

    const brewProfileRoutes = brewProfiles.map((profile) => ({
      url: `${baseUrl}/brew-profiles/${profile.id}`,
      lastModified: profile.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    // Get all coffees
    const coffees = await prisma.coffee.findMany({
      select: { id: true, updatedAt: true },
    });

    const coffeeRoutes = coffees.map((coffee) => ({
      url: `${baseUrl}/coffees/${coffee.id}`,
      lastModified: coffee.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    // Get all roasters
    const roasters = await prisma.coffeeRoaster.findMany({
      select: { id: true, updatedAt: true },
    });

    const roasterRoutes = roasters.map((roaster) => ({
      url: `${baseUrl}/roasters/${roaster.id}`,
      lastModified: roaster.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    // Combine all routes
    return [...routes, ...brewProfileRoutes, ...coffeeRoutes, ...roasterRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return only static routes if there's an error
    return routes;
  }
}
