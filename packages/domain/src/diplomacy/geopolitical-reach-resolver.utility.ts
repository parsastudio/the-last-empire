import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { LandNeighborResolver } from "@/domain/map/land-neighbor-resolver";

export type GeopoliticalReachTier =
  | "SUPERPOWER"
  | "REGIONAL_POWER"
  | "LOCAL_POWER";

export class GeopoliticalReachResolver {
  public static readonly MAP_WIDTH = 4096;
  public static readonly LOCAL_MARITIME_THRESHOLD_PX = 120;
  public static readonly REGIONAL_RADIUS_THRESHOLD_PX = 650;
  public static readonly SUPERPOWER_PERCENTILE = 0.05;
  public static readonly SUPERPOWER_MIN_FLOOR = 3;
  public static readonly REGIONAL_PERCENTILE = 0.3;
  public static readonly REGIONAL_MIN_FLOOR = 8;

  public static getReachTier(
    nation: Nation,
    allNations: Record<string, Nation> | Nation[],
  ): GeopoliticalReachTier {
    const nationList = Array.isArray(allNations)
      ? allNations
      : Object.values(allNations);

    const aliveNations = nationList.filter((n) => n.isAlive);
    const aliveCount = Math.max(1, aliveNations.length);

    const superpowerCutoff = Math.max(
      this.SUPERPOWER_MIN_FLOOR,
      Math.ceil(aliveCount * this.SUPERPOWER_PERCENTILE),
    );

    if (nation.rank <= superpowerCutoff) {
      return "SUPERPOWER";
    }

    const regionalCutoff = Math.max(
      this.REGIONAL_MIN_FLOOR,
      Math.ceil(aliveCount * this.REGIONAL_PERCENTILE),
    );

    if (nation.rank <= regionalCutoff) {
      return "REGIONAL_POWER";
    }

    return "LOCAL_POWER";
  }

  public static calculateProvinceDistance(p1: Province, p2: Province): number {
    const rawDx = Math.abs(p1.centerCoordinates.x - p2.centerCoordinates.x);
    const deltaX = Math.min(rawDx, this.MAP_WIDTH - rawDx);
    const deltaY = Math.abs(p1.centerCoordinates.y - p2.centerCoordinates.y);
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }

  public static calculateMinimumDistance(
    source: Nation,
    target: Nation,
    provincesMap?: Record<string, Province>,
    coastalOnly: boolean = false,
  ): number {
    if (!provincesMap) {
      return 1000;
    }

    const sourceCanonical = CountryRegistry.resolveCanonicalId(source.id);
    const targetCanonical = CountryRegistry.resolveCanonicalId(target.id);

    const sourceProvinces = Object.values(provincesMap).filter((p) => {
      const owner = CountryRegistry.resolveCanonicalId(p.ownerNationId);
      return owner === sourceCanonical && (!coastalOnly || p.hasSeaAccess);
    });

    const targetProvinces = Object.values(provincesMap).filter((p) => {
      const owner = CountryRegistry.resolveCanonicalId(p.ownerNationId);
      return owner === targetCanonical && (!coastalOnly || p.hasSeaAccess);
    });

    if (sourceProvinces.length === 0 || targetProvinces.length === 0) {
      return Infinity;
    }

    let minDistance = Infinity;

    for (let i = 0; i < sourceProvinces.length; i++) {
      const sp = sourceProvinces[i]!;
      for (let j = 0; j < targetProvinces.length; j++) {
        const tp = targetProvinces[j]!;
        const dist = this.calculateProvinceDistance(sp, tp);
        if (dist < minDistance) {
          minDistance = dist;
        }
      }
    }

    return minDistance;
  }

  public static isImmediateMaritimeNeighbor(
    source: Nation,
    target: Nation,
    provincesMap?: Record<string, Province>,
  ): boolean {
    if (!source.geography.hasSeaAccess || !target.geography.hasSeaAccess) {
      return false;
    }

    if (!provincesMap) {
      return source.geography.seaNeighbors.includes(target.id);
    }

    const minCoastalDist = this.calculateMinimumDistance(
      source,
      target,
      provincesMap,
      true,
    );

    return minCoastalDist <= this.LOCAL_MARITIME_THRESHOLD_PX;
  }

  public static hasDirectLandBorder(
    source: Nation,
    target: Nation,
    provincesMap?: Record<string, Province>,
  ): boolean {
    if (!provincesMap) {
      return source.geography.landNeighbors.includes(target.id);
    }

    const targetCanonical = CountryRegistry.resolveCanonicalId(target.id);

    for (const prov of Object.values(provincesMap)) {
      if (
        CountryRegistry.resolveCanonicalId(prov.ownerNationId) ===
        targetCanonical
      ) {
        if (
          LandNeighborResolver.hasProvinceLandBorder(
            prov.provinceId,
            source.id,
            provincesMap,
          )
        ) {
          return true;
        }
      }
    }

    return false;
  }

  public static isReachable(
    source: Nation,
    target: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
  ): boolean {
    if (source.id === target.id) return true;

    const tier = this.getReachTier(source, allNations);

    if (tier === "SUPERPOWER") {
      return true;
    }

    if (this.hasDirectLandBorder(source, target, provincesMap)) {
      return true;
    }

    if (this.isImmediateMaritimeNeighbor(source, target, provincesMap)) {
      return true;
    }

    if (tier === "REGIONAL_POWER") {
      const minDistance = this.calculateMinimumDistance(
        source,
        target,
        provincesMap,
        false,
      );
      return minDistance <= this.REGIONAL_RADIUS_THRESHOLD_PX;
    }

    return false;
  }

  public static canInitiateDiplomacy(
    source: Nation,
    target: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
  ): boolean {
    return this.isReachable(source, target, allNations, provincesMap);
  }
}
