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
  userDevices: UserBrewingDevice[];
  onBrewCreated: (brew: any) => void;
  onCancel: () => void;
};

export default function QuickBrewForm({ userDevices, onBrewCreated, onCancel }: Props) {
  return (
    <NewBrewForm
      userDevices={userDevices}
      onBrewCreated={onBrewCreated}
      onCancel={onCancel}
      isQuickForm={true}
    />
  );
}
