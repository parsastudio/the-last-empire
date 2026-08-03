import React from "react";
import {
  Clock,
  Coins,
  Users,
  Wrench,
  Shield,
  Plane,
  Radio,
  LucideIcon,
} from "lucide-react";
import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";
import { useUnitRecruitmentCalculator } from "@/presentation/components/tactical-map/sidebar/tabs/military/hooks/use-unit-recruitment-calculator";
import { PercentageSelector } from "@/presentation/components/common/percentage-selector";

export interface UnitConfig {
  type: string;
  name: string;
  moneyCost: number;
  manpowerCost: number;
  steelCost: number;
  buildTurns: number;
  icon: LucideIcon;
  color: string;
}

export const RECRUITABLE_UNITS: UnitConfig[] = [
  {
    type: MILITARY_UNIT_STATS.INFANTRY.type,
    name: MILITARY_UNIT_STATS.INFANTRY.nameFa,
    moneyCost: MILITARY_UNIT_STATS.INFANTRY.moneyCost,
    manpowerCost: MILITARY_UNIT_STATS.INFANTRY.manpowerCost,
    steelCost: MILITARY_UNIT_STATS.INFANTRY.steelCost,
    buildTurns: MILITARY_UNIT_STATS.INFANTRY.buildTurns,
    icon: Shield,
    color: "text-primary",
  },
  {
    type: MILITARY_UNIT_STATS.AIR_FORCE.type,
    name: MILITARY_UNIT_STATS.AIR_FORCE.nameFa,
    moneyCost: MILITARY_UNIT_STATS.AIR_FORCE.moneyCost,
    manpowerCost: MILITARY_UNIT_STATS.AIR_FORCE.manpowerCost,
    steelCost: MILITARY_UNIT_STATS.AIR_FORCE.steelCost,
    buildTurns: MILITARY_UNIT_STATS.AIR_FORCE.buildTurns,
    icon: Plane,
    color: "text-gdp",
  },
  {
    type: MILITARY_UNIT_STATS.DRONE_MISSILE.type,
    name: MILITARY_UNIT_STATS.DRONE_MISSILE.nameFa,
    moneyCost: MILITARY_UNIT_STATS.DRONE_MISSILE.moneyCost,
    manpowerCost: MILITARY_UNIT_STATS.DRONE_MISSILE.manpowerCost,
    steelCost: MILITARY_UNIT_STATS.DRONE_MISSILE.steelCost,
    buildTurns: MILITARY_UNIT_STATS.DRONE_MISSILE.buildTurns,
    icon: Radio,
    color: "text-treasury",
  },
];

interface UnitRecruitmentCardProps {
  unit: UnitConfig;
  treasury: number;
  manpower: number;
  steel: number;
  onRecruit: (unit: UnitConfig, quantity: number) => void;
}

export function UnitRecruitmentCard({
  unit,
  treasury,
  manpower,
  steel,
  onRecruit,
}: UnitRecruitmentCardProps) {
  const calc = useUnitRecruitmentCalculator({
    unit,
    treasury,
    manpower,
    steel,
  });

  const Icon = unit.icon;

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
          <span>هزینه: ${calc.totalMoney.toLocaleString("fa-IR")}</span>
        </div>
        <div className="bg-secondary/40 p-2 rounded-xl flex items-center gap-1 text-muted-foreground">
          <Users size={11} className="text-primary" />
          <span>
            نیروی انسانی: {calc.totalManpower.toLocaleString("fa-IR")}
          </span>
        </div>
        <div className="bg-secondary/40 p-2 rounded-xl flex items-center gap-1 text-muted-foreground">
          <Wrench size={11} className="text-treasury" />
          <span>فولاد: {calc.totalSteel.toLocaleString("fa-IR")} تن</span>
        </div>
      </div>

      <div className="space-y-2 pt-1 border-t border-border/40">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-muted-foreground font-sans">
            حداکثر ظرفیت ساخت با منابع فعلی:
          </span>
          <span className="font-bold text-gdp">
            {calc.maxAffordable.toLocaleString("fa-IR")} یگان
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

          <div className="flex items-center gap-1 font-mono">
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
              className="w-14 bg-secondary/80 border border-border/80 rounded-lg py-1 px-1 text-center font-bold text-xs text-foreground font-mono focus:outline-none focus:border-primary"
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

      <button
        type="button"
        onClick={() => onRecruit(unit, calc.quantity)}
        disabled={calc.quantity <= 0 || calc.maxAffordable === 0}
        className="w-full py-2.5 bg-military hover:bg-military/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
      >
        {calc.quantity > 0
          ? `ثبت سفارش ساخت ${calc.quantity.toLocaleString("fa-IR")} یگان ${unit.name}`
          : calc.maxAffordable === 0
            ? "منابع ناکافی جهت ساخت این یگان"
            : "تعداد سفارش را تعیین کنید"}
      </button>
    </div>
  );
}
