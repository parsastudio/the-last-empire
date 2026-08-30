"use client";

import React, { useState } from "react";
import { Hammer, Factory, AlertCircle, Loader2 } from "lucide-react";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { ActionFactory } from "@/domain/game/action-factory";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { IndustryCalculator } from "@/domain/economy/industry-calculator.utility";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface RebuildFactoriesModalProps {
  isOpen: boolean;
  nation: Nation;
  provincesMap?: Record<string, Province>;
  onClose: () => void;
}

export function RebuildFactoriesModal({
  isOpen,
  nation,
  provincesMap,
  onClose,
}: RebuildFactoriesModalProps) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { dispatchAction } = useGameActions();

  const damagedProvinces = Object.values(provincesMap || {}).filter(
    (p) => p.ownerNationId === nation.id && p.maxSlots > p.factoriesCount,
  );

  const cost = IndustryCalculator.FACTORY_REBUILD_COST;
  const canAfford = nation.treasury >= cost;

  const handleRebuild = async (provinceId: number) => {
    if (!canAfford || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const action = ActionFactory.buildFactory(nation.id, provinceId);
      await dispatchAction(
        action,
        "۱ کارخانه در اسلات خالی استان با موفقیت بازسازی شد.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title="کارگاه بازسازی و احیای کارخانجات تخریب‌شده"
      maxWidthClass="max-w-md"
      onClose={onClose}
    >
      <div className="space-y-3.5 font-sans text-right dir-rtl">
        {damagedProvinces.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground text-xs space-y-2 bg-secondary/30 rounded-2xl border border-border/50">
            <Factory size={24} className="mx-auto text-gdp" />
            <p>
              تمامی اسلات‌های صنعتی کشور فعال بوده و هیچ کارخانه تخریب‌شده‌ای
              وجود ندارد.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {damagedProvinces.map((prov) => {
              const emptySlots = prov.maxSlots - prov.factoriesCount;
              return (
                <div
                  key={prov.provinceId}
                  className="bg-secondary/40 border border-border/60 p-3 rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-foreground block">
                      {prov.nameFa}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {PersianNumberFormatter.toPersianDigits(emptySlots)} اسلات
                      تخریب‌شده (خالی)
                    </span>
                  </div>

                  <button
                    onClick={() => handleRebuild(prov.provinceId)}
                    disabled={!canAfford || isSubmitting}
                    className="py-1.5 px-3 bg-gdp hover:bg-gdp/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    {isSubmitting ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Hammer size={12} />
                    )}
                    <span>احیا (۱ میلیارد)</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </UnifiedModalShell>
  );
}
