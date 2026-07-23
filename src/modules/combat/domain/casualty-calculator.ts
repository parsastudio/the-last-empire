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
    let attackerBaseRate = attackerWon ? 0.1 * ratio : 0.25 * ratio;
    const defenderBaseRate = attackerWon ? 0.3 / ratio : 0.15 / ratio;

    const attackerPower =
      attackerMilitary.infantry * 1.0 +
      attackerMilitary.airForce * 3.0 +
      attackerMilitary.droneMissile * 2.5;

    const defenderPower =
      defenderMilitary.infantry * 1.0 +
      defenderMilitary.airForce * 3.0 +
      defenderMilitary.droneMissile * 2.5;

    if (attackerWon && attackerPower > defenderPower * 5 && defenderPower > 0) {
      const powerAdvantageFactor = Math.max(
        0.01,
        defenderPower / attackerPower,
      );
      attackerBaseRate = attackerBaseRate * powerAdvantageFactor;
    }

    const attackerKilledInfantry = Math.floor(
      attackerMilitary.infantry * Math.min(0.8, attackerBaseRate),
    );
    const attackerKilledAirForce = Math.floor(
      attackerMilitary.airForce * Math.min(0.5, attackerBaseRate * 0.5),
    );

    const maxDefenderLoss = Math.floor(attackerPower * 10.0);
    const rawDefenderKilledInfantry = Math.floor(
      defenderMilitary.infantry * Math.min(0.9, defenderBaseRate),
    );
    const defenderKilledInfantry = Math.min(
      maxDefenderLoss,
      rawDefenderKilledInfantry,
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
