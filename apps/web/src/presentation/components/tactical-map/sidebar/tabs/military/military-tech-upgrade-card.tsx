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
  techLevel = 1.0,
}: MilitaryTechUpgradeCardProps) {
  const { dispatchAction } = useGameActions();
  const [isSubmittingTech, setIsSubmittingTech] = useState(false);

  const currentNationObj = {
    id: nationId,
    treasury,
    military: { techLevel } as MilitaryStack,
  } as Nation;

  const stepResearchCost =
    ResearchManager.getMilitaryTechCost(currentNationObj);
  const canAffordTech = treasury >= stepResearchCost;

  const nextStepLevel = Number((techLevel + 0.1).toFixed(1));
  const subLevelIndex = Math.round((techLevel - Math.floor(techLevel)) * 10);

  const handleInvestTech = async () => {
    if (!canAffordTech || isSubmittingTech) return;
    try {
      setIsSubmittingTech(true);
      const action = ActionFactory.investResearch(nationId);
      await dispatchAction(action);
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
          سطح {PersianNumberFormatter.toPersianDigits(techLevel.toFixed(1))}
        </span>
      </div>

      <div className="bg-background/40 border border-border/60 p-3.5 rounded-2xl space-y-3 shadow-sm">
        <div className="flex items-center justify-between text-xs pb-2.5 border-b border-border/50 font-mono">
          <span className="text-muted-foreground font-sans font-bold text-[11px]">
            هزینه گام بعدی (+۰.۱):
          </span>
          <span
            className={`font-extrabold text-xs ${
              canAffordTech ? "text-amber-500" : "text-military"
            }`}
          >
            {PersianNumberFormatter.formatCurrency(stepResearchCost, true)}
          </span>
        </div>

        <div className="space-y-1.5 font-mono text-[10px]">
          <div className="flex items-center justify-between text-muted-foreground font-sans">
            <span>پیشرفت تا سطح اصلی بعد:</span>
            <span className="font-bold text-foreground">
              {PersianNumberFormatter.toPersianDigits(subLevelIndex * 10)}٪
            </span>
          </div>
          <div className="grid grid-cols-10 gap-1">
            {Array.from({ length: 10 }).map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx < subLevelIndex
                    ? "bg-amber-400"
                    : "bg-secondary border border-border/40"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-secondary/40 border border-border/50 p-2.5 rounded-xl text-[10px] text-muted-foreground font-sans leading-relaxed">
          هر ارتقای اعشاری (+۰.۱) بلافاصله ۵٪ به قدرت نبرد تمام یگان‌های ارتش
          اضافه می‌کند.
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
                ? `ارتقا به سطح ${PersianNumberFormatter.toPersianDigits(nextStepLevel.toFixed(1))} (+۵٪ قدرت نبرد)`
                : "موجودی خزانه ناکافی جهت R&D"}
          </span>
        </button>
      </div>
    </div>
  );
}
