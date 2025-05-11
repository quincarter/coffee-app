"use client";

import BottomSheet from "../ui/BottomSheet";
import BrewProfileForm from "./BrewProfileForm";

type BrewProfileCreationModalProps = {
  show: boolean;
  onClose: () => void;
  onProfileCreated: (profile: any) => void;
  userId?: string;
};

export default function BrewProfileCreationModal({
  show,
  onClose,
  onProfileCreated,
  userId,
}: BrewProfileCreationModalProps) {
  return (
    <BottomSheet show={show} onClose={onClose} title="Create New Brew Profile">
      <BrewProfileForm 
        onProfileCreated={onProfileCreated} 
        onCancel={onClose}
        userId={userId}
      />
    </BottomSheet>
  );
}
