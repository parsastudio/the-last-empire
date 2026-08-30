import React, { useState } from "react";
import {
  Factory,
  Cpu,
  Hammer,
  TrendingUp,
  Loader2,
  Sparkles,
  ShoppingCart,
  Wrench,
} from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
import { IndustryCalculator } from "@/domain/economy/industry-calculator.utility";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { BuyEquipmentModal } from "./modals/buy-equipment-modal";
import { RebuildFactoriesModal } from "./modals/rebuild-factories-modal";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";

interface IndustrialManagementCardProps {
  nationId: string;
  treasury: number;
  industrialLevel: number;
  equipmentTechLevel: number;
  nation?: Nation;
  allNations?: Record<string, Nation>;
  provincesMap?: Record<string, Province>;
}

export function IndustrialManagementCard({
  nationId,
  treasury,
  industrialLevel,
  equipmentTechLevel,
  nation,
  allNations,
  provincesMap,
}: IndustrialManagementCardProps) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isRebuildModalOpen, setIsRebuildModalOpen] = useState<boolean>(false);
  const { dispatchAction } = useGameActions();

  const researchCost =
    IndustryCalculator.calculateResearchStepCost(industrialLevel);
  const canAffordResearch = treasury >= researchCost;
  const canModernize = equipmentTechLevel < industrialLevel;

  let totalActiveFactories = 0;
  if (provincesMap) {
    for (const p of Object.values(provincesMap)) {
      if (p.ownerNationId === nationId) {
        totalActiveFactories += p.factoriesCount;
      }
    }
  }

  const handleInvestResearch = async () => {
    if (isSubmitting || !canAffordResearch) return;
    setIsSubmitting(true);
    try {
      const action = ActionFactory.investIndustrialResearch(nationId);
      await dispatchAction(
        action,
        "پژوهش صنعتی با موفقیت اجرا و لول صنعتی ارتقا یافت.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEquipDomestic = async () => {
    if (isSubmitting || !canModernize) return;
    setIsSubmitting(true);
    try {
      const action = ActionFactory.equipDomesticMachinery(nationId);
      await dispatchAction(
        action,
        "خطوط تولید کارخانجات به آخرین فناوری بومی کشور مجهز گردیدند.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-3 dir-rtl text-right font-sans">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Factory size={15} className="text-gdp" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
              صنایع، ابزارآلات و فناوری تولید
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/30 px-2 py-0.5 rounded-md">
              دانش بومی:{" "}
              {PersianNumberFormatter.toPersianDigits(
                industrialLevel.toFixed(1),
              )}
            </span>
            <span className="text-[10px] font-mono font-bold bg-gdp/10 text-gdp border border-gdp/30 px-2 py-0.5 rounded-md">
              ابزارآلات:{" "}
              {PersianNumberFormatter.toPersianDigits(
                equipmentTechLevel.toFixed(1),
              )}
            </span>
          </div>
        </div>

        <div className="bg-background/40 border border-border/60 p-3.5 rounded-2xl space-y-2.5 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="bg-secondary/40 border border-border/50 p-2.5 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground font-sans">
                <span className="flex items-center gap-1 font-bold">
                  <Cpu size={12} className="text-primary" />
                  <span>پژوهش صنعتی (+۰.۱)</span>
                </span>
                <span className="text-gdp font-mono font-bold">
                  {PersianNumberFormatter.formatCurrency(researchCost)}
                </span>
              </div>
              <button
                onClick={handleInvestResearch}
                disabled={!canAffordResearch || isSubmitting}
                className="w-full py-2 bg-primary hover:bg-primary/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                {isSubmitting ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Sparkles size={12} />
                )}
                <span>ارتقای دانش بومی</span>
              </button>
            </div>

            <div className="bg-secondary/40 border border-border/50 p-2.5 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground font-sans">
                <span className="flex items-center gap-1 font-bold">
                  <Hammer size={12} className="text-gdp" />
                  <span>نوسازی خطوط تولید</span>
                </span>
                <span className="text-foreground font-mono font-bold">
                  {canModernize ? "نیازمند ارتقا" : "مجهز به سقف دانش"}
                </span>
              </div>
              <button
                onClick={handleEquipDomestic}
                disabled={!canModernize || isSubmitting}
                className="w-full py-2 bg-gdp hover:bg-gdp/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                {isSubmitting ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <TrendingUp size={12} />
                )}
                <span>نوسازی سراسری کارخانه‌ها</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="py-2.5 px-3 bg-secondary/80 hover:bg-secondary border border-border/70 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 text-foreground"
            >
              <ShoppingCart size={13} className="text-primary" />
              <span>بازار واردات ماشین‌آلات</span>
            </button>

            <button
              onClick={() => setIsRebuildModalOpen(true)}
              className="py-2.5 px-3 bg-secondary/80 hover:bg-secondary border border-border/70 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 text-foreground"
            >
              <Wrench size={13} className="text-gdp" />
              <span>بازسازی کارخانه‌ها</span>
            </button>
          </div>
        </div>
      </div>

      {nation && (
        <>
          <BuyEquipmentModal
            isOpen={isImportModalOpen}
            buyerNation={nation}
            allNations={allNations}
            totalBuyerFactories={totalActiveFactories}
            onClose={() => setIsImportModalOpen(false)}
          />
          <RebuildFactoriesModal
            isOpen={isRebuildModalOpen}
            nation={nation}
            provincesMap={provincesMap}
            onClose={() => setIsRebuildModalOpen(false)}
          />
        </>
      )}
    </>
  );
}
