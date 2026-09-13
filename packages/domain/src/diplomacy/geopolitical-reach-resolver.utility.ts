import { Nation } from "@/domain/nation/nation.schema";
import { ProvinceDynamicState } from "@/domain/province/province.schema";
import {
  GeopoliticalTierClassifier,
  GeopoliticalReachTier,
} from "@/domain/diplomacy/reach/geopolitical-tier-classifier";
import {
  ProximityTierResolver,
  ProximityTier,
} from "@/domain/diplomacy/reach/proximity-tier-resolver";
import { ReachableTargetsResolver } from "@/domain/diplomacy/reach/reachable-targets-resolver";
import { NationGettersUtility } from "@/domain/nation/nation-getters.utility";

export type { GeopoliticalReachTier, ProximityTier };

export class GeopoliticalReachResolver {
  public static hasDirectLandBorder(
    source: Nation,
    target: Nation,
    provincesMap?: Record<string, ProvinceDynamicState>,
    sourceProvinces?: ProvinceDynamicState[],
    provincesByOwnerMap?: Map<string, ProvinceDynamicState[]>,
  ): boolean {
    return ProximityTierResolver.hasDirectLandBorder(
      source,
      target,
      provincesMap,
      sourceProvinces,
      provincesByOwnerMap,
    );
  }

  public static canReachForWarOrStrike(
    source: Nation,
    target: Nation,
    provincesMap?: Record<string, ProvinceDynamicState>,
  ): boolean {
    const hasLand = this.hasDirectLandBorder(source, target, provincesMap);
    if (hasLand) return true;

    const sourceSea = NationGettersUtility.hasSeaAccess(
      source.id,
      provincesMap,
    );
    const targetSea = NationGettersUtility.hasSeaAccess(
      target.id,
      provincesMap,
    );
    const hasNavalFleet = (source.navalFleet || 0) > 0;

    return sourceSea && targetSea && hasNavalFleet;
  }

  public static getReachTier(
    nation: Nation,
    allNations?: Record<string, Nation>,
    provincesMap?: Record<string, ProvinceDynamicState>,
    rankMap?: Map<string, number>,
  ): GeopoliticalReachTier {
    return GeopoliticalTierClassifier.getReachTier(
      nation,
      allNations,
      provincesMap,
      rankMap,
    );
  }

  public static getProximityTier(
    source: Nation,
    target: Nation,
    provincesMap?: Record<string, ProvinceDynamicState>,
    sourceProvinces?: ProvinceDynamicState[],
    provincesByOwnerMap?: Map<string, ProvinceDynamicState[]>,
  ): ProximityTier {
    return ProximityTierResolver.getProximityTier(
      source,
      target,
      provincesMap,
      sourceProvinces,
      provincesByOwnerMap,
    );
  }

  public static getReachableTargets(
    source: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, ProvinceDynamicState>,
    rankMap?: Map<string, number>,
    sourceProvinces?: ProvinceDynamicState[],
    provincesByOwnerMap?: Map<string, ProvinceDynamicState[]>,
  ): Nation[] {
    return ReachableTargetsResolver.getReachableTargets(
      source,
      allNations,
      provincesMap,
      rankMap,
      sourceProvinces,
      provincesByOwnerMap,
    );
  }
}
