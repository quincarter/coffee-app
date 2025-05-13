// Common types used across the application

export type User = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  userRole: string;
  createdAt: string;
  updatedAt: string;
  backgroundImage?: string | null;
  backgroundOpacity?: number;
  dismissedBanners?: string[];
  emailVerified?: boolean;
};

export type BrewSession = {
  id: string;
  name: string;
  notes: string;
  image?: string | null;
  userId: string;
  user?: {
    name: string;
    image?: string | null;
  };
  brewingDeviceId: string;
  brewTime: string;
  brewingDevice: {
    name: string;
    image: string | null;
  };
  additionalDevices?: {
    id: string;
    brewSessionId: string;
    brewingDeviceId: string;
    createdAt: string;
    brewingDevice: {
      id: string;
      name: string;
      image: string | null;
    };
  }[];
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
  isPublic?: boolean;
  brewProfileId?: string;
};

export type UserBrewingDevice = {
  id: string;
  name: string;
  description: string;
  brewingDeviceId: string;
  image?: string | null;
  brewingDevice: {
    id: string;
    name: string;
    image: string | null;
  };
  createdAt: string;
  updatedAt: string;
};

export interface BrewProfile {
  id: string;
  userId: string;
  isPublic: boolean;
  waterAmount: number;
  coffeeAmount: number;
  ratio: string;
  roastLevel?: string;
  process?: string;
  createdAt: string;
  user: {
    name: string;
    image?: string;
  };
  coffee: {
    name: string;
    roaster: {
      name: string;
      image?: string;
    };
  };
  brewDevice: {
    name: string;
    image?: string;
  };
}

// Add any other types that might be needed across the application
export type Session = {
  userId: string;
  user: {
    backgroundImage: string;
    backgroundOpacity: number;
    id: string;
    email: string;
    name: string;
    role: string;
    image?: string;
  };
  exp?: number;
};

export type CoffeeFormData = {
  name: string;
  roasterId: string;
  description: string;
  countryOfOrigin: string;
  elevation: string;
  process: string;
  variety: string;
  tastingNotes: string[];
  image: File | null;
  productUrl?: string;
};

export type FavoriteType =
  | "brews"
  | "profiles"
  | "coffees"
  | "roasters"
  | "locations";

export type RoasterFormData = {
  name: string;
  address: string;
  mapsLink: string;
  phoneNumber: string;
  notes: string;
  website: string;
  image?: string | null;
};

export type CoffeeVariety =
  | "single_origin"
  | "blend"
  | "microlot"
  | "seasonal"
  | "signature_blend";
