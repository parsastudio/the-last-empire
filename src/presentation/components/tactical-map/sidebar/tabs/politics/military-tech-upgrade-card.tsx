import React, { useState } from "react";
import { Award, Zap, Loader2 } from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
import { ResearchDevelopmentManager } from "@/engine/military/research-development-manager";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface MilitaryTechUpgradeCardProps {
  currentLevel?: number;
  nationId?: string;
  treasury?: number;
  gdp?: number;
}

export function MilitaryTechUpgradeCard({
  currentLevel = 1,
  nationId = "NATION_118",
  treasury = 100000,
  gdp = 450000000000,
}: MilitaryTechUpgradeCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const manager = new ResearchDevelopmentManager();
  const mockNation = {
    gdp,
    military: { techLevel: currentLevel },
  } as unknown as Parameters<typeof manager.getResearchCost>[0];

  const upgradeCost = manager.getResearchCost(mockNation);
  const canAfford = treasury >= upgradeCost;
  const { dispatchAction } = useGameActions();

  const handleUpgradeTech = async () => {
    if (!canAfford || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const action = ActionFactory.investResearch(nationId);
      await dispatchAction(
        action,
        `پروژه ارتقای فناوری نظامی به سطح ${currentLevel + 1} آغاز گردید.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 px-1">
        <Award size={13} className="text-amber-500" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          فناوری نظامی و تسلیحات
        </span>
      </div>

      <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3 text-right dir-rtl">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">سطح فناوری فعلی:</span>
          <span className="font-mono font-bold text-amber-500">
            سطح {PersianNumberFormatter.toPersianDigits(currentLevel)}
          </span>
        </div>

        <div className="bg-secondary/40 border border-border/40 p-2.5 rounded-xl space-y-1 text-[10px] font-mono">
          <span className="text-muted-foreground block font-sans font-bold">
            سود ارتقا به سطح{" "}
            {PersianNumberFormatter.toPersianDigits(currentLevel + 1)}:
          </span>
          <span className="text-gdp font-bold block font-sans">
            • ۲۰+٪ افزایش قدرت برتر رزمی کل یگان‌های ارتش
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-muted-foreground font-sans">هزینه پژوهش:</span>
          <span className="font-bold text-foreground">
            {PersianNumberFormatter.formatCurrency(upgradeCost)}
          </span>
        </div>

        <button
          onClick={handleUpgradeTech}
          disabled={!canAfford || isSubmitting}
          className="w-full py-2.5 bg-amber-500 hover:bg-amber-500/90 disabled:opacity-40 text-primary-foreground rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
        >
          {isSubmitting ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Zap size={13} />
          )}
          <span>
            {isSubmitting
              ? "در حال ثبت ارتقا..."
              : canAfford
                ? `ارتقای فناوری نظامی (${PersianNumberFormatter.formatCurrency(upgradeCost)})`
                : "خزانه ناکافی جهت ارتقای فناوری نظامی"}
          </span>
        </button>
      </div>
    </div>
  );
}
