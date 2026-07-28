import { CombatCasualtyCalculator } from "../math/combat-casualty-calculator";

export function runCasualtyRetreatTest(): boolean {
  const calculator = new CombatCasualtyCalculator();

  const result = calculator.calculateCappedCasualties(1000, 1000, true);

  const attackerLostCapPassed = result.attackerLost <= 250;
  const defenderRetreatedValid = result.defenderRetreated >= 550;

  return attackerLostCapPassed && defenderRetreatedValid;
}
