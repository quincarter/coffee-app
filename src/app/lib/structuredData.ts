// Helper functions to generate structured data for different content types

export function generateCoffeeStructuredData(coffee: any, baseUrl: string) {
  const imageUrl = coffee.image?.startsWith('http') 
    ? coffee.image 
    : `${baseUrl}${coffee.image?.startsWith('/') ? '' : '/'}${coffee.image || '/chemex-brewing-landing.png'}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: coffee.name,
    description: coffee.description || `${coffee.name} coffee by ${coffee.roaster?.name || 'unknown roaster'}`,
    image: imageUrl,
    brand: {
      '@type': 'Brand',
      name: coffee.roaster?.name || 'Unknown Roaster'
    },
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      url: `${baseUrl}/coffees/${coffee.id}`
    },
    ...(coffee.tastingNotes?.length > 0 && {
      additionalProperty: coffee.tastingNotes.map((note: any) => ({
        '@type': 'PropertyValue',
        name: 'Tasting Note',
        value: note.name
      }))
    })
  };
}

export function generateRoasterStructuredData(roaster: any, baseUrl: string) {
  const imageUrl = roaster.image?.startsWith('http') 
    ? roaster.image 
    : `${baseUrl}${roaster.image?.startsWith('/') ? '' : '/'}${roaster.image || '/chemex-brewing-landing.png'}`;

  const locations = roaster.locations || [];
  
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: roaster.name,
    description: roaster.notes || `${roaster.name} - Coffee Roaster`,
    image: imageUrl,
    url: roaster.website || `${baseUrl}/roasters/${roaster.id}`,
    telephone: roaster.phoneNumber || '',
    ...(locations.length > 0 && {
      location: locations.map((loc: any) => ({
        '@type': 'Place',
        name: loc.name || roaster.name,
        address: {
          '@type': 'PostalAddress',
          streetAddress: loc.address || roaster.address || '',
        },
        ...(loc.mapsLink && { hasMap: loc.mapsLink })
      }))
    }),
    ...(locations.length === 0 && roaster.address && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: roaster.address,
      }
    })
  };
}

export function generateBrewProfileStructuredData(brewProfile: any, baseUrl: string) {
  const imageUrl = brewProfile.coffee?.image?.startsWith('http') 
    ? brewProfile.coffee.image 
    : `${baseUrl}${brewProfile.coffee?.image?.startsWith('/') ? '' : '/'}${brewProfile.coffee?.image || '/chemex-brewing-landing.png'}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: `${brewProfile.coffee?.name || 'Coffee'} Brew Profile`,
    author: {
      '@type': 'Person',
      name: brewProfile.user?.name || 'BrewMe User'
    },
    datePublished: brewProfile.createdAt,
    description: brewProfile.notes || `Brew profile for ${brewProfile.coffee?.name || 'coffee'}`,
    image: imageUrl,
    recipeIngredient: [
      `${brewProfile.coffee?.name || 'Coffee'} - ${brewProfile.coffeeAmount}g`,
      `Water - ${brewProfile.waterAmount}ml`
    ],
    recipeInstructions: brewProfile.instructions || `Brew with a ratio of 1:${brewProfile.ratio}`,
    totalTime: `PT${brewProfile.brewTime || 3}M`,
    recipeYield: '1 serving',
    tool: brewProfile.brewingDevice?.name || 'Coffee Brewer'
  };
}
