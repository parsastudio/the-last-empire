"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Check, X, Loader2, Handshake } from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory, PendingDiplomaticProposal } from "@geopolitics/domain";
import { useUiStore } from "@/presentation/stores/use-ui-store";

interface ProposalActionButtonsProps {
  proposal: PendingDiplomaticProposal;
  humanNationId: string;
}

export function ProposalActionButtons({
  proposal,
  humanNationId,
}: ProposalActionButtonsProps) {
  const t = useTranslations("reports.proposals");
  const { dispatchAction, isSubmitting } = useGameActions();
  const openModal = useUiStore((state) => state.openModal);

  const isPeace = proposal.proposalType === "PEACE_TREATY";

  const handleRespond = async (accept: boolean) => {
    if (isSubmitting) return;

    const action = ActionFactory.respondDiplomaticProposal(
      humanNationId,
      proposal.id,
      accept,
    );

    await dispatchAction(action);
  };

  if (isPeace) {
    return (
      <div className="flex items-center gap-1.5 shrink-0 font-sans" dir="rtl">
        <button
          onClick={() =>
            openModal({
              type: "PEACE_NEGOTIATION",
              targetNationId: proposal.senderNationId,
            })
          }
          className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/50 hover:border-emerald-400 rounded-xl text-[10px] font-black transition-all cursor-pointer shadow-sm shadow-emerald-500/10 flex items-center gap-1"
        >
          <Handshake size={13} strokeWidth={2.5} />
          <span>{t("viewAndSignPeace")}</span>
        </button>

        <button
          onClick={() => handleRespond(false)}
          disabled={isSubmitting}
          className="px-2 py-1 bg-secondary/80 hover:bg-rose-500/15 text-muted-foreground hover:text-rose-400 border border-border/60 hover:border-rose-500/40 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
        >
          <X size={11} />
          <span>{t("reject")}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 shrink-0 font-sans" dir="rtl">
      <button
        onClick={() => handleRespond(true)}
        disabled={isSubmitting}
        className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/50 hover:border-emerald-400 rounded-xl text-[10px] font-black transition-all cursor-pointer shadow-sm shadow-emerald-500/10 flex items-center gap-1 disabled:opacity-50"
      >
        {isSubmitting ? (
          <Loader2 size={11} className="animate-spin" />
        ) : (
          <Check size={12} strokeWidth={2.5} />
        )}
        <span>{t("accept")}</span>
      </button>

      <button
        onClick={() => handleRespond(false)}
        disabled={isSubmitting}
        className="px-2 py-1 bg-secondary/80 hover:bg-rose-500/15 text-muted-foreground hover:text-rose-400 border border-border/60 hover:border-rose-500/40 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
      >
        <X size={11} />
        <span>{t("reject")}</span>
      </button>
    </div>
  );
}
