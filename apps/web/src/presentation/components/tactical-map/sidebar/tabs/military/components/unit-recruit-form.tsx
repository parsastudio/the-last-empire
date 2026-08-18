import React, { useState } from "react";
import { Zap, Clock, Coins, ShieldAlert } from "lucide-react";
import { PercentageSelector } from "@/presentation/components/common/percentage-selector";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { UnitConfig } from "@/presentation/components/tactical-map/sidebar/tabs/military/unit-recruitment-card";
import { useUnitRecruitmentCalculator } from "@/presentation/components/tactical-map/sidebar/tabs/military/hooks/use-unit-recruitment-calculator";

interface UnitRecruitFormProps {
  unit: UnitConfig;
  treasury: number;
  techLevel?: number;
  industrialLevel?: number;
  onClose: () => void;
  onConfirm: (unit: UnitConfig, quantity: number) => Promise<void> | void;
}

export function UnitRecruitForm({
  unit,
  treasury,
  techLevel = 1,
  industrialLevel = 1,
  onClose,
  onConfirm,
}: UnitRecruitFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const calc = useUnitRecruitmentCalculator({
    unit,
    treasury,
    techLevel,
    industrialLevel,
  });

  const Icon = unit.icon;

  const handleExecute = async () => {
    if (calc.quantity <= 0 || calc.maxAffordable === 0 || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await onConfirm(unit, calc.quantity);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 text-right dir-rtl font-sans">
      <div className="bg-secondary/40 border border-border/70 p-3.5 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2.5 rounded-xl bg-background/60 border border-border/60 ${unit.color}`}
          >
            <Icon size={20} />
          </div>
          <div>
            <span className="text-xs font-bold text-foreground block">
              {unit.name}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              قیمت واحد:{" "}
              {PersianNumberFormatter.formatCurrency(calc.unitUnitPrice)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 font-mono text-[10px] bg-secondary/80 px-2.5 py-1 rounded-xl text-treasury border border-border/50">
          <Clock size={12} />
          <span>
            {PersianNumberFormatter.toPersianDigits(unit.buildTurns)} نوبت ساخت
          </span>
        </div>
      </div>

      <div className="space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground font-sans text-[11px]">
            حداکثر ظرفیت ساخت با بودجه فعلی:
          </span>
          <span className="font-bold text-gdp text-xs">
            {PersianNumberFormatter.toPersianDigits(
              calc.maxAffordable.toLocaleString("en-US"),
            )}{" "}
            یگان
          </span>
        </div>

        <div className="space-y-2 bg-background/40 p-3.5 rounded-2xl border border-border/60">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground font-sans">
              تعداد درخواستی:
            </span>
            <span className="font-bold text-foreground text-sm">
              {PersianNumberFormatter.toPersianDigits(
                calc.quantity.toLocaleString("en-US"),
              )}{" "}
              یگان
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={calc.maxAffordable}
              disabled={calc.maxAffordable === 0}
              value={calc.quantity}
              onChange={(e) => calc.setClampedQuantity(Number(e.target.value))}
              className="flex-1 accent-emerald-600 cursor-pointer h-2 bg-secondary rounded-lg disabled:opacity-30"
            />

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={calc.quantity <= 0}
                onClick={() => calc.setClampedQuantity(calc.quantity - 1)}
                className="w-7 h-7 bg-secondary hover:bg-secondary/80 disabled:opacity-30 rounded-lg flex items-center justify-center font-bold text-xs text-foreground cursor-pointer shrink-0"
              >
                -
              </button>
              <input
                type="number"
                min={0}
                max={calc.maxAffordable}
                value={calc.quantity}
                onChange={calc.handleInputChange}
                className="w-14 bg-secondary/80 border border-border/80 rounded-lg py-1 px-1 text-center font-bold text-xs text-foreground focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                disabled={calc.quantity >= calc.maxAffordable}
                onClick={() => calc.setClampedQuantity(calc.quantity + 1)}
                className="w-7 h-7 bg-secondary hover:bg-secondary/80 disabled:opacity-30 rounded-lg flex items-center justify-center font-bold text-xs text-foreground cursor-pointer shrink-0"
              >
                +
              </button>
            </div>
          </div>

          <PercentageSelector
            disabled={calc.maxAffordable === 0}
            onSelect={calc.handlePercentageSelect}
            colorVariant="gdp"
          />
        </div>

        <div className="bg-secondary/40 p-3.5 rounded-2xl space-y-2 text-[11px] border border-border/60 font-sans">
          <div className="flex justify-between items-center font-mono">
            <span className="text-muted-foreground font-sans">
              مبلغ کل سفارش:
            </span>
            <span className="font-extrabold text-gdp text-xs flex items-center gap-1">
              <Coins size={13} />
              {PersianNumberFormatter.formatCurrency(calc.totalMoney)}
            </span>
          </div>

          <div className="flex justify-between items-center font-mono">
            <span className="text-muted-foreground font-sans">
              زمان تحویل نهایی:
            </span>
            <span className="font-bold text-foreground">
              {PersianNumberFormatter.toPersianDigits(unit.buildTurns)} نوبت
              دیگر
            </span>
          </div>
        </div>

        {calc.maxAffordable === 0 && (
          <div className="p-3 bg-military/15 border border-military/30 rounded-xl flex items-center gap-2 text-[10px] text-military font-sans">
            <ShieldAlert size={14} className="shrink-0" />
            <span>
              موجودی خزانه برای ساخت حتی ۱ یگان از این تجهیزات کافی نیست.
            </span>
          </div>
        )}
      </div>

      <button
        onClick={handleExecute}
        disabled={
          calc.quantity <= 0 || calc.maxAffordable === 0 || isSubmitting
        }
        className="w-full py-3.5 bg-gdp hover:bg-gdp/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded-2xl font-bold text-xs transition-all cursor-pointer shadow-lg shadow-gdp/20 flex items-center justify-center gap-2"
      >
        <Zap size={15} />
        <span>
          {isSubmitting
            ? "در حال ثبت سفارش ساخت..."
            : calc.quantity <= 0
              ? "تعداد سفارش را مشخص فرمایید"
              : `تایید و سفارش ساخت ${PersianNumberFormatter.toPersianDigits(calc.quantity.toLocaleString("en-US"))} یگان (${PersianNumberFormatter.formatCurrency(calc.totalMoney)})`}
        </span>
      </button>
    </div>
  );
}
