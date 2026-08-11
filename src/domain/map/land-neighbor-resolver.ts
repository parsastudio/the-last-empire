import { CountryRegistry } from "@/domain/data/countries";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";

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

    return false;
  }
}
