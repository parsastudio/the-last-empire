import { Nation } from "@/domain/nation/nation.schema";

export interface DomesticCrisisResult {
  hasTriggered: boolean;
  status: "STABLE" | "WARNING" | "COUP";
  updatedNation: Nation;
}

export class DomesticCrisisManager {
  public checkAndProcessCrisis(nation: Nation): DomesticCrisisResult {
    const stability = nation.government.stability;

    if (stability < 10) {
      const infantryAttrition = Math.floor(nation.military.infantry * 0.05);
      const airForceAttrition = Math.floor(nation.military.airForce * 0.05);

      const updatedNation: Nation = {
        ...nation,
        military: {
          ...nation.military,
          infantry: Math.max(0, nation.military.infantry - infantryAttrition),
          airForce: Math.max(0, nation.military.airForce - airForceAttrition),
        },
        government: {
          ...nation.government,
          corruption: Math.min(100, nation.government.corruption + 2.0),
        },
      };

      return {
        hasTriggered: true,
        status: "COUP",
        updatedNation,
      };
    }

    if (stability < 30) {
      return {
        hasTriggered: true,
        status: "WARNING",
        updatedNation: nation,
      };
    }

    return {
      hasTriggered: false,
      status: "STABLE",
      updatedNation: nation,
    };
  }
}
