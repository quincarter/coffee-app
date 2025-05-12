"use client";

import NewBrewForm from "@/app/brew-log/components/NewBrewForm";
import { UserBrewingDevice } from "@/app/types";

type Props = {
  userId?: string;
  userDevices: UserBrewingDevice[];
  onBrewCreated: (brew: any) => void;
  onDeviceAdded: (device: UserBrewingDevice) => void;
  onCancel: () => void;
};

export default function QuickBrewForm({
  userId,
  userDevices,
  onBrewCreated,
  onDeviceAdded,
  onCancel,
}: Props) {
  return (
    <NewBrewForm
      userId={userId}
      userDevices={userDevices}
      onBrewCreated={onBrewCreated}
      onDeviceAdded={onDeviceAdded}
      onCancel={onCancel}
      isQuickForm={true}
    />
  );
}
