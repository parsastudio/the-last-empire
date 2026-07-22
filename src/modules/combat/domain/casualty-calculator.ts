import type { MilitaryStack } from "@/modules/military/schemas/military.schema";

export interface CasualtyReport {
  attackerKilledInfantry: number;
  attackerKilledAirForce: number;
  defenderKilledInfantry: number;
  defenderKilledAirForce: number;
}

export class CasualtyCalculator {
  public calculateCasualties(
    attackerScore: number,
    defenderScore: number,
    attackerMilitary: MilitaryStack,
    defenderMilitary: MilitaryStack,
    attackerWon: boolean,
  ): CasualtyReport {
    const ratio = Math.max(
      0.1,
      Math.min(2.0, defenderScore / (attackerScore || 1)),
    );

    const attackerBaseRate = attackerWon ? 0.1 * ratio : 0.25 * ratio;
    const defenderBaseRate = attackerWon ? 0.3 / ratio : 0.15 / ratio;

    const attackerKilledInfantry = Math.floor(
      attackerMilitary.infantry * Math.min(0.8, attackerBaseRate),
    );
    const attackerKilledAirForce = Math.floor(
      attackerMilitary.airForce * Math.min(0.5, attackerBaseRate * 0.5),
    );

    const defenderKilledInfantry = Math.floor(
      defenderMilitary.infantry * Math.min(0.9, defenderBaseRate),
    );
    const defenderKilledAirForce = Math.floor(
      defenderMilitary.airForce * Math.min(0.6, defenderBaseRate * 0.5),
    );

    return {
      attackerKilledInfantry,
      attackerKilledAirForce,
      defenderKilledInfantry,
      defenderKilledAirForce,
    };
  }
}
