import { Nation } from "@/domain/nation/nation.schema";
import { ProvinceDynamicState } from "@/domain/province/province.schema";
import { NationGettersUtility } from "@/domain/nation/nation-getters.utility";

export type GeopoliticalReachTier =
  | "SUPERPOWER"
  | "REGIONAL_POWER"
  | "LOCAL_POWER";

export class GeopoliticalTierClassifier {
  public static readonly SUPERPOWER_PERCENTAGE = 0.08;
  public static readonly REGIONAL_PERCENTAGE = 0.3;
  public static readonly MIN_SUPERPOWERS = 3;

  public static getSuperpowerCutoffRank(totalAlive: number): number {
    const safeTotal = Math.max(1, totalAlive);
    const calculated = Math.ceil(safeTotal * this.SUPERPOWER_PERCENTAGE);
    return Math.min(safeTotal, Math.max(this.MIN_SUPERPOWERS, calculated));
  }

  public static getRegionalCutoffRank(totalAlive: number): number {
    const safeTotal = Math.max(1, totalAlive);
    const superpowerCutoff = this.getSuperpowerCutoffRank(safeTotal);
    const calculated = Math.ceil(safeTotal * this.REGIONAL_PERCENTAGE);
    return Math.min(safeTotal, Math.max(superpowerCutoff + 1, calculated));
  }

  public static getReachTier(
    nation: Nation,
    allNations?: Record<string, Nation>,
    provincesMap?: Record<string, ProvinceDynamicState>,
    rankMap?: Map<string, number>,
  ): GeopoliticalReachTier {
    const rank = NationGettersUtility.getRank(
      nation.id,
      allNations,
      provincesMap,
      rankMap,
    );

    const totalAlive = allNations
      ? Object.values(allNations).filter((n) => n.isAlive).length
      : 100;

    const superpowerCutoff = this.getSuperpowerCutoffRank(totalAlive);
    const regionalCutoff = this.getRegionalCutoffRank(totalAlive);

    if (rank <= superpowerCutoff) {
      return "SUPERPOWER";
    }
    if (rank <= regionalCutoff) {
      return "REGIONAL_POWER";
    }
    return "LOCAL_POWER";
  }
}
