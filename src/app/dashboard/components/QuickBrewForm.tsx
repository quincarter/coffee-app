"use client";

import NewBrewForm from "@/app/brew-log/components/NewBrewForm";
import { UserBrewingDevice } from "@/app/types";

type Props = {
  userId?: string;
  userDevices: UserBrewingDevice[];
  onBrewCreated: (brew: any) => void;
  onCancel: () => void;
};

export default function QuickBrewForm({
  userId,
  userDevices,
  onBrewCreated,
  onCancel,
}: Props) {
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
