import type { Nation } from "@/core/types/nation.types";

export interface CoupStatus {
  hasCoupOccurred: boolean;
  updatedNation: Nation;
}

export class MilitaryCoupEngine {
  public checkAndExecuteCoup(nation: Nation): CoupStatus {
    if (nation.government.type === "DEMOCRACY") {
      return { hasCoupOccurred: false, updatedNation: nation };
    }

    const militaryPower =
      nation.military.infantry +
      nation.military.airForce * 3 +
      nation.military.navy * 2 +
      nation.military.droneMissile * 2.5;

    const stateAuthority = nation.government.stability * 10;

    if (
      militaryPower > stateAuthority * 3 &&
      nation.government.stability < 20
    ) {
      const updatedNation: Nation = {
        ...nation,
        government: {
          ...nation.government,
          type: "DICTATORSHIP",
          stability: 50,
          corruption: Math.min(100, nation.government.corruption + 20),
          turnsInPower: 0,
        },
      };

      return {
        hasCoupOccurred: true,
        updatedNation,
      };
    }

    return {
      hasCoupOccurred: false,
      updatedNation: nation,
    };
  }
}
