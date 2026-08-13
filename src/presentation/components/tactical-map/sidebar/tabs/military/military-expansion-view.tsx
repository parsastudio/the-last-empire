import React, { useState } from "react";
import { Swords, Award, Zap, Loader2 } from "lucide-react";
import {
  RECRUITABLE_UNITS,
  UnitConfig,
  UnitRecruitmentCard,
} from "@/presentation/components/tactical-map/sidebar/tabs/military/unit-recruitment-card";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { UnitType, MilitaryStack } from "@/domain/military/military.schema";
import { ActionFactory } from "@/domain/game/action-factory";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { ResearchManager } from "@/engine/politics/research-manager";
import { Nation } from "@/domain/nation/nation.schema";

interface MilitaryExpansionViewProps {
  nationId: string;
  treasury?: number;
  techLevel?: number;
  industrialLevel?: number;
}

export function MilitaryExpansionView({
  nationId,
  treasury = 100000,
  techLevel = 1,
  industrialLevel = 1,
}: MilitaryExpansionViewProps) {
  const { dispatchAction } = useGameActions();
  const [isSubmittingTech, setIsSubmittingTech] = useState(false);

  const currentNationObj = {
    id: nationId,
    treasury,
    military: { techLevel } as MilitaryStack,
  } as Nation;

  const researchCost = ResearchManager.getMilitaryTechCost(currentNationObj);
  const canAffordTech = treasury >= researchCost;

  const handleRecruit = async (unit: UnitConfig, quantity: number) => {
    if (quantity <= 0) return;

    const action = ActionFactory.recruitUnit(
      nationId,
      unit.type as UnitType,
      quantity,
    );

    await dispatchAction(
      action,
      `سفارش ساخت ${PersianNumberFormatter.toPersianDigits(quantity.toLocaleString("en-US"))} یگان ${unit.name} در صف قرار گرفت.`,
    );
  };

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
    <div className="space-y-4 animate-in fade-in duration-200 dir-rtl text-right">
      <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 font-sans font-bold text-foreground">
            <Award size={15} className="text-amber-500" />
            <span>
              ارتقای سطح فناوری نظامی (سطح فعلی:{" "}
              {PersianNumberFormatter.toPersianDigits(techLevel)})
            </span>
          </div>
          <span className="font-bold text-amber-500 text-xs">
            {PersianNumberFormatter.formatCurrency(researchCost, true)}
          </span>
        </div>

        <p className="text-[10px] text-muted-foreground font-sans leading-relaxed">
          هر لِوِل ارتقای فناوری، ۵۰٪ قدرت نبرد تمام یگان‌ها را افزایش می‌دهد و
          امکان تولید تسلیحات سنگین‌تر مانند تانک، پدافند، جنگنده و ناوگان
          دریایی را فراهم می‌سازد.
        </p>

        <button
          onClick={handleInvestTech}
          disabled={!canAffordTech || isSubmittingTech}
          className="w-full py-2.5 bg-amber-500 hover:bg-amber-500/90 disabled:opacity-40 text-primary-foreground rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
        >
          {isSubmittingTech ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Zap size={14} />
          )}
          <span>
            {canAffordTech
              ? `ارتقا به سطح فناوری ${PersianNumberFormatter.toPersianDigits(techLevel + 1)}`
              : "موجودی خزانه ناکافی جهت R&D"}
          </span>
        </button>
      </div>

      <div className="flex items-center gap-2 px-1">
        <Swords size={13} className="text-military" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          گسترش و استخدام نیروی نظامی داخلی
        </span>
      </div>

      <div className="space-y-3">
        {RECRUITABLE_UNITS.map((unit) => (
          <UnitRecruitmentCard
            key={unit.type}
            unit={unit}
            treasury={treasury}
            techLevel={techLevel}
            industrialLevel={industrialLevel}
            onRecruit={handleRecruit}
          />
        ))}
      </div>
    </div>
  );
}
