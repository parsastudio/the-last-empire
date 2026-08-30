import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import {
  GeopoliticalTierClassifier,
  GeopoliticalReachTier,
} from "@/domain/diplomacy/reach/geopolitical-tier-classifier";
import {
  ProximityTierResolver,
  ProximityTier,
} from "@/domain/diplomacy/reach/proximity-tier-resolver";
import { ReachableTargetsResolver } from "@/domain/diplomacy/reach/reachable-targets-resolver";

export type { GeopoliticalReachTier, ProximityTier };

export class GeopoliticalReachResolver {
  public static readonly SUPERPOWER_PERCENTAGE =
    GeopoliticalTierClassifier.SUPERPOWER_PERCENTAGE;
  public static readonly REGIONAL_PERCENTAGE =
    GeopoliticalTierClassifier.REGIONAL_PERCENTAGE;
  public static readonly MIN_SUPERPOWERS =
    GeopoliticalTierClassifier.MIN_SUPERPOWERS;

  public static getSuperpowerCutoffRank(totalAlive: number): number {
    return GeopoliticalTierClassifier.getSuperpowerCutoffRank(totalAlive);
  }

  public static getRegionalCutoffRank(totalAlive: number): number {
    return GeopoliticalTierClassifier.getRegionalCutoffRank(totalAlive);
  }

  public static getReachTier(
    nation: Nation,
    allNations?: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
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
    provincesMap?: Record<string, Province>,
    sourceProvinces?: Province[],
    provincesByOwnerMap?: Map<string, Province[]>,
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
    provincesMap?: Record<string, Province>,
    rankMap?: Map<string, number>,
    sourceProvinces?: Province[],
    provincesByOwnerMap?: Map<string, Province[]>,
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

  public static canInitiateDiplomacy(
    source: Nation,
    target: Nation,
    allNations?: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    rankMap?: Map<string, number>,
  ): boolean {
    return ReachableTargetsResolver.canInitiateDiplomacy(
      source,
      target,
      allNations,
      provincesMap,
      rankMap,
    );
  }

  public static hasDirectLandBorder(
    source: Nation,
    target: Nation,
    provincesMap?: Record<string, Province>,
    sourceProvinces?: Province[],
    provincesByOwnerMap?: Map<string, Province[]>,
  ): boolean {
    return ProximityTierResolver.hasDirectLandBorder(
      source,
      target,
      provincesMap,
      sourceProvinces,
      provincesByOwnerMap,
    );
  }

  public static isImmediateMaritimeNeighbor(
    source: Nation,
    target: Nation,
    provincesMap?: Record<string, Province>,
    sourceProvinces?: Province[],
    provincesByOwnerMap?: Map<string, Province[]>,
  ): boolean {
    return ProximityTierResolver.isImmediateMaritimeNeighbor(
      source,
      target,
      provincesMap,
      sourceProvinces,
      provincesByOwnerMap,
    );
  }

  public static hasRegionalMaritimeConnection(
    source: Nation,
    target: Nation,
    provincesMap?: Record<string, Province>,
    sourceProvinces?: Province[],
    provincesByOwnerMap?: Map<string, Province[]>,
  ): boolean {
    return ProximityTierResolver.hasRegionalMaritimeConnection(
      source,
      target,
      provincesMap,
      sourceProvinces,
      provincesByOwnerMap,
    );
  }
}
