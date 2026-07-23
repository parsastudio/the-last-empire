import type { Nation } from "@/modules/nation/schemas/nation.schema";

export interface DomesticCrisisResult {
  hasTriggered: boolean;
  status: "STABLE" | "RESTLESS" | "CRISIS" | "REVOLT" | "COUP";
  updatedNation: Nation;
}

export class DomesticCrisisManager {
  public checkAndProcessCrisis(nation: Nation): DomesticCrisisResult {
    const stability = nation.government.stability;
    const corruption = nation.government.corruption;

    if (stability < 10) {
      const rebelStrength = Math.max(
        50,
        Math.floor(nation.population * 0.0001),
      );
      const totalMilitaryPower =
        nation.military.infantry * 1.0 +
        nation.military.airForce * 3.0 +
        nation.military.navy * 2.0 +
        nation.military.droneMissile * 2.5;

      if (totalMilitaryPower === 0 || rebelStrength > totalMilitaryPower) {
        return {
          hasTriggered: true,
          status: "COUP",
          updatedNation: this.applyCoup(nation),
        };
      }

      return {
        hasTriggered: true,
        status: "REVOLT",
        updatedNation: this.applyRebellion(nation, rebelStrength),
      };
    }

    if (stability < 30 || corruption > 60) {
      return {
        hasTriggered: true,
        status: "CRISIS",
        updatedNation: this.applyCrisisPenalty(nation),
      };
    }

    if (stability < 50 || corruption > 35) {
      return {
        hasTriggered: true,
        status: "RESTLESS",
        updatedNation: nation,
      };
    }

    return {
      hasTriggered: false,
      status: "STABLE",
      updatedNation: nation,
    };
  }

  private applyCrisisPenalty(nation: Nation): Nation {
    return {
      ...nation,
      gdp: Math.floor(nation.gdp * 0.95),
    };
  }

  private applyRebellion(nation: Nation, rebelStrength: number): Nation {
    const casualtyInfantry = Math.min(
      nation.military.infantry,
      Math.floor(rebelStrength * 0.5),
    );
    return {
      ...nation,
      military: {
        ...nation.military,
        infantry: nation.military.infantry - casualtyInfantry,
      },
      government: {
        ...nation.government,
        stability: 25,
      },
    };
  }

  private applyCoup(nation: Nation): Nation {
    return {
      ...nation,
      gdp: Math.floor(nation.gdp * 0.5),
      treasury: Math.floor(nation.treasury * 0.5),
      military: {
        ...nation.military,
        infantry: 0,
        airForce: 0,
        navy: 0,
        droneMissile: 0,
      },
      government: {
        ...nation.government,
        type: "DICTATORSHIP",
        stability: 20,
        corruption: Math.min(100, nation.government.corruption + 25),
        turnsInPower: 0,
      },
    };
  }
}
