import {
  Nation,
  Province,
  getNationGdp,
  NationGettersUtility,
} from "@geopolitics/domain";

export class BattleLootEvaluator {
  public static calculateLoot(
    defender: Nation,
    isAttackerVictory: boolean,
    provincesMap?: Record<string, Province>,
  ): number {
    if (!isAttackerVictory) {
      return 0;
    }

    const defenderGdp = getNationGdp(defender, provincesMap);
    const guaranteedLootPool =
      Math.max(0, defender.treasury) + Math.floor(defenderGdp * 0.05);

    const defenderTotalTerritory =
      NationGettersUtility.getTerritoryPixelCount(defender.id, provincesMap) ||
      1;

    const treasuryLootRatio = Math.min(0.2, 1000 / defenderTotalTerritory);

    return Math.floor(guaranteedLootPool * treasuryLootRatio);
  }
}
