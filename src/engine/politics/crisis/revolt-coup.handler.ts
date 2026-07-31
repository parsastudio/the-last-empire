import { Nation } from "@/domain/nation/nation.schema";

export class RevoltCoupHandler {
  public applyCrisisPenalty(nation: Nation): Nation {
    return {
      ...nation,
      government: {
        ...nation.government,
        stability: Math.max(0, nation.government.stability - 5),
      },
    };
  }

  public applyRebellion(nation: Nation, rebelStrength: number): Nation {
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

  public applyCoup(nation: Nation): Nation {
    return {
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
  }
}
