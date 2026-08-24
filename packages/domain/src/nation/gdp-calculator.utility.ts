import { Province } from "@/domain/province/province.schema";
import { CountryRegistry } from "@/domain/data/countries";

export function getProvinceGdp(province: {
  population: number;
  perCapitaProductivity?: number;
}): number {
  const prod = province.perCapitaProductivity ?? 5000;
  return Math.floor(province.population * prod);
}

export function getNationGdp(
  nationOrId: { id: string } | string,
  provincesMap?: Record<string, Province> | Province[],
  ownedProvinces?: Province[],
  provincesByOwnerMap?: Map<string, Province[]>,
): number {
  const nationId = typeof nationOrId === "string" ? nationOrId : nationOrId.id;
  const canonicalId = CountryRegistry.resolveCanonicalId(nationId);

  if (ownedProvinces) {
    let total = 0;
    for (let i = 0; i < ownedProvinces.length; i++) {
      total += getProvinceGdp(ownedProvinces[i]!);
    }
    return total;
  }

  if (provincesByOwnerMap) {
    const provs =
      provincesByOwnerMap.get(canonicalId) ??
      provincesByOwnerMap.get(nationId) ??
      [];
    let total = 0;
    for (let i = 0; i < provs.length; i++) {
      total += getProvinceGdp(provs[i]!);
    }
    return total;
  }

  if (!provincesMap) return 0;
  let totalGdp = 0;

  if (Array.isArray(provincesMap)) {
    for (let i = 0; i < provincesMap.length; i++) {
      const p = provincesMap[i]!;
      if (CountryRegistry.resolveCanonicalId(p.ownerNationId) === canonicalId) {
        totalGdp += getProvinceGdp(p);
      }
    }
  } else {
    for (const key in provincesMap) {
      const p = provincesMap[key]!;
      if (CountryRegistry.resolveCanonicalId(p.ownerNationId) === canonicalId) {
        totalGdp += getProvinceGdp(p);
      }
    }
  }

  return totalGdp;
}
