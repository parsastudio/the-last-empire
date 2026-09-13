import React from "react";
import { useTranslations } from "next-intl";
import { Check, X, Globe, ShieldCheck, Skull, Coins } from "lucide-react";

export interface DiplomaticProposalFeedbackData {
  proposalType:
    | "PEACE_TREATY"
    | "NON_AGGRESSION_PACT"
    | "STRATEGIC_PARTNERSHIP"
    | "SECURITY_GUARANTEE"
    | "EMERGENCY_PROTECTORATE"
    | "CANCEL_SECURITY_GUARANTEE"
    | "CANCEL_EMERGENCY_PROTECTORATE"
    | "SEND_FOREIGN_AID"
    | "DECLARE_WAR"
    | "CANCEL_TREATY";
  accepted: boolean;
  targetNationId: string;
  targetName: string;
  targetFlagCode?: string;
}

interface TreatyResponseFeedbackContentProps {
  feedback: DiplomaticProposalFeedbackData;
  flagEmoji: string;
  onClose: () => void;
}

export function TreatyResponseFeedbackContent({
  feedback,
  flagEmoji,
  onClose,
}: TreatyResponseFeedbackContentProps) {
  const t = useTranslations("diplomacy.treatyFeedback");
  const tDiplomacy = useTranslations("diplomacy");
  const tCommon = useTranslations("common");

  const isAccepted = feedback.accepted;
  const proposalName = tDiplomacy(`proposalTypes.${feedback.proposalType}`);

  const isCancel = feedback.proposalType === "CANCEL_TREATY";
  const isSecurityCancel =
    feedback.proposalType === "CANCEL_SECURITY_GUARANTEE" ||
    feedback.proposalType === "CANCEL_EMERGENCY_PROTECTORATE";
  const isEmergency = feedback.proposalType === "EMERGENCY_PROTECTORATE";
  const isPartnership = feedback.proposalType === "STRATEGIC_PARTNERSHIP";

  return (
    <div className="py-2 flex flex-col items-center justify-center gap-4 text-center font-sans">
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center border shadow-xl transition-all ${
          isAccepted
            ? isEmergency
              ? "bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-rose-500/25"
              : isCancel || isSecurityCancel
                ? "bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-amber-500/20"
                : "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-emerald-500/20"
            : "bg-rose-500/15 border-rose-500/40 text-rose-400 shadow-rose-500/20"
        }`}
      >
        {isAccepted ? (
          isEmergency ? (
            <Skull size={30} className="animate-pulse" />
          ) : isPartnership ? (
            <Coins size={30} className="text-gdp animate-pulse" />
          ) : (
            <Check size={32} strokeWidth={3} />
          )
        ) : (
          <X size={32} strokeWidth={3} />
        )}
      </div>

      <div className="space-y-2.5 px-2">
        <div className="flex items-center justify-center gap-2 text-base font-extrabold text-foreground">
          <span className="text-xl select-none">{flagEmoji}</span>
          <span>{feedback.targetName}</span>
        </div>

        {isEmergency && isAccepted ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground leading-relaxed">
              {t("protectorateAccepted", { name: feedback.targetName })}
            </p>
            <div className="flex flex-col gap-1.5 text-[10px] font-mono font-bold">
              <span className="px-2.5 py-1 bg-rose-500/15 text-rose-300 border border-rose-500/30 rounded-xl">
                {t("protectorateGarrisonBadge")}
              </span>
              <span className="px-2.5 py-1 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-xl">
                {t("protectorateCostBadge")}
              </span>
            </div>
          </div>
        ) : isSecurityCancel ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">
              {t("securityCancelled", { name: feedback.targetName })}
            </p>
          </div>
        ) : isCancel ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">
              {t("treatyCancelled", { name: feedback.targetName })}
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-military/10 border border-military/30 rounded-full text-[11px] font-mono font-bold text-military">
              <Globe size={12} />
              <span>{t("downgradePenaltyBadge")}</span>
            </div>
          </div>
        ) : isAccepted ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">
              {t("accepted", {
                name: feedback.targetName,
                proposal: proposalName,
              })}
            </p>
            {feedback.proposalType === "SECURITY_GUARANTEE" ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-[11px] font-mono font-bold text-cyan-300">
                <ShieldCheck size={12} />
                <span>{t("securityGuaranteeAcceptedBadge")}</span>
              </div>
            ) : isPartnership ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gdp/10 border border-gdp/30 rounded-full text-[11px] font-mono font-bold text-gdp">
                <Coins size={12} />
                <span>{t("partnershipAcceptedBadge")}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gdp/10 border border-gdp/30 rounded-full text-[11px] font-mono font-bold text-gdp">
                <Globe size={12} />
                <span>{t("reputationGainBadge")}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm font-medium text-muted-foreground leading-relaxed">
            {t("rejected", {
              name: feedback.targetName,
              proposal: proposalName,
            })}
          </p>
        )}
      </div>

      <button
        onClick={onClose}
        className="w-full mt-2 py-3 rounded-2xl bg-secondary hover:bg-secondary/80 border border-border text-foreground font-bold text-xs transition-all cursor-pointer"
      >
        {tCommon("understood")}
      </button>
    </div>
  );
}
