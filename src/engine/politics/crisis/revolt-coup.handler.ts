import { Nation } from "@/domain/nation/nation.schema";

export class RevoltCoupHandler {
  public applyCrisisPenalty(nation: Nation): Nation {
    return {
      ...nation,
      gdp: Math.floor(nation.gdp * 0.95),
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
      gdp: Math.floor(nation.gdp * 0.5),
      treasury: Math.floor(nation.treasury * 0.5),
      military: {
        ...nation.military,
        infantry: 0,
        airForce: 0,
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
