"use client";

import React, { useState, useMemo } from "react";
import {
  ShoppingCart,
  Building2,
  TrendingUp,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { Nation } from "@/domain/nation/nation.schema";
import { ActionFactory } from "@/domain/game/action-factory";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { IndustryCalculator } from "@/domain/economy/industry-calculator.utility";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";

interface BuyEquipmentModalProps {
  isOpen: boolean;
  buyerNation: Nation;
  allNations?: Record<string, Nation>;
  totalBuyerFactories: number;
  onClose: () => void;
}

export function BuyEquipmentModal({
  isOpen,
  buyerNation,
  allNations,
  totalBuyerFactories,
  onClose,
}: BuyEquipmentModalProps) {
  const [selectedSellerId, setSelectedSellerId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { dispatchAction } = useGameActions();

  const eligibleSellers = useMemo(() => {
    if (!allNations) return [];
    return Object.values(allNations).filter((seller) => {
      if (!seller.isAlive || seller.id === buyerNation.id) return false;
      const rel = buyerNation.relations[seller.id];
      if (rel?.stance === "WAR" || (rel?.tension ?? 10) >= 50) return false;
      return seller.industrialLevel > buyerNation.equipmentTechLevel;
    });
  }, [allNations, buyerNation]);

  const activeSeller = useMemo(() => {
    return (
      eligibleSellers.find((s) => s.id === selectedSellerId) ||
      eligibleSellers[0]
    );
  }, [eligibleSellers, selectedSellerId]);

  const pricePerUnit = useMemo(() => {
    if (!activeSeller) return 0;
    return IndustryCalculator.calculateEquipmentImportPrice(
      activeSeller.industrialLevel,
      buyerNation.equipmentTechLevel,
    );
  }, [activeSeller, buyerNation]);

  const totalCost = quantity * pricePerUnit;
  const canAfford = buyerNation.treasury >= totalCost;

  const previewNewTech = useMemo(() => {
    if (!activeSeller || totalBuyerFactories <= 0)
      return buyerNation.equipmentTechLevel;
    return IndustryCalculator.calculateNewEquipmentTechLevel(
      totalBuyerFactories,
      buyerNation.equipmentTechLevel,
      quantity,
      activeSeller.industrialLevel,
    );
  }, [activeSeller, buyerNation, quantity, totalBuyerFactories]);

  const handleExecuteImport = async () => {
    if (!activeSeller || !canAfford || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const action = ActionFactory.buyIndustrialEquipment(
        buyerNation.id,
        activeSeller.id,
        quantity,
      );
      const res = await dispatchAction(
        action,
        `واردات ${quantity} سوله ابزارآلات صنعتی از ${activeSeller.name} با موفقیت انجام شد.`,
      );
      if (res.success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title="بازار جهانی ابزارآلات و فناوری صنعتی"
      maxWidthClass="max-w-xl"
      onClose={onClose}
    >
      <div className="space-y-4 font-sans text-right dir-rtl">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground block">
            انتخاب کشور صادرکننده ابزارآلات:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
            {eligibleSellers.map((seller) => (
              <button
                key={seller.id}
                type="button"
                onClick={() => setSelectedSellerId(seller.id)}
                className={`p-2.5 rounded-xl border text-right transition-all flex items-center justify-between gap-2 cursor-pointer ${
                  activeSeller?.id === seller.id
                    ? "bg-primary/15 border-primary text-foreground shadow-sm"
                    : "bg-secondary/40 border-border/60 hover:bg-secondary text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">
                    {getFlagEmoji(seller.flagCode)}
                  </span>
                  <span className="text-xs font-bold">{seller.name}</span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-background/80 px-2 py-0.5 rounded-md text-gdp">
                  لول{" "}
                  {PersianNumberFormatter.toPersianDigits(
                    seller.industrialLevel.toFixed(1),
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>

        {activeSeller && (
          <div className="bg-secondary/40 border border-border/60 p-3.5 rounded-2xl space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-border/50">
              <span className="text-muted-foreground font-sans text-[11px]">
                تعداد کارخانجات تحت پوشش نوسازی:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={1}
                  max={Math.max(1, totalBuyerFactories)}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-32 accent-gdp"
                />
                <span className="font-bold text-foreground font-sans">
                  {PersianNumberFormatter.formatNumberWithCommas(quantity)} سوله
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-background/60 p-2.5 rounded-xl border border-border/40 space-y-1">
                <span className="text-[10px] text-muted-foreground font-sans block">
                  میانگین جدید تجهیزات:
                </span>
                <span className="text-sm font-bold text-gdp">
                  لِوِل{" "}
                  {PersianNumberFormatter.toPersianDigits(
                    previewNewTech.toFixed(2),
                  )}
                </span>
              </div>
              <div className="bg-background/60 p-2.5 rounded-xl border border-border/40 space-y-1">
                <span className="text-[10px] text-muted-foreground font-sans block">
                  صورت‌حساب کل واردات:
                </span>
                <span
                  className={`text-sm font-bold ${canAfford ? "text-gdp" : "text-military"}`}
                >
                  {PersianNumberFormatter.formatCurrency(totalCost)}
                </span>
              </div>
            </div>

            <button
              onClick={handleExecuteImport}
              disabled={!canAfford || isSubmitting}
              className="w-full py-3 bg-gdp hover:bg-gdp/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-gdp/20"
            >
              {isSubmitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <ShoppingCart size={14} />
              )}
              <span>
                {canAfford
                  ? `ثبت سفارش و واریز وجه به خزانه‌داری ${activeSeller.name}`
                  : "موجودی خزانه ناکافی"}
              </span>
            </button>
          </div>
        )}
      </div>
    </UnifiedModalShell>
  );
}
