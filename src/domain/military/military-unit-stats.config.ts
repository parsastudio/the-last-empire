import { UnitType } from "@/domain/military/military.schema";

export interface MilitaryUnitStat {
  type: UnitType;
  nameFa: string;
  moneyCost: number;
  buildTurns: number;
  weightPower: number;
  requiredTechLevel: number;
}

export const MILITARY_UNIT_STATS: Record<UnitType, MilitaryUnitStat> = {
  INFANTRY: {
    type: "INFANTRY",
    nameFa: "لشکر پیاده‌نظام رزمی",
    moneyCost: 1000000000,
    buildTurns: 2,
    weightPower: 1.0,
    requiredTechLevel: 1,
  },
  DRONE_MISSILE: {
    type: "DRONE_MISSILE",
    nameFa: "تیپ تهاجمی پهپادی و موشکی",
    moneyCost: 2000000000,
    buildTurns: 1,
    weightPower: 0.2,
    requiredTechLevel: 1,
  },
  ARMOR: {
    type: "ARMOR",
    nameFa: "لشکر زرهی و تانک‌های سنگین",
    moneyCost: 4000000000,
    buildTurns: 3,
    weightPower: 3.0,
    requiredTechLevel: 2,
  },
  AIR_DEFENSE: {
    type: "AIR_DEFENSE",
    nameFa: "تیپ پدافند هوایی و موشکی",
    moneyCost: 8000000000,
    buildTurns: 2,
    weightPower: 0.5,
    requiredTechLevel: 3,
  },
  AIR_FORCE: {
    type: "AIR_FORCE",
    nameFa: "اسکادران جنگنده‌های برتری هوایی",
    moneyCost: 14000000000,
    buildTurns: 4,
    weightPower: 3.5,
    requiredTechLevel: 4,
  },
  NAVAL_FLEET: {
    type: "NAVAL_FLEET",
    nameFa: "ناوگروه ضربت ناوشکن‌های سنگین",
    moneyCost: 50000000000,
    buildTurns: 5,
    weightPower: 5.0,
    requiredTechLevel: 5,
  },
};
