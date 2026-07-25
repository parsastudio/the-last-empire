import { MilitaryStack } from "@/domain/military/military.schema";

export class DefenderCasualtyCalculator {
  public calculateDefenderLosses(
    defenderMilitary: MilitaryStack,
    defenderBaseRate: number,
    attackerPower: number,
  ): { killedInfantry: number; killedAirForce: number; killedDrones: number } {
    const maxDefenderLoss = Math.floor(attackerPower * 10.0);
    const rawDefenderKilledInfantry = Math.floor(
      defenderMilitary.infantry * Math.min(0.9, defenderBaseRate),
    );
    const killedInfantry = Math.min(maxDefenderLoss, rawDefenderKilledInfantry);

    const killedAirForce = Math.floor(
      defenderMilitary.airForce * Math.min(0.6, defenderBaseRate * 0.5),
    );
    const killedDrones = Math.floor(
      defenderMilitary.droneMissile * Math.min(0.7, defenderBaseRate * 0.8),
    );

    return { killedInfantry, killedAirForce, killedDrones };
  }
}
