import type { MilitaryStack } from "@/domain/military/military.schema";
import { DoctrinesManager } from "@/engine/politics/doctrines-manager";

export interface DroneStrikeResult {
  softeningDamage: number;
  remainingDefenderInfantry: number;
  attackerDronesDestroyed: number;
  defenderDronesDestroyed: number;
}

export class DroneStrikeCalculator {
  private doctrinesManager = new DoctrinesManager();

  public calculateDroneImpact(
    attackerMilitary: MilitaryStack,
    defenderMilitary: MilitaryStack,
    attackerUnlockedDoctrines: string[] = [],
  ): DroneStrikeResult {
    const drones = attackerMilitary.droneMissile;
    if (drones <= 0) {
      return {
        softeningDamage: 0,
        remainingDefenderInfantry: defenderMilitary.infantry,
        attackerDronesDestroyed: 0,
        defenderDronesDestroyed: 0,
      };
    }

    const defenderAir = defenderMilitary.airForce;
    const defenderDrones = defenderMilitary.droneMissile;

    let interceptionRate = 0;
    if (defenderAir > 0 || defenderDrones > 0) {
      const defensePower = defenderAir * 0.4 + defenderDrones * 0.6;
      interceptionRate = Math.min(1.0, defensePower / drones);
    }

    const interceptedDrones = Math.floor(drones * interceptionRate);
    const effectiveDrones = Math.max(0, drones - interceptedDrones);
    const droneMultiplier = this.doctrinesManager.getDroneMultiplier(
      attackerUnlockedDoctrines,
    );
    const damagePerDrone = 8 * droneMultiplier;
    const totalDamage = Math.floor(effectiveDrones * damagePerDrone);

    const maxAllowedDamage = Math.floor(defenderMilitary.infantry * 0.4);
    const actualDamage = Math.min(totalDamage, maxAllowedDamage);

    const remainingInfantry = Math.max(
      0,
      defenderMilitary.infantry - actualDamage,
    );

    const attackerDronesDestroyed = drones;
    const defenderDronesDestroyed = Math.min(
      defenderDrones,
      Math.floor(interceptedDrones * 0.1),
    );

    return {
      softeningDamage: actualDamage,
      remainingDefenderInfantry: remainingInfantry,
      attackerDronesDestroyed,
      defenderDronesDestroyed,
    };
  }
}
