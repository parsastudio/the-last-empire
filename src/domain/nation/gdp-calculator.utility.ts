export function getNationGdp(nation: {
  population: number;
  perCapitaProductivity?: number;
}): number {
  const prod = nation.perCapitaProductivity ?? 5000;
  return Math.floor(nation.population * prod);
}

export function getRegionGdp(
  region: { population: number },
  perCapitaProductivity: number,
): number {
  return Math.floor(region.population * perCapitaProductivity);
}
