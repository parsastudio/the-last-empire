import React from "react";
import { EventDecisionModal } from "../../modals/event-decision-modal";
import { useToast } from "@/presentation/context/toast-context";

interface TurnEventDialogProps {
  isOpen: boolean;
  eventData?: {
    title: string;
    description: string;
    choices: {
      id: string;
      description: string;
      effectsSummary: { label: string; value: string; isPositive: boolean }[];
    }[];
  } | null;
  onClose: () => void;
}

export function TurnEventDialog({
  isOpen,
  eventData,
  onClose,
}: TurnEventDialogProps) {
  const { showToast } = useToast();

  if (!isOpen || !eventData) return null;

  const handleSelectChoice = (_choiceId: string) => {
    showToast(
      "تصمیم حاکمیتی ثبت شد",
      "فرمان جدید با موفقیت ابلاغ گردید.",
      "success",
    );
    onClose();
  };

  return (
    <EventDecisionModal
      isOpen={isOpen}
      title={eventData.title}
      description={eventData.description}
      choices={eventData.choices}
      onSelectChoice={handleSelectChoice}
    />
  );
}
