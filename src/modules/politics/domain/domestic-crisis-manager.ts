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
      if (
        nation.government.type !== "DEMOCRACY" &&
        this.calculateMilitaryRatio(nation) > 3.0
      ) {
        return {
          hasTriggered: true,
          status: "COUP",
          updatedNation: this.applyCoup(nation),
        };
      }
      return {
        hasTriggered: true,
        status: "REVOLT",
        updatedNation: this.applyRebellion(nation),
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

  private calculateMilitaryRatio(nation: Nation): number {
    const power =
      nation.military.infantry * 1.0 +
      nation.military.airForce * 3.0 +
      nation.military.navy * 2.0 +
      nation.military.droneMissile * 2.5;
    const authority = nation.government.stability * 10;
    return power / (authority || 1);
  }

  private applyCrisisPenalty(nation: Nation): Nation {
    return {
      ...nation,
      gdp: Math.floor(nation.gdp * 0.95),
    };
  }

  private applyRebellion(nation: Nation): Nation {
    const defectedInfantry = Math.floor(nation.military.infantry * 0.35);
    const defectedAir = Math.floor(nation.military.airForce * 0.25);

    return {
      ...nation,
      military: {
        ...nation.military,
        infantry: nation.military.infantry - defectedInfantry,
        airForce: nation.military.airForce - defectedAir,
      },
      government: {
        ...nation.government,
        stability: Math.min(100, nation.government.stability + 30),
      },
    };
  }

  private applyCoup(nation: Nation): Nation {
    return {
      ...nation,
      government: {
        ...nation.government,
        type: "DICTATORSHIP",
        stability: 50,
        corruption: Math.min(100, nation.government.corruption + 20),
        turnsInPower: 0,
      },
    };
  }
}
