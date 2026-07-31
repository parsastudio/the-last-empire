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
        gdp: Math.floor(nation.gdp * 0.5),
        treasury: Math.floor(nation.treasury * 0.5),
        military: {
          ...nation.military,
          infantry: Math.floor(nation.military.infantry * 0.5),
          airForce: Math.floor(nation.military.airForce * 0.5),
          droneMissile: Math.floor(nation.military.droneMissile * 0.5),
        },
        government: {
          ...nation.government,
          stability: 30,
          corruption: Math.min(100, nation.government.corruption + 20),
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
