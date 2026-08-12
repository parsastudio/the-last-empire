import { UnitType } from "@/domain/military/military.schema";

export interface MilitaryUnitStat {
  type: UnitType;
  nameFa: string;
  moneyCost: number;
  buildTurns: number;
  weightPower: number;
}

export const MILITARY_UNIT_STATS: Record<UnitType, MilitaryUnitStat> = {
  INFANTRY: {
    type: "INFANTRY",
    nameFa: "پیاده‌نظام رزمی (۱۰ هزار نفر)",
    moneyCost: 350000000,
    buildTurns: 2,
    weightPower: 1.0,
  },
  AIR_FORCE: {
    type: "AIR_FORCE",
    nameFa: "نیروی هوایی (۱۰ فروند جنگنده)",
    moneyCost: 1400000000,
    buildTurns: 4,
    weightPower: 3.0,
  },
  DRONE_MISSILE: {
    type: "DRONE_MISSILE",
    nameFa: "یگان موشکی و پهپادی (۱۰ یگان)",
    moneyCost: 2000000000,
    buildTurns: 1,
    weightPower: 0.2,
  },
};
