import { Province } from "@/domain/province/province.schema";

export function getProvinceGdp(province: {
  population: number;
  perCapitaProductivity?: number;
}): number {
  const prod = province.perCapitaProductivity ?? 5000;
  return Math.floor(province.population * prod);
}

export function getNationGdp(
  nation: {
    population: number;
    perCapitaProductivity?: number;
    provinceIds?: number[];
  },
  provincesMap?: Record<string, Province>,
): number {
  if (provincesMap && nation.provinceIds && nation.provinceIds.length > 0) {
    let totalGdp = 0;
    for (let i = 0; i < nation.provinceIds.length; i++) {
      const pid = nation.provinceIds[i]!;
      const prov = provincesMap[pid.toString()];
      if (prov) {
        totalGdp += getProvinceGdp(prov);
      }
    }
    if (totalGdp > 0) {
      return totalGdp;
    }
  }
  const prod = nation.perCapitaProductivity ?? 5000;
  return Math.floor(nation.population * prod);
}
