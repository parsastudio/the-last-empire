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
      const updatedNation: Nation = {
        ...nation,
        treasury: Math.floor(nation.treasury * 0.6),
        military: {
          ...nation.military,
          infantry: Math.floor(nation.military.infantry * 0.7),
          airForce: Math.floor(nation.military.airForce * 0.7),
          droneMissile: Math.floor(nation.military.droneMissile * 0.7),
        },
        government: {
          ...nation.government,
          stability: 20,
          corruption: Math.min(100, nation.government.corruption + 15),
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
