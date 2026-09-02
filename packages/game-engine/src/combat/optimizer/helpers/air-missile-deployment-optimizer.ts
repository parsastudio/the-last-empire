import { MissileInterceptionPhase } from "@/engine/combat/phases/missile-interception-phase";
import { AirSupremacyPhase } from "@/engine/combat/phases/air-supremacy-phase";

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

    let low = 1;
    let high = maxDrone;
    let optimal = maxDrone;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const res = MissileInterceptionPhase.calculate({
        deployedDrones: mid,
        defAirDefense,
        attDroneMult,
        defAdMult,
      });

      if (res.defAirDefenseRemainingRaw === 0) {
        optimal = mid;
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    return optimal;
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

    let low = 0;
    let high = maxAir;
    let optimal = maxAir;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const res = AirSupremacyPhase.calculate({
        deployedAirForce: mid,
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

      if (airCleared && armorCleared) {
        optimal = mid;
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    return optimal;
  }
}
