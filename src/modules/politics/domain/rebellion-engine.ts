import type { Nation } from "@/modules/nation/schemas/nation.schema";

export interface RebellionStatus {
  hasRebellionTriggered: boolean;
  rebelInfantryCount: number;
  updatedNation: Nation;
}

export class RebellionEngine {
  public checkAndTriggerRebellion(nation: Nation): RebellionStatus {
    if (nation.government.stability >= 10) {
      return {
        hasRebellionTriggered: false,
        rebelInfantryCount: 0,
        updatedNation: nation,
      };
    }

    const defectingInfantry = Math.floor(nation.military.infantry * 0.3);
    const defectingAirForce = Math.floor(nation.military.airForce * 0.2);

    const rebelArmyPower = defectingInfantry + defectingAirForce * 2;

    const updatedNation: Nation = {
      ...nation,
      military: {
        ...nation.military,
        infantry: nation.military.infantry - defectingInfantry,
        airForce: nation.military.airForce - defectingAirForce,
      },
      government: {
        ...nation.government,
        stability: Math.min(25, nation.government.stability + 10),
      },
    };

    return {
      hasRebellionTriggered: true,
      rebelInfantryCount: rebelArmyPower,
      updatedNation,
    };
  }
}
