import { MissileInterceptionPhase } from "@/engine/combat/phases/missile-interception-phase";
import { AirSupremacyPhase } from "@/engine/combat/phases/air-supremacy-phase";
import { BinarySearchOptimizer } from "@/engine/combat/optimizer/helpers/binary-search-optimizer";

export class AirMissileDeploymentOptimizer {
  public static calculateOptimalDrones(
    maxDrone: number,
    defAirDefense: number,
    attDroneMult: number,
    defAdMult: number,
  ): number {
    if (defAirDefense <= 0 || maxDrone <= 0) {
      return 0;
    }

    return BinarySearchOptimizer.findMinimalPassing(1, maxDrone, (drones) => {
      const res = MissileInterceptionPhase.calculate({
        deployedDrones: drones,
        defAirDefense,
        attDroneMult,
        defAdMult,
      });
      return res.defAirDefenseRemainingRaw === 0;
    });
  }

  public static calculateOptimalAirForce(
    maxAir: number,
    defAirForce: number,
    defArmor: number,
    attAirMult: number,
    defAirMult: number,
    defArmorMult: number,
    defAirDefenseRemainingRaw: number,
  ): number {
    if (maxAir <= 0) return 0;
    if (defAirForce <= 0 && defArmor <= 0) return 0;

    return BinarySearchOptimizer.findMinimalPassing(0, maxAir, (airForce) => {
      const res = AirSupremacyPhase.calculate({
        deployedAirForce: airForce,
        defAirForce,
        defArmor,
        attAirMult,
        defAirMult,
        defArmorMult,
        defAirDefenseRemainingRaw,
      });

      const airCleared = defAirForce <= 0 || res.rawDefAirLoss >= defAirForce;
      const armorCleared =
        defArmor <= 0 || res.defArmorDestroyedByAir >= defArmor;

      return airCleared && armorCleared;
    });
  }
}
