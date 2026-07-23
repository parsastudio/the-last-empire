import type { MilitaryStack } from "@/modules/military/schemas/military.schema";
import { DoctrinesManager } from "@/modules/politics/domain/doctrines-manager";

export interface DroneStrikeResult {
  softeningDamage: number;
  remainingDefenderInfantry: number;
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
      };
    }

    const defenderAir = defenderMilitary.airForce;
    const defenderDrones = defenderMilitary.droneMissile;

    let interceptionRate = 0;
    if (defenderAir > 0 || defenderDrones > 0) {
      const defensePower = defenderAir * 0.2 + defenderDrones * 0.3;
      interceptionRate = Math.min(0.75, defensePower / drones);
    }

    const effectiveDrones = Math.max(0, drones * (1.0 - interceptionRate));
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

    return {
      softeningDamage: actualDamage,
      remainingDefenderInfantry: remainingInfantry,
    };
  }
}
