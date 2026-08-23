import { Nation, Province, NationGettersUtility } from "@geopolitics/domain";

export class RankManager {
  public static calculateRankMap(
    nations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
  ): Map<string, number> {
    return NationGettersUtility.calculateRankMap(nations, provincesMap);
  }

  public static getRank(
    nationId: string,
    nations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
  ): number {
    return NationGettersUtility.getRank(nationId, nations, provincesMap);
  }
}
