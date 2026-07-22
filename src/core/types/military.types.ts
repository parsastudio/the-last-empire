export type UnitType = "INFANTRY" | "AIR_FORCE" | "NAVY" | "DRONE_MISSILE";

export interface MilitaryStack {
  infantry: number;
  airForce: number;
  navy: number;
  droneMissile: number;
  experience: number;
  techLevel: number;
  mobility: number;
}

export interface RecruitmentOrder {
  id: string;
  unitType: UnitType;
  quantity: number;
  turnsRemaining: number;
  totalCost: number;
  manpowerRequired: number;
}
