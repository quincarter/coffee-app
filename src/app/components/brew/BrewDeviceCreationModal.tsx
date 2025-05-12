"use client";

import BottomSheet from "../ui/BottomSheet";
import BrewDeviceForm from "./BrewDeviceForm";

type BrewDeviceCreationModalProps = {
  show: boolean;
  onClose: () => void;
  onDeviceCreated: (device: any) => void;
  userId?: string;
};

export default function BrewDeviceCreationModal({
  show,
  onClose,
  onDeviceCreated,
  userId,
}: BrewDeviceCreationModalProps) {
  return (
    <BottomSheet show={show} onClose={onClose} title="Add New Brewing Device">
      <BrewDeviceForm
        onDeviceCreated={onDeviceCreated}
        onCancel={onClose}
        userId={userId}
      />
    </BottomSheet>
  );
}
