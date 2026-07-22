import type { MilitaryStack } from "@/modules/military/schemas/military.schema";

export interface DroneStrikeResult {
  softeningDamage: number;
  remainingDefenderInfantry: number;
}

export class DroneStrikeCalculator {
  public calculateDroneImpact(
    attackerMilitary: MilitaryStack,
    defenderMilitary: MilitaryStack,
  ): DroneStrikeResult {
    const drones = attackerMilitary.droneMissile;
    if (drones <= 0) {
      return {
        softeningDamage: 0,
        remainingDefenderInfantry: defenderMilitary.infantry,
      };
    }

    const damagePerDrone = 5;
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
