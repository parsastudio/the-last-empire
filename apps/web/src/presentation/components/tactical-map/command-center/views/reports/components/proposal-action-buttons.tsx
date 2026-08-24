"use client";

import React from "react";
import { Check, X, Loader2 } from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@geopolitics/domain";

interface ProposalActionButtonsProps {
  proposalId: string;
  humanNationId: string;
  sourceNationName: string;
}

export function ProposalActionButtons({
  proposalId,
  humanNationId,
  sourceNationName,
}: ProposalActionButtonsProps) {
  const { dispatchAction, isSubmitting } = useGameActions();

  const handleRespond = async (accept: boolean) => {
    if (isSubmitting) return;

    const action = ActionFactory.respondDiplomaticProposal(
      humanNationId,
      proposalId,
      accept,
    );

    const message = accept
      ? `معاهده پیشنهادی از سوی ${sourceNationName} پذیرفته شد.`
      : `پیشنهاد معاهده از سوی ${sourceNationName} رد شد.`;

    await dispatchAction(action, message);
  };

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
        <span>تایید</span>
      </button>

      <button
        onClick={() => handleRespond(false)}
        disabled={isSubmitting}
        className="px-2 py-1 bg-secondary/80 hover:bg-rose-500/15 text-muted-foreground hover:text-rose-400 border border-border/60 hover:border-rose-500/40 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
      >
        <X size={11} />
        <span>رد</span>
      </button>
    </div>
  );
}
