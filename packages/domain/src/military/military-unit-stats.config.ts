import { UnitType } from "@/domain/military/military.schema";

export interface MilitaryUnitStat {
  type: UnitType;
  moneyCost: number;
  weightPower: number;
}

export const MILITARY_UNIT_STATS: Record<UnitType, MilitaryUnitStat> = {
  INFANTRY: {
    type: "INFANTRY",
    moneyCost: 500_000_000,
    weightPower: 1.0,
  },
  DRONE_MISSILE: {
    type: "DRONE_MISSILE",
    moneyCost: 1_000_000_000,
    weightPower: 0.5,
  },
  ARMOR: {
    type: "ARMOR",
    moneyCost: 2_000_000_000,
    weightPower: 3.0,
  },
  AIR_DEFENSE: {
    type: "AIR_DEFENSE",
    moneyCost: 4_000_000_000,
    weightPower: 2.5,
  },
  AIR_FORCE: {
    type: "AIR_FORCE",
    moneyCost: 6_000_000_000,
    weightPower: 6.0,
  },
};
