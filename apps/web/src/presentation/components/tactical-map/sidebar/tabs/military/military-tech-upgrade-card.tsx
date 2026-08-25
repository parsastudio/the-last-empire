"use client";

import React, { useState } from "react";
import { Award, Zap, Loader2, Sparkles } from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { MilitaryStack } from "@/domain/military/military.schema";
import { ActionFactory } from "@/domain/game/action-factory";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { ResearchManager } from "@/engine/politics/research-manager";
import { Nation } from "@/domain/nation/nation.schema";

interface MilitaryTechUpgradeCardProps {
  nationId: string;
  treasury?: number;
  techLevel?: number;
}

export function MilitaryTechUpgradeCard({
  nationId,
  treasury = 100000,
  techLevel = 1,
}: MilitaryTechUpgradeCardProps) {
  const { dispatchAction } = useGameActions();
  const [isSubmittingTech, setIsSubmittingTech] = useState(false);

  const currentNationObj = {
    id: nationId,
    treasury,
    military: { techLevel } as MilitaryStack,
  } as Nation;

  const researchCost = ResearchManager.getMilitaryTechCost(currentNationObj);
  const canAffordTech = treasury >= researchCost;

  const handleInvestTech = async () => {
    if (!canAffordTech || isSubmittingTech) return;
    try {
      setIsSubmittingTech(true);
      const action = ActionFactory.investResearch(nationId);
      await dispatchAction(
        action,
        `سطح فناوری نظامی به سطح ${techLevel + 1} ارتقا یافت (+۵۰٪ قدرت نبرد یگان‌ها).`,
      );
    } finally {
      setIsSubmittingTech(false);
    }
  };

  return (
    <div className="space-y-2.5 dir-rtl text-right font-sans">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Award size={14} className="text-amber-500" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
            تحقیقات و فناوری نظامی
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30 px-2.5 py-0.5 rounded-md flex items-center gap-1">
          <Sparkles size={10} />
          سطح {PersianNumberFormatter.toPersianDigits(techLevel)}
        </span>
      </div>

      <div className="bg-background/40 border border-border/60 p-3.5 rounded-2xl space-y-3 shadow-sm">
        <div className="flex items-center justify-between text-xs pb-2.5 border-b border-border/50 font-mono">
          <span className="text-muted-foreground font-sans font-bold text-[11px]">
            هزینه پژوهش سطح{" "}
            {PersianNumberFormatter.toPersianDigits(techLevel + 1)}:
          </span>
          <span
            className={`font-extrabold text-xs ${
              canAffordTech ? "text-amber-500" : "text-military"
            }`}
          >
            {PersianNumberFormatter.formatCurrency(researchCost, true)}
          </span>
        </div>

        <div className="bg-secondary/40 border border-border/50 p-2.5 rounded-xl text-[10px] text-muted-foreground font-sans leading-relaxed">
          ارتقای سطح فناوری به افزایش ۵۰٪ قدرت نبرد تمامی یگان‌ها و امکان ساخت
          تجهیزات پیشرفته‌تر (زرهی، پدافند موشکی، جنگنده‌ها و ناوگان) می‌انجامد.
        </div>

        <button
          onClick={handleInvestTech}
          disabled={!canAffordTech || isSubmittingTech}
          className="w-full py-3 bg-amber-500 hover:bg-amber-500/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
        >
          {isSubmittingTech ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Zap size={14} />
          )}
          <span>
            {isSubmittingTech
              ? "در حال اجرای تحقیقات دفاعی..."
              : canAffordTech
                ? `ارتقا به سطح فناوری ${PersianNumberFormatter.toPersianDigits(techLevel + 1)}`
                : "موجودی خزانه ناکافی جهت R&D"}
          </span>
        </button>
      </div>
    </div>
  );
}
