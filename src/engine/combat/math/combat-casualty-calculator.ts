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
    isFullTerritoryCaptured = false,
  ): CasualtyCalculationResult {
    if (attackerEngaged <= 0 || defenderEngaged <= 0) {
      return {
        attackerLost: 0,
        defenderLost: 0,
        attackerRetreated: attackerEngaged,
        defenderRetreated: defenderEngaged,
      };
    }

    const smallerForce = Math.min(attackerEngaged, defenderEngaged);

    let attackerLost = Math.floor(smallerForce * 0.4);
    let defenderLost = Math.floor(smallerForce * 0.3);

    if (isAttackerVictory) {
      if (isFullTerritoryCaptured) {
        defenderLost = defenderEngaged;
      } else {
        defenderLost = Math.min(
          defenderEngaged,
          Math.max(defenderLost, Math.floor(smallerForce * 0.5)),
        );
      }
    } else {
      attackerLost = Math.min(
        attackerEngaged,
        Math.max(attackerLost, Math.floor(smallerForce * 0.5)),
      );
    }

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
