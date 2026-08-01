import { UnitType } from "@/domain/military/military.schema";

export interface MilitaryUnitStat {
  type: UnitType;
  nameFa: string;
  moneyCost: number;
  manpowerCost: number;
  steelCost: number;
  buildTurns: number;
  moneyUpkeepBase: number;
  weightPower: number;
}

export const MILITARY_UNIT_STATS: Record<UnitType, MilitaryUnitStat> = {
  INFANTRY: {
    type: "INFANTRY",
    nameFa: "پیاده‌نظام رزمی (۱۰ هزار نفر)",
    moneyCost: 250000000,
    manpowerCost: 10,
    steelCost: 0,
    buildTurns: 2,
    moneyUpkeepBase: 12,
    weightPower: 1.0,
  },
  AIR_FORCE: {
    type: "AIR_FORCE",
    nameFa: "نیروی هوایی (۱۰ فروند جنگنده)",
    moneyCost: 1000000000,
    manpowerCost: 5,
    steelCost: 20,
    buildTurns: 4,
    moneyUpkeepBase: 36,
    weightPower: 3.0,
  },
  DRONE_MISSILE: {
    type: "DRONE_MISSILE",
    nameFa: "یگان موشکی و پهپادی (۱۰ یگان)",
    moneyCost: 1500000000,
    manpowerCost: 1,
    steelCost: 25,
    buildTurns: 1,
    moneyUpkeepBase: 2.4,
    weightPower: 0.2,
  },
};
