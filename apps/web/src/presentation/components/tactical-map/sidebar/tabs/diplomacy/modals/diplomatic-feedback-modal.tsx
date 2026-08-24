import React from "react";
import { Check, X } from "lucide-react";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";

export interface DiplomaticProposalFeedback {
  proposalType:
    | "PEACE_TREATY"
    | "NON_AGGRESSION_PACT"
    | "FULL_ALLIANCE"
    | "SEND_FOREIGN_AID"
    | "DECLARE_WAR"
    | "CANCEL_TREATY";
  accepted: boolean;
  targetNationId: string;
  targetName: string;
  targetFlagCode?: string;
  message?: string;
}

interface DiplomaticFeedbackModalProps {
  isOpen: boolean;
  feedback: DiplomaticProposalFeedback | null;
  onClose: () => void;
}

function getProposalName(
  type: DiplomaticProposalFeedback["proposalType"],
): string {
  switch (type) {
    case "FULL_ALLIANCE":
      return "اتحاد کامل";
    case "NON_AGGRESSION_PACT":
      return "پیمان عدم تخاصم";
    case "PEACE_TREATY":
      return "معاهده صلح";
    case "SEND_FOREIGN_AID":
      return "کمک مالی";
    case "DECLARE_WAR":
      return "اعلان جنگ";
    case "CANCEL_TREATY":
      return "تنزل روابط و لغو معاهده";
    default:
      return "معاهده دیپلماتیک";
  }
}

export function DiplomaticFeedbackModal({
  isOpen,
  feedback,
  onClose,
}: DiplomaticFeedbackModalProps) {
  if (!isOpen || !feedback) return null;

  const flagEmoji = getFlagEmoji(
    feedback.targetFlagCode || feedback.targetNationId,
  );
  const isAccepted = feedback.accepted;
  const proposalName = getProposalName(feedback.proposalType);
  const isCancel = feedback.proposalType === "CANCEL_TREATY";

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title=""
      maxWidthClass="max-w-sm"
      onClose={onClose}
    >
      <div className="py-2 flex flex-col items-center justify-center gap-4 text-center dir-rtl font-sans">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center border shadow-xl transition-all ${
            isAccepted
              ? isCancel
                ? "bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-amber-500/20"
                : "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-emerald-500/20"
              : "bg-rose-500/15 border-rose-500/40 text-rose-400 shadow-rose-500/20"
          }`}
        >
          {isAccepted ? (
            <Check size={32} strokeWidth={3} />
          ) : (
            <X size={32} strokeWidth={3} />
          )}
        </div>

        <div className="space-y-1.5 px-2">
          <div className="flex items-center justify-center gap-2 text-base font-extrabold text-foreground">
            <span className="text-xl select-none">{flagEmoji}</span>
            <span>{feedback.targetName}</span>
          </div>

          {isCancel ? (
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">
              معاهده پیشین با دولت{" "}
              <strong className="text-foreground">{feedback.targetName}</strong>{" "}
              لغو گردید و سطح روابط با موفقیت{" "}
              <span className="text-amber-400 font-black">تنزل یافت</span>.
            </p>
          ) : (
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">
              دولت{" "}
              <strong className="text-foreground">{feedback.targetName}</strong>{" "}
              درخواست{" "}
              <span
                className={`font-black ${
                  isAccepted ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {proposalName}
              </span>{" "}
              شما را{" "}
              <span
                className={`font-black ${
                  isAccepted ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {isAccepted ? "پذیرفت" : "رد کرد"}
              </span>
              .
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-2 py-3 rounded-2xl bg-secondary hover:bg-secondary/80 border border-border text-foreground font-bold text-xs transition-all cursor-pointer"
        >
          متوجه شدم
        </button>
      </div>
    </UnifiedModalShell>
  );
}
