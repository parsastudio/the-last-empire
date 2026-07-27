import { Nation } from "@/domain/nation/nation.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";
import { findCountryProfileById } from "@/domain/map/countries";

export class GdpPopUpdater {
  public syncGlobalStats(
    nations: Record<string, Nation>,
    allCells: GridCell[],
  ): Record<string, Nation> {
    const updated = { ...nations };

    const totalPixelsMap = new Map<string, number>();
    const freePixelsMap = new Map<string, number>();
    const occupiedLootMap = new Map<string, Map<string, number>>();

    for (const cell of allCells) {
      const owner = cell.ownerId;
      if (owner === "WATER" || owner === "CLOSED_SEA") {
        continue;
      }

      const pixels = cell.highResPixelCount;
      totalPixelsMap.set(owner, (totalPixelsMap.get(owner) || 0) + pixels);

      if (!cell.isOccupied) {
        freePixelsMap.set(owner, (freePixelsMap.get(owner) || 0) + pixels);
      } else if (cell.occupierId) {
        const occupier = cell.occupierId;
        if (!occupiedLootMap.has(occupier)) {
          occupiedLootMap.set(occupier, new Map<string, number>());
        }
        const nationLoot = occupiedLootMap.get(occupier)!;
        nationLoot.set(owner, (nationLoot.get(owner) || 0) + pixels);
      }
    }

    for (const [id, nation] of Object.entries(updated)) {
      const numericId = parseInt(id.replace("NATION_", ""), 10);
      const profile = findCountryProfileById(numericId);

      let baseGdp = profile ? profile.gdp : 5000000000;
      let basePop = profile ? profile.population : 80000000;

      const defaultArea = profile ? profile.territorySize : 1000;
      const currentMaxArea = nation.geography.territorySize;
      const areaScaleFactor = Math.sqrt(
        Math.max(1, currentMaxArea) / Math.max(1, defaultArea),
      );

      baseGdp = Math.round(baseGdp * areaScaleFactor);
      basePop = Math.round(basePop * areaScaleFactor);

      const totalPixels = totalPixelsMap.get(id) || 1;
      const freePixels = freePixelsMap.get(id) || 0;
      const freeRatio = freePixels / totalPixels;

      let currentGdp = Math.round(baseGdp * freeRatio);
      let currentPop = Math.round(basePop * freeRatio);

      const loot = occupiedLootMap.get(id);
      if (loot) {
        for (const [victimId, pixels] of loot.entries()) {
          const victimNumericId = parseInt(victimId.replace("NATION_", ""), 10);
          const victimProfile = findCountryProfileById(victimNumericId);

          let victimBaseGdp = victimProfile ? victimProfile.gdp : 5000000000;
          let victimBasePop = victimProfile
            ? victimProfile.population
            : 80000000;

          const victimNation = updated[victimId];
          const victimMaxArea = victimNation
            ? victimNation.geography.territorySize
            : 1000;
          const victimDefaultArea = victimProfile
            ? victimProfile.territorySize
            : 1000;
          const victimScale = Math.sqrt(
            Math.max(1, victimMaxArea) / Math.max(1, victimDefaultArea),
          );

          victimBaseGdp = Math.round(victimBaseGdp * victimScale);
          victimBasePop = Math.round(victimBasePop * victimScale);

          const victimTotalPixels = totalPixelsMap.get(victimId) || 1;
          const lootRatio = pixels / victimTotalPixels;

          currentGdp += Math.round(victimBaseGdp * lootRatio * 0.5);
          currentPop += Math.round(victimBasePop * lootRatio * 0.5);
        }
      }

      updated[id] = {
        ...nation,
        gdp: Math.max(0, currentGdp),
        population: Math.max(0, currentPop),
        isAlive: currentPop > 0 || freePixels > 0,
      };
    }

    return updated;
  }
}
