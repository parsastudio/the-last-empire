import { CountryRegistry } from "@/domain/data/countries";
import { ProvinceDynamicState } from "@/domain/province/province.schema";
import { MapTopologyRegistry } from "@/domain/map/map-topology-registry";

export class LandNeighborResolver {
  public static hasProvinceLandBorder(
    targetProvinceId: number,
    attackerNationId: string,
    provincesMap?: Record<string, ProvinceDynamicState>,
  ): boolean {
    if (!provincesMap || !targetProvinceId) return false;
    const targetProv = provincesMap[targetProvinceId.toString()];
    if (!targetProv) return false;

    const canonicalAttacker =
      CountryRegistry.resolveCanonicalId(attackerNationId);

    const neighbors = MapTopologyRegistry.getLandNeighbors(targetProvinceId);

    return neighbors.some((neighborId) => {
      const neighborProv = provincesMap[neighborId.toString()];
      if (!neighborProv) return false;
      const canonicalNeighborOwner = CountryRegistry.resolveCanonicalId(
        neighborProv.ownerNationId,
      );
      return canonicalNeighborOwner === canonicalAttacker;
    });
  }
}
