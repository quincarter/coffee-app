"use client";

export const WelcomeHeaderSkeleton = () => (
  <div className="mb-8 animate-pulse">
    <div className="h-8 w-64 bg-base-200 rounded mb-2"></div>
    <div className="h-4 w-96 bg-base-200 rounded"></div>
  </div>
);

export const FavoriteBrewsSkeleton = () => (
  <div className="space-y-2 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="space-y-2">
        <div className="h-5 w-3/4 bg-base-200 rounded"></div>
        <div className="h-4 w-1/2 bg-base-200 rounded"></div>
      </div>
    ))}
  </div>
);

export const BrewingStatsSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div>
      <div className="h-8 w-16 bg-base-200 rounded mb-2"></div>
      <div className="h-4 w-24 bg-base-200 rounded"></div>
    </div>
    <div>
      <div className="h-8 w-32 bg-base-200 rounded mb-2"></div>
      <div className="h-4 w-24 bg-base-200 rounded"></div>
    </div>
  </div>
);

export const BrewProfilesSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-base-100 rounded-lg shadow p-6 h-48">
        <div className="h-6 w-3/4 bg-base-200 rounded mb-4"></div>
        <div className="h-4 w-1/2 bg-base-200 rounded mb-2"></div>
        <div className="h-20 w-full bg-base-200 rounded"></div>
      </div>
    ))}
  </div>
);

export const RecentBrewsSkeleton = () => (
  <div className="max-w-3xl mx-auto animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-base-100 rounded-lg shadow p-6 mb-4">
        <div className="h-6 w-3/4 bg-base-200 rounded mb-2"></div>
        <div className="h-4 w-1/2 bg-base-200 rounded"></div>
      </div>
    ))}
  </div>
);
