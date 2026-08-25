import React from "react";
import {
  Shield,
  ShieldAlert,
  Crosshair,
  Plane,
  Radio,
  Anchor,
  Clock,
  Lock,
  LucideIcon,
} from "lucide-react";
import { MilitaryUnitStat, UnitType } from "@geopolitics/domain";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface BatchUnitRowProps {
  stat: MilitaryUnitStat;
  unitPrice: number;
  isUnlocked: boolean;
  quantity: number;
  step: number;
  maxAffordable: number;
  onQuantityChange: (qty: number) => void;
}

const UNIT_ICONS: Record<UnitType, { icon: LucideIcon; color: string }> = {
  INFANTRY: { icon: Shield, color: "text-primary" },
  DRONE_MISSILE: { icon: Radio, color: "text-treasury" },
  ARMOR: { icon: ShieldAlert, color: "text-military" },
  AIR_DEFENSE: { icon: Crosshair, color: "text-diplomacy" },
  AIR_FORCE: { icon: Plane, color: "text-gdp" },
  NAVAL_FLEET: { icon: Anchor, color: "text-primary" },
};

export function BatchUnitRow({
  stat,
  unitPrice,
  isUnlocked,
  quantity,
  step,
  maxAffordable,
  onQuantityChange,
}: BatchUnitRowProps) {
  const iconMeta = UNIT_ICONS[stat.type];
  const Icon = iconMeta.icon;
  const currentCost = quantity * unitPrice;

  return (
    <div
      className={`p-3.5 rounded-2xl border transition-all ${
        !isUnlocked
          ? "bg-secondary/20 border-border/40 opacity-50"
          : quantity > 0
            ? "bg-secondary/60 border-primary/50 shadow-md"
            : "bg-background/40 border-border/60 hover:border-border"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl bg-secondary/80 flex items-center justify-center shrink-0 border border-border/50 ${iconMeta.color}`}
          >
            <Icon size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-foreground">
                {stat.nameFa}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                {PersianNumberFormatter.formatCurrency(unitPrice)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono mt-0.5">
              <span className="flex items-center gap-0.5">
                <Clock size={10} className="text-treasury" />
                {PersianNumberFormatter.toPersianDigits(stat.buildTurns)} نوبت
                ساخت
              </span>
              {!isUnlocked && (
                <span className="flex items-center gap-0.5 text-amber-500 font-bold font-sans">
                  <Lock size={10} />
                  نیازمند فناوری سطح{" "}
                  {PersianNumberFormatter.toPersianDigits(
                    stat.requiredTechLevel,
                  )}
                </span>
              )}
            </div>
          </div>
        </div>

        {isUnlocked && (
          <div className="flex items-center gap-3 font-mono">
            <div className="text-left space-y-0.5 dir-ltr min-w-[90px]">
              <span className="text-[9px] text-muted-foreground font-sans block text-right">
                مبلغ این یگان:
              </span>
              <span
                className={`text-xs font-bold block text-right truncate ${
                  quantity > 0 ? "text-gdp" : "text-muted-foreground"
                }`}
              >
                {PersianNumberFormatter.formatCurrency(currentCost)}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={quantity <= 0}
                onClick={() => onQuantityChange(Math.max(0, quantity - step))}
                className="w-7 h-7 bg-secondary hover:bg-secondary/80 disabled:opacity-30 rounded-lg flex items-center justify-center font-bold text-xs text-foreground cursor-pointer shrink-0"
              >
                -
              </button>
              <input
                type="number"
                min={0}
                max={maxAffordable}
                value={quantity}
                onChange={(e) =>
                  onQuantityChange(
                    Math.max(
                      0,
                      Math.min(maxAffordable, Number(e.target.value)),
                    ),
                  )
                }
                className="w-14 bg-secondary/80 border border-border/80 rounded-lg py-1 px-1 text-center font-bold text-xs text-foreground font-mono focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                disabled={quantity >= maxAffordable || maxAffordable <= 0}
                onClick={() =>
                  onQuantityChange(Math.min(maxAffordable, quantity + step))
                }
                className="w-7 h-7 bg-secondary hover:bg-secondary/80 disabled:opacity-30 rounded-lg flex items-center justify-center font-bold text-xs text-foreground cursor-pointer shrink-0"
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>

      {isUnlocked && (
        <div className="pt-2.5 mt-2 border-t border-border/40 flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={Math.max(0, maxAffordable)}
            step={step}
            disabled={maxAffordable <= 0}
            value={quantity}
            onChange={(e) => onQuantityChange(Number(e.target.value))}
            className="flex-1 accent-emerald-600 cursor-pointer h-2 bg-secondary rounded-lg disabled:opacity-30"
          />
          <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap">
            گام: {PersianNumberFormatter.toPersianDigits(step)} یگان
          </span>
        </div>
      )}
    </div>
  );
}
