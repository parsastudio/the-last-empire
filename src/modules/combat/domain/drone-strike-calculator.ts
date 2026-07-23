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

    const droneMultiplier = this.doctrinesManager.getDroneMultiplier(
      attackerUnlockedDoctrines,
    );
    const damagePerDrone = 5 * droneMultiplier;
    const totalDamage = drones * damagePerDrone;
    const remainingInfantry = Math.max(
      0,
      defenderMilitary.infantry - totalDamage,
    );

    return {
      softeningDamage: totalDamage,
      remainingDefenderInfantry: remainingInfantry,
    };
  }
}
