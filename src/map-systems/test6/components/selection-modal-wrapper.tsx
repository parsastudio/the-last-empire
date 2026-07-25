import React from "react";
import { SelectionModal } from "./selection-modal";

interface SelectionModalWrapperProps {
  pendingSelection: { id: string; name: string } | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SelectionModalWrapper({
  pendingSelection,
  onConfirm,
  onCancel,
}: SelectionModalWrapperProps) {
  if (!pendingSelection) {
    return null;
  }
  return (
    <SelectionModal
      countryName={pendingSelection.name}
      countryCode={pendingSelection.id}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
