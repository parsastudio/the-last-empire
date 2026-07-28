export interface CasualtyCalculationResult {
  attackerLost: number;
  defenderLost: number;
  attackerRetreated: number;
  defenderRetreated: number;
}

export class CombatCasualtyCalculator {
  public calculateCappedCasualties(
    attackerEngaged: number,
    defenderEngaged: number,
    isAttackerVictory: boolean,
  ): CasualtyCalculationResult {
    let attackerLossRate = 0.2;
    let defenderLossRate = 0.4;

    if (isAttackerVictory) {
      attackerLossRate = 0.18;
      defenderLossRate = 0.38;
    } else {
      attackerLossRate = 0.42;
      defenderLossRate = 0.22;
    }

    const attackerLost = Math.floor(attackerEngaged * attackerLossRate);
    const defenderLost = Math.floor(defenderEngaged * defenderLossRate);

    const attackerRetreated = Math.max(0, attackerEngaged - attackerLost);
    const defenderRetreated = Math.max(0, defenderEngaged - defenderLost);

    return {
      attackerLost,
      defenderLost,
      attackerRetreated,
      defenderRetreated,
    };
  }
}
