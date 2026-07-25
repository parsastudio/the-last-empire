import { MilitaryStack } from "@/domain/military/military.schema";

export class AttackerCasualtyCalculator {
  public calculateAttackerLosses(
    attackerMilitary: MilitaryStack,
    attackerBaseRate: number,
  ): { killedInfantry: number; killedAirForce: number; killedDrones: number } {
    const killedInfantry = Math.floor(
      attackerMilitary.infantry * Math.min(0.8, attackerBaseRate),
    );
    const killedAirForce = Math.floor(
      attackerMilitary.airForce * Math.min(0.5, attackerBaseRate * 0.5),
    );
    const killedDrones = Math.floor(
      attackerMilitary.droneMissile * Math.min(0.7, attackerBaseRate * 0.8),
    );

    return { killedInfantry, killedAirForce, killedDrones };
  }
}
