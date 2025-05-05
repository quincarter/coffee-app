"use client";

import NewBrewForm from "@/app/brew-log/components/NewBrewForm";

type UserBrewingDevice = {
  id: string;
  name: string;
  description: string;
  brewingDeviceId: string;
  brewingDevice: {
    name: string;
    image: string;
  };
};

type Props = {
  userId?: string;
  userDevices: UserBrewingDevice[];
  onBrewCreated: (brew: any) => void;
  onCancel: () => void;
};

export default function QuickBrewForm({ userId, userDevices, onBrewCreated, onCancel }: Props) {
  return (
    <NewBrewForm
      userId={userId}
      userDevices={userDevices}
      onBrewCreated={onBrewCreated}
      onCancel={onCancel}
      isQuickForm={true}
    />
  );
}
