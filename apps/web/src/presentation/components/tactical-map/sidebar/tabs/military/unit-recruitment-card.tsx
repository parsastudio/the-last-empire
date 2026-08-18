import React from "react";
import {
  Clock,
  Shield,
  ShieldAlert,
  Crosshair,
  Plane,
  Radio,
  Anchor,
  Lock,
  Zap,
  LucideIcon,
} from "lucide-react";
import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { MilitaryPricingCalculator } from "@/domain/military/military-pricing-calculator.utility";
import { UnitType } from "@/domain/military/military.schema";

export interface UnitConfig {
  type: string;
  name: string;
  desc: string;
  moneyCost: number;
  buildTurns: number;
  weightPower: number;
  icon: LucideIcon;
  color: string;
}

export const RECRUITABLE_UNITS: UnitConfig[] = [
  {
    type: MILITARY_UNIT_STATS.INFANTRY.type,
    name: MILITARY_UNIT_STATS.INFANTRY.nameFa,
    desc: "ستون اصلی تسخیر و نگه‌داری استان‌ها و خط مقدم نبردهای زمینی.",
    moneyCost: MILITARY_UNIT_STATS.INFANTRY.moneyCost,
    buildTurns: MILITARY_UNIT_STATS.INFANTRY.buildTurns,
    weightPower: MILITARY_UNIT_STATS.INFANTRY.weightPower,
    icon: Shield,
    color: "text-primary",
  },
  {
    type: MILITARY_UNIT_STATS.ARMOR.type,
    name: MILITARY_UNIT_STATS.ARMOR.nameFa,
    desc: "لشکر زرهی سنگین برای درهم شکستن خطوط پیاده‌نظام و پیشروی سریع.",
    moneyCost: MILITARY_UNIT_STATS.ARMOR.moneyCost,
    buildTurns: MILITARY_UNIT_STATS.ARMOR.buildTurns,
    weightPower: MILITARY_UNIT_STATS.ARMOR.weightPower,
    icon: ShieldAlert,
    color: "text-military",
  },
  {
    type: MILITARY_UNIT_STATS.AIR_DEFENSE.type,
    name: MILITARY_UNIT_STATS.AIR_DEFENSE.nameFa,
    desc: "سپر موشکی برای رهگیری پهپادها و خنثی‌سازی حملات هوایی دشمن.",
    moneyCost: MILITARY_UNIT_STATS.AIR_DEFENSE.moneyCost,
    buildTurns: MILITARY_UNIT_STATS.AIR_DEFENSE.buildTurns,
    weightPower: MILITARY_UNIT_STATS.AIR_DEFENSE.weightPower,
    icon: Crosshair,
    color: "text-diplomacy",
  },
  {
    type: MILITARY_UNIT_STATS.AIR_FORCE.type,
    name: MILITARY_UNIT_STATS.AIR_FORCE.nameFa,
    desc: "جنگنده‌های برتری هوایی جهت شکار اسکادران‌ها و انهدام تانک‌های حریف.",
    moneyCost: MILITARY_UNIT_STATS.AIR_FORCE.moneyCost,
    buildTurns: MILITARY_UNIT_STATS.AIR_FORCE.buildTurns,
    weightPower: MILITARY_UNIT_STATS.AIR_FORCE.weightPower,
    icon: Plane,
    color: "text-gdp",
  },
  {
    type: MILITARY_UNIT_STATS.DRONE_MISSILE.type,
    name: MILITARY_UNIT_STATS.DRONE_MISSILE.nameFa,
    desc: "پرتابه‌های نقطه‌زن برای تهاجم پیش‌دستانه و نابودی پدافند از راه دور.",
    moneyCost: MILITARY_UNIT_STATS.DRONE_MISSILE.moneyCost,
    buildTurns: MILITARY_UNIT_STATS.DRONE_MISSILE.buildTurns,
    weightPower: MILITARY_UNIT_STATS.DRONE_MISSILE.weightPower,
    icon: Radio,
    color: "text-treasury",
  },
  {
    type: MILITARY_UNIT_STATS.NAVAL_FLEET.type,
    name: MILITARY_UNIT_STATS.NAVAL_FLEET.nameFa,
    desc: "ناوشکن‌های سنگین برای حاکمیت بر دریاها و تسهیل تهاجم آبی-خاکی.",
    moneyCost: MILITARY_UNIT_STATS.NAVAL_FLEET.moneyCost,
    buildTurns: MILITARY_UNIT_STATS.NAVAL_FLEET.buildTurns,
    weightPower: MILITARY_UNIT_STATS.NAVAL_FLEET.weightPower,
    icon: Anchor,
    color: "text-primary",
  },
];

interface UnitRecruitmentCardProps {
  unit: UnitConfig;
  techLevel?: number;
  industrialLevel?: number;
  onOpenRecruitModal: (unit: UnitConfig) => void;
}

export function UnitRecruitmentCard({
  unit,
  techLevel = 1,
  industrialLevel = 1,
  onOpenRecruitModal,
}: UnitRecruitmentCardProps) {
  const Icon = unit.icon;
  const unitStat =
    MILITARY_UNIT_STATS[unit.type as keyof typeof MILITARY_UNIT_STATS];
  const isTechUnlocked = techLevel >= (unitStat?.requiredTechLevel || 1);

  const unitUnitPrice = MilitaryPricingCalculator.calculateUnitTypePrice(
    unit.type as UnitType,
    techLevel,
    industrialLevel,
  );

  return (
    <div className="bg-background/40 border border-border/70 p-4 rounded-2xl space-y-3 text-right dir-rtl transition-all hover:border-primary/40 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl bg-secondary/80 border border-border/60 ${unit.color}`}
          >
            <Icon size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">{unit.name}</h4>
            <span className="text-[10px] text-muted-foreground font-mono">
              قیمت هر یگان:{" "}
              {PersianNumberFormatter.formatCurrency(unitUnitPrice)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground bg-secondary/80 px-2.5 py-1 rounded-lg border border-border/50">
          <Clock size={11} className="text-treasury" />
          <span>
            {PersianNumberFormatter.toPersianDigits(unit.buildTurns)} نوبت ساخت
          </span>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed font-sans bg-secondary/20 p-2.5 rounded-xl border border-border/40">
        {unit.desc}
      </p>

      {!isTechUnlocked ? (
        <div className="p-3 bg-secondary/60 border border-border/60 rounded-xl flex items-center justify-between text-[10px] text-amber-500 font-sans font-bold">
          <span className="flex items-center gap-1">
            <Lock size={12} />
            نیازمند سطح فناوری{" "}
            {PersianNumberFormatter.toPersianDigits(
              unitStat.requiredTechLevel,
            )}{" "}
            جهت تولید داخلی
          </span>
          <span className="text-[9px] text-muted-foreground font-mono">
            قابل خرید فوری از بازار اسلحه
          </span>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onOpenRecruitModal(unit)}
          className="w-full py-3 bg-gdp hover:bg-gdp/90 text-primary-foreground rounded-xl text-xs font-bold transition-all shadow-md shadow-gdp/20 hover:scale-[1.005] active:scale-[0.995] cursor-pointer flex items-center justify-center gap-2 border border-gdp/30"
        >
          <Zap size={14} />
          <span>
            سفارش ساخت و استخدام (
            {PersianNumberFormatter.formatCurrency(unitUnitPrice)})
          </span>
        </button>
      )}
    </div>
  );
}
