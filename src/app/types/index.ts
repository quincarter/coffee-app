// Common types used across the application

export type User = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  userRole: string;
  createdAt: string;
  updatedAt: string;
};

export type BrewSession = {
  id: string;
  name: string;
  notes: string;
  image?: string | null; // Allow null values
  userId: string;
  user?: {
    name: string;
    image?: string | null; // Allow null values
  };
  brewingDeviceId: string;
  brewTime: string;
  brewingDevice: {
    name: string;
    image: string | null; // Allow null values
  };
  additionalDevices?: {
    id: string;
    brewSessionId: string;
    brewingDeviceId: string;
    createdAt: string;
    brewingDevice: {
      id: string;
      name: string;
      image: string | null; // Allow null values
    };
  }[];
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
  isPublic?: boolean;
};

export type UserBrewingDevice = {
  id: string;
  name: string;
  description: string;
  brewingDeviceId: string;
  image?: string | null; // Add image property
  brewingDevice: {
    id: string;
    name: string;
    image: string | null;
  };
  createdAt: string;
  updatedAt: string;
};
