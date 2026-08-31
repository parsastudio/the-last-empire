import { UnitType } from "@/domain/military/military.schema";

export interface MilitaryUnitStat {
  type: UnitType;
  nameFa: string;
  moneyCost: number;
  weightPower: number;
  requiredTechLevel: number;
}

export const MILITARY_UNIT_STATS: Record<UnitType, MilitaryUnitStat> = {
  INFANTRY: {
    type: "INFANTRY",
    nameFa: "لشکر پیاده‌نظام رزمی",
    moneyCost: 500_000_000,
    weightPower: 1.0,
    requiredTechLevel: 1,
  },
  DRONE_MISSILE: {
    type: "DRONE_MISSILE",
    nameFa: "تیپ تهاجمی پهپادی و موشکی",
    moneyCost: 1_000_000_000,
    weightPower: 0.5,
    requiredTechLevel: 1,
  },
  ARMOR: {
    type: "ARMOR",
    nameFa: "لشکر زرهی و تانک‌های سنگین",
    moneyCost: 2_000_000_000,
    weightPower: 3.0,
    requiredTechLevel: 1,
  },
  AIR_DEFENSE: {
    type: "AIR_DEFENSE",
    nameFa: "تیپ پدافند هوایی و موشکی",
    moneyCost: 4_000_000_000,
    weightPower: 2.5,
    requiredTechLevel: 1,
  },
  AIR_FORCE: {
    type: "AIR_FORCE",
    nameFa: "اسکادران جنگنده‌های برتری هوایی",
    moneyCost: 6_000_000_000,
    weightPower: 6.0,
    requiredTechLevel: 1,
  },
};
