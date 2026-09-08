import React from "react";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { ReactiveDefenseEvent } from "@geopolitics/game-engine";
import { WarDeclarationFeedbackContent } from "./components/war-declaration-feedback-content";
import {
  TreatyResponseFeedbackContent,
  DiplomaticProposalFeedbackData,
} from "./components/treaty-response-feedback-content";

export interface RetaliatingGuarantorFeedbackItem {
  id: string;
  name: string;
  flagCode: string;
}

export interface DiplomaticProposalFeedback extends DiplomaticProposalFeedbackData {
  defenseEvent?: ReactiveDefenseEvent;
  retaliatingGuarantors?: RetaliatingGuarantorFeedbackItem[];
}

interface DiplomaticFeedbackModalProps {
  isOpen: boolean;
  feedback: DiplomaticProposalFeedback | null;
  onClose: () => void;
}

export function DiplomaticFeedbackModal({
  isOpen,
  feedback,
  onClose,
}: DiplomaticFeedbackModalProps) {
  if (!isOpen || !feedback) return null;

  const isWar = feedback.proposalType === "DECLARE_WAR";
  const flagEmoji = getFlagEmoji(
    feedback.targetFlagCode || feedback.targetNationId,
  );

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title=""
      maxWidthClass={isWar ? "max-w-md" : "max-w-sm"}
      onClose={onClose}
    >
      {isWar ? (
        <WarDeclarationFeedbackContent
          targetName={feedback.targetName}
          defense={feedback.defenseEvent}
          retaliatingGuarantors={feedback.retaliatingGuarantors}
          onClose={onClose}
        />
      ) : (
        <TreatyResponseFeedbackContent
          feedback={feedback}
          flagEmoji={flagEmoji}
          onClose={onClose}
        />
      )}
    </UnifiedModalShell>
  );
}
