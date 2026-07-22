import type { Nation } from "@/modules/nation/schemas/nation.schema";
import { NationManager } from "@/modules/nation/domain/nation-manager";

export interface CoupStatus {
  hasCoupOccurred: boolean;
  updatedNation: Nation;
}

export class MilitaryCoupEngine {
  private nationManager = new NationManager();

  public checkAndExecuteCoup(nation: Nation): CoupStatus {
    if (nation.government.type === "DEMOCRACY") {
      return { hasCoupOccurred: false, updatedNation: nation };
    }

    const militaryPower = this.nationManager.getTotalMilitaryPower(nation);
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
