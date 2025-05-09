import React from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Coffee, Droplet, Scale } from "lucide-react";
import CoffeeImage from "./coffee/CoffeeImage";

type BrewProfileCardProps = {
  profile: {
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
      image?: string;
      roaster: {
        name: string;
        image?: string;
      };
    };
    brewDevice: {
      name: string;
      image?: string;
    };
  };
};

export default function BrewProfileCard({ profile }: BrewProfileCardProps) {
  return (
    <>
      <Link
        href={`/brew-profiles/${profile.id}`}
        className="bg-white coffee:bg-gray-800 rounded-lg shadow-sm border border-gray-200 coffee:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
      >
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-medium text-lg mb-1">
                {profile.coffee?.name || "Unknown Coffee"}
              </h3>
              <div className="flex items-center">
                <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-200 coffee:bg-gray-700 mr-2">
                  {profile.coffee?.roaster?.image ? (
                    <Image
                      src={profile.coffee.roaster.image}
                      alt={profile.coffee.roaster.name}
                      width={20}
                      height={20}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      ☕
                    </div>
                  )}
                </div>
                <span className="text-sm text-gray-600 coffee:text-gray-300">
                  {profile.coffee?.roaster?.name || "Unknown Roaster"}
                </span>
              </div>
            </div>
            {profile.isPublic && (
              <span className="badge badge-primary badge-sm">Public</span>
            )}
          </div>

          {/* Coffee Image */}
          {profile.coffee?.image && (
            <div className="mb-4">
              <CoffeeImage
                image={profile.coffee.image}
                alt={profile.coffee.name}
                height="sm"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
            <div>
              <p className="text-xs text-gray-500 coffee:text-gray-400">
                Device
              </p>
              <p className="text-sm">{profile.brewDevice?.name || "Unknown"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 coffee:text-gray-400">
                Ratio
              </p>
              <p className="text-sm">{profile.ratio}</p>
            </div>
            {profile.roastLevel && (
              <div>
                <p className="text-xs text-gray-500 coffee:text-gray-400">
                  Roast Level
                </p>
                <p className="text-sm">{profile.roastLevel}</p>
              </div>
            )}
            {profile.process && (
              <div>
                <p className="text-xs text-gray-500 coffee:text-gray-400">
                  Process
                </p>
                <p className="text-sm">{profile.process}</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500 coffee:text-gray-400 pt-3 border-t border-gray-100 coffee:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <Coffee size={14} className="mr-1" />
                <span>{profile.coffeeAmount}g</span>
              </div>
              <div className="flex items-center">
                <Droplet size={14} className="mr-1" />
                <span>{profile.waterAmount}g</span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-200 coffee:bg-gray-700 mr-2">
                {profile.user?.image ? (
                  <Image
                    src={profile.user.image}
                    alt={profile.user.name}
                    width={20}
                    height={20}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    👤
                  </div>
                )}
              </div>
              <span>{profile.user?.name || "Unknown User"}</span>
            </div>
          </div>
        </div>
      </Link>
    </>
  );
}
