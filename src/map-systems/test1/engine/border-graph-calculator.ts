import type { Province } from "@/domain/map/province.schema";

export class BorderGraphCalculator {
  public calculateActiveBorders(
    nationId: string,
    allProvinces: Record<string, Province>,
    staticAdjacencyList: Record<string, string[]>,
  ): string[] {
    const ownedProvinceIds = Object.values(allProvinces)
      .filter((p) => p.ownerNationId === nationId)
      .map((p) => p.id);

    const adjacentNations = new Set<string>();

    ownedProvinceIds.forEach((provId) => {
      const neighbors = staticAdjacencyList[provId] || [];
      neighbors.forEach((neighborId) => {
        const neighborProvince = allProvinces[neighborId];
        if (neighborProvince) {
          if (neighborProvince.ownerNationId !== nationId) {
            adjacentNations.add(neighborProvince.ownerNationId);
          }
        } else {
          adjacentNations.add(neighborId);
        }
      });
    });

    return Array.from(adjacentNations);
  }
}
