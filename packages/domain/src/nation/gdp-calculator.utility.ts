import { Province } from "@/domain/province/province.schema";
import { NationGettersUtility } from "@/domain/nation/nation-getters.utility";

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
): number {
  const nationId = typeof nationOrId === "string" ? nationOrId : nationOrId.id;
  const provs = NationGettersUtility.getOwnedProvinces(nationId, provincesMap);
  if (provs.length === 0) return 0;
  return provs.reduce((sum, p) => sum + getProvinceGdp(p), 0);
}
