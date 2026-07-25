import { MilitaryStack } from "@/domain/military/military.schema";
import { AttackerCasualtyCalculator } from "./casualty/attacker-casualty.calculator";
import { DefenderCasualtyCalculator } from "./casualty/defender-casualty.calculator";

export interface CasualtyReport {
  attackerKilledInfantry: number;
  attackerKilledAirForce: number;
  attackerKilledDrones: number;
  defenderKilledInfantry: number;
  defenderKilledAirForce: number;
  defenderKilledDrones: number;
}

export class CasualtyCalculator {
  private attackerCalc = new AttackerCasualtyCalculator();
  private defenderCalc = new DefenderCasualtyCalculator();

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

    const attackerLosses = this.attackerCalc.calculateAttackerLosses(
      attackerMilitary,
      attackerBaseRate,
    );

    const defenderLosses = this.defenderCalc.calculateDefenderLosses(
      defenderMilitary,
      defenderBaseRate,
      attackerPower,
    );

    return {
      attackerKilledInfantry: attackerLosses.killedInfantry,
      attackerKilledAirForce: attackerLosses.killedAirForce,
      attackerKilledDrones: attackerLosses.killedDrones,
      defenderKilledInfantry: defenderLosses.killedInfantry,
      defenderKilledAirForce: defenderLosses.killedAirForce,
      defenderKilledDrones: defenderLosses.killedDrones,
    };
  }
}
