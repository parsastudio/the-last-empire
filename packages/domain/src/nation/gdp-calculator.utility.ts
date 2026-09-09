import { ProvinceDynamicState } from "@/domain/province/province.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { IndustryCalculator } from "@/domain/economy/industry-calculator.utility";
import { FactoryBatch } from "@/domain/economy/factory-batch.schema";

export function getProvinceGdp(
  province: {
    factoriesCount?: number;
    factoryTiers?: FactoryBatch[];
  },
  equipmentTechLevel = 1.0,
): number {
  return IndustryCalculator.calculateProvinceGdp(province, equipmentTechLevel);
}

export function getNationGdp(
  nationOrId: { id: string; equipmentTechLevel?: number } | string,
  provincesMap?: Record<string, ProvinceDynamicState> | ProvinceDynamicState[],
  ownedProvinces?: ProvinceDynamicState[],
  provincesByOwnerMap?: Map<string, ProvinceDynamicState[]>,
): number {
  const nationId = typeof nationOrId === "string" ? nationOrId : nationOrId.id;
  const canonicalId = CountryRegistry.resolveCanonicalId(nationId);
  const equipmentTech =
    typeof nationOrId !== "string"
      ? (nationOrId.equipmentTechLevel ?? 1.0)
      : 1.0;

  if (ownedProvinces) {
    let total = 0;
    for (let i = 0; i < ownedProvinces.length; i++) {
      total += getProvinceGdp(ownedProvinces[i]!, equipmentTech);
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
      total += getProvinceGdp(provs[i]!, equipmentTech);
    }
    return total;
  }

  if (!provincesMap) return 0;
  let totalGdp = 0;

  if (Array.isArray(provincesMap)) {
    for (let i = 0; i < provincesMap.length; i++) {
      const p = provincesMap[i]!;
      if (CountryRegistry.resolveCanonicalId(p.ownerNationId) === canonicalId) {
        totalGdp += getProvinceGdp(p, equipmentTech);
      }
    }
  } else {
    for (const key in provincesMap) {
      const p = provincesMap[key]!;
      if (CountryRegistry.resolveCanonicalId(p.ownerNationId) === canonicalId) {
        totalGdp += getProvinceGdp(p, equipmentTech);
      }
    }
  }

  return totalGdp;
}
