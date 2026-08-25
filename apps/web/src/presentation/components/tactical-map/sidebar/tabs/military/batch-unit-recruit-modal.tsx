"use client";

import React from "react";
import { Coins, Zap, RotateCcw, Wallet, Building2 } from "lucide-react";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { useBatchRecruitment } from "./hooks/use-batch-recruitment";
import { BatchUnitRow } from "./components/batch-unit-row";

interface BatchUnitRecruitModalProps {
  isOpen: boolean;
  nationId: string;
  treasury: number;
  techLevel?: number;
  industrialLevel?: number;
  onClose: () => void;
}

export function BatchUnitRecruitModal({
  isOpen,
  nationId,
  treasury,
  techLevel = 1,
  industrialLevel = 1,
  onClose,
}: BatchUnitRecruitModalProps) {
  const {
    unitConfigs,
    quantities,
    totalCost,
    remainingTreasury,
    isSubmitting,
    handleQuantityChange,
    handleResetAll,
    handleBatchSubmit,
    getOtherUnitsCost,
  } = useBatchRecruitment({
    nationId,
    treasury,
    techLevel,
    industrialLevel,
    onClose,
  });

  if (!isOpen) return null;

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title="ستاد ساخت و تجهیز تسلیحات نظامی"
      subtitle="تخصیص بودجه با گام‌های ۱۰٪ خزانه و سفارش همزمان نیروهای زمینی، هوایی، موشکی و دریایی"
      maxWidthClass="max-w-3xl"
      onClose={onClose}
    >
      <div className="space-y-4 text-right dir-rtl font-sans pb-1">
        <div className="grid grid-cols-3 gap-2.5 font-mono text-xs">
          <div className="bg-secondary/40 border border-border/60 p-3 rounded-2xl space-y-1">
            <span className="text-[10px] text-muted-foreground font-sans flex items-center gap-1 font-bold">
              <Wallet size={12} className="text-primary" />
              موجودی خزانه ملی:
            </span>
            <span className="text-xs font-black text-foreground block truncate">
              {PersianNumberFormatter.formatCurrency(treasury)}
            </span>
          </div>

          <div className="bg-secondary/40 border border-border/60 p-3 rounded-2xl space-y-1">
            <span className="text-[10px] text-muted-foreground font-sans flex items-center gap-1 font-bold">
              <Coins size={12} className="text-gdp" />
              مجموع فاکتور ساخت:
            </span>
            <span className="text-xs font-black text-gdp block truncate">
              {PersianNumberFormatter.formatCurrency(totalCost)}
            </span>
          </div>

          <div className="bg-secondary/40 border border-border/60 p-3 rounded-2xl space-y-1">
            <span className="text-[10px] text-muted-foreground font-sans flex items-center gap-1 font-bold">
              <Building2 size={12} className="text-treasury" />
              باقی‌مانده خزانه:
            </span>
            <span className="text-xs font-black text-foreground block truncate">
              {PersianNumberFormatter.formatCurrency(remainingTreasury)}
            </span>
          </div>
        </div>

        <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1 scrollbar-thin">
          {unitConfigs.map((config) => {
            const otherCost = getOtherUnitsCost(config.type);
            const budgetLeft = Math.max(0, treasury - otherCost);
            const maxAffordable = Math.floor(budgetLeft / config.unitPrice);

            return (
              <BatchUnitRow
                key={config.type}
                stat={config.stat}
                unitPrice={config.unitPrice}
                isUnlocked={config.isUnlocked}
                quantity={quantities[config.type] || 0}
                maxAffordable={maxAffordable}
                totalTreasury={treasury}
                onQuantityChange={(qty) =>
                  handleQuantityChange(config.type, qty)
                }
              />
            );
          })}
        </div>

        <div className="pt-2 border-t border-border/50 flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetAll}
            disabled={totalCost === 0 || isSubmitting}
            className="p-3 bg-secondary hover:bg-secondary/80 disabled:opacity-30 rounded-2xl border border-border text-muted-foreground hover:text-foreground transition-all cursor-pointer flex items-center justify-center shrink-0"
            title="صفر کردن مقادیر"
          >
            <RotateCcw size={16} />
          </button>

          <button
            type="button"
            onClick={handleBatchSubmit}
            disabled={totalCost <= 0 || totalCost > treasury || isSubmitting}
            className="flex-1 py-4 bg-gdp hover:bg-gdp/90 disabled:bg-secondary disabled:text-muted-foreground disabled:opacity-50 text-primary-foreground rounded-2xl font-black text-xs transition-all cursor-pointer shadow-xl shadow-gdp/20 flex items-center justify-center gap-2 border border-gdp/30"
          >
            <Zap size={16} />
            <span>
              {isSubmitting
                ? "در حال ثبت سفارش‌ها در صف ساخت..."
                : totalCost <= 0
                  ? "تعداد یگان‌های مورد نیاز را تعیین فرمایید"
                  : `تایید و سفارش ساخت جامع (${PersianNumberFormatter.formatCurrency(totalCost)})`}
            </span>
          </button>
        </div>
      </div>
    </UnifiedModalShell>
  );
}
