import React from "react";
import { Clock, Coins, Users, Wrench, Zap } from "lucide-react";
import { UnitConfig } from "./recruitable-units.config";

interface UnitRecruitmentCardProps {
  unit: UnitConfig;
  quantity: number;
  maxAffordable: number;
  onQuantitySet: (type: string, amount: number) => void;
  onRecruit: (unit: UnitConfig) => void;
}

export function UnitRecruitmentCard({
  unit,
  quantity,
  maxAffordable,
  onQuantitySet,
  onRecruit,
}: UnitRecruitmentCardProps) {
  const Icon = unit.icon;
  const totalMoney = unit.moneyCost * quantity;
  const totalManpower = unit.manpowerCost * quantity;
  const totalSteel = unit.steelCost * quantity;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) {
      onQuantitySet(unit.type, 0);
      return;
    }
    const clamped = Math.max(0, Math.min(maxAffordable, val));
    onQuantitySet(unit.type, clamped);
  };

  const handlePercentageSelect = (percentage: number) => {
    const target = Math.floor(maxAffordable * percentage);
    onQuantitySet(unit.type, target);
  };

  return (
    <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3.5 text-right dir-rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={16} className={unit.color} />
          <span className="text-xs font-bold text-foreground">{unit.name}</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-lg">
          <Clock size={11} className="text-treasury" />
          <span>{unit.buildTurns} نوبت ساخت</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
        <div className="bg-secondary/40 p-2 rounded-xl flex items-center gap-1 text-muted-foreground">
          <Coins size={11} className="text-gdp" />
          <span>هزینه: ${totalMoney.toLocaleString("fa-IR")}</span>
        </div>
        <div className="bg-secondary/40 p-2 rounded-xl flex items-center gap-1 text-muted-foreground">
          <Users size={11} className="text-primary" />
          <span>نیروی انسانی: {totalManpower.toLocaleString("fa-IR")}</span>
        </div>
        <div className="bg-secondary/40 p-2 rounded-xl flex items-center gap-1 text-muted-foreground">
          <Wrench size={11} className="text-treasury" />
          <span>فولاد: {totalSteel.toLocaleString("fa-IR")} تن</span>
        </div>
      </div>

      <div className="space-y-2 pt-1 border-t border-border/40">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-muted-foreground font-sans">
            حداکثر ظرفیت ساخت با منابع فعلی:
          </span>
          <span className="font-bold text-gdp">
            {maxAffordable.toLocaleString("fa-IR")} یگان
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={maxAffordable}
            disabled={maxAffordable === 0}
            value={quantity}
            onChange={(e) => onQuantitySet(unit.type, Number(e.target.value))}
            className="flex-1 accent-emerald-600 cursor-pointer h-2 bg-secondary rounded-lg disabled:opacity-30"
          />

          <div className="flex items-center gap-1 font-mono">
            <button
              type="button"
              disabled={quantity <= 0}
              onClick={() =>
                onQuantitySet(unit.type, Math.max(0, quantity - 1))
              }
              className="w-7 h-7 bg-secondary hover:bg-secondary/80 disabled:opacity-30 rounded-lg flex items-center justify-center font-bold text-xs text-foreground cursor-pointer shrink-0"
            >
              -
            </button>
            <input
              type="number"
              min={0}
              max={maxAffordable}
              value={quantity}
              onChange={handleInputChange}
              className="w-14 bg-secondary/80 border border-border/80 rounded-lg py-1 px-1 text-center font-bold text-xs text-foreground font-mono focus:outline-none focus:border-primary"
            />
            <button
              type="button"
              disabled={quantity >= maxAffordable}
              onClick={() =>
                onQuantitySet(unit.type, Math.min(maxAffordable, quantity + 1))
              }
              className="w-7 h-7 bg-secondary hover:bg-secondary/80 disabled:opacity-30 rounded-lg flex items-center justify-center font-bold text-xs text-foreground cursor-pointer shrink-0"
            >
              +
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5 pt-1">
          <button
            type="button"
            disabled={maxAffordable === 0}
            onClick={() => handlePercentageSelect(0.25)}
            className="py-1 rounded-lg bg-secondary/60 hover:bg-secondary border border-border/40 text-[9px] font-mono font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer disabled:opacity-30"
          >
            ۲۵٪
          </button>
          <button
            type="button"
            disabled={maxAffordable === 0}
            onClick={() => handlePercentageSelect(0.5)}
            className="py-1 rounded-lg bg-secondary/60 hover:bg-secondary border border-border/40 text-[9px] font-mono font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer disabled:opacity-30"
          >
            ۵۰٪
          </button>
          <button
            type="button"
            disabled={maxAffordable === 0}
            onClick={() => handlePercentageSelect(0.75)}
            className="py-1 rounded-lg bg-secondary/60 hover:bg-secondary border border-border/40 text-[9px] font-mono font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer disabled:opacity-30"
          >
            ۷۵٪
          </button>
          <button
            type="button"
            disabled={maxAffordable === 0}
            onClick={() => handlePercentageSelect(1.0)}
            className="py-1 rounded-lg bg-gdp/20 hover:bg-gdp/30 border border-gdp/40 text-[9px] font-mono font-bold text-gdp transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-30"
          >
            <Zap size={10} />
            <span>۱۰۰٪ (حداکثر)</span>
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onRecruit(unit)}
        disabled={quantity <= 0 || maxAffordable === 0}
        className="w-full py-2.5 bg-military hover:bg-military/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
      >
        {quantity > 0
          ? `ثبت سفارش ساخت ${quantity.toLocaleString("fa-IR")} یگان ${unit.name}`
          : maxAffordable === 0
            ? "منابع ناکافی جهت ساخت این یگان"
            : "تعداد سفارش را تعیین کنید"}
      </button>
    </div>
  );
}
