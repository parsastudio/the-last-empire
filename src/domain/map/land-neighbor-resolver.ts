import { CountryRegistry } from "@/domain/data/countries";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";

const REAL_WORLD_LAND_NEIGHBOR_MAP: Record<number, number[]> = {
  14: [15],
  15: [14, 38],
  118: [120, 135, 98, 113, 114, 117, 156],
  120: [118, 135, 156, 29],
  135: [118, 120, 156, 119, 134, 133, 98],
  156: [118, 120, 135, 29],
  29: [156, 122, 123, 16, 108, 150, 106, 121, 162, 116, 117, 32],
  150: [29, 108, 106, 109, 110, 113, 114, 115, 116, 105, 102],
  109: [150, 113, 110, 114, 149],
  113: [118, 109, 114, 150],
  114: [118, 113, 117, 150],
  98: [118, 135, 119, 94, 169, 97],
  119: [135, 98, 88, 87, 94],
  169: [98, 94, 95, 96, 97, 99, 168],
  123: [29, 122, 124, 128, 126, 163],
  124: [123, 122, 132, 164, 163, 29],
  132: [54, 140, 141, 138, 125, 164, 124, 153],
  54: [132, 140, 143, 138, 152],
  143: [54, 142],
  38: [15, 49],
  16: [29, 17, 116, 117, 150],
  17: [16, 116, 117, 114, 115],
  108: [29, 150],
};

export class LandNeighborResolver {
  public static hasProvinceLandBorder(
    targetProvinceId: number,
    attackerNationId: string,
    provincesMap?: Record<string, Province>,
  ): boolean {
    if (!provincesMap || !targetProvinceId) return false;
    const targetProv = provincesMap[targetProvinceId.toString()];
    if (!targetProv) return false;

    const canonicalAttacker =
      CountryRegistry.resolveCanonicalId(attackerNationId);

    return targetProv.landNeighbors.some((neighborId) => {
      const neighborProv = provincesMap[neighborId.toString()];
      if (!neighborProv) return false;
      const canonicalNeighborOwner = CountryRegistry.resolveCanonicalId(
        neighborProv.ownerNationId,
      );
      return (
        neighborProv.ownerNationId === attackerNationId ||
        canonicalNeighborOwner === canonicalAttacker
      );
    });
  }

  public static isLandNeighbor(
    nationA: Nation | string,
    nationB: Nation | string,
  ): boolean {
    const codeA = typeof nationA === "string" ? nationA : nationA.id;
    const codeB = typeof nationB === "string" ? nationB : nationB.id;

    if (codeA === codeB) return false;

    const canonicalA = CountryRegistry.resolveCanonicalId(codeA);
    const canonicalB = CountryRegistry.resolveCanonicalId(codeB);

    if (canonicalA === canonicalB) return false;

    if (typeof nationA !== "string" && nationA.geography?.landNeighbors) {
      const isDirectNeighbor = nationA.geography.landNeighbors.some((n) => {
        const neighborCanonical = CountryRegistry.resolveCanonicalId(n);
        return n === codeB || neighborCanonical === canonicalB;
      });
      if (isDirectNeighbor) return true;
    }

    if (typeof nationB !== "string" && nationB.geography?.landNeighbors) {
      const isDirectNeighbor = nationB.geography.landNeighbors.some((n) => {
        const neighborCanonical = CountryRegistry.resolveCanonicalId(n);
        return n === codeA || neighborCanonical === canonicalA;
      });
      if (isDirectNeighbor) return true;
    }

    const numA = CountryRegistry.resolveNumericId(canonicalA);
    const numB = CountryRegistry.resolveNumericId(canonicalB);

    if (numA > 0 && numB > 0) {
      const neighborsA = REAL_WORLD_LAND_NEIGHBOR_MAP[numA];
      if (neighborsA && neighborsA.includes(numB)) return true;

      const neighborsB = REAL_WORLD_LAND_NEIGHBOR_MAP[numB];
      if (neighborsB && neighborsB.includes(numA)) return true;
    }

    return false;
  }
}
