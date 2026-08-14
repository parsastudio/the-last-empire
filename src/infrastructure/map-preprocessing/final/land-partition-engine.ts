import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import { ALL_COUNTRY_PROFILES } from "@/domain/data/countries";
import { WaterBodyClassifier } from "@/infrastructure/map-preprocessing/final/water-body-classifier";
import { IslandTerritoryResolver } from "@/infrastructure/map-preprocessing/final/island-territory-resolver";
import { LandWatershedFlood } from "@/infrastructure/map-preprocessing/final/algorithms/land-watershed-flood";

export interface LandPartitionResult {
  activeCountryIds: Set<number>;
  pixelAreaMap: Map<number, number>;
  consolidatedNationGrid: Uint8Array;
}

export class LandPartitionEngine {
  public static partitionAndConsolidate(
    rawNationGrid: Uint8Array,
    width: number,
    height: number,
    bitBuffer: BitPackedBuffer,
  ): LandPartitionResult {
    const validNationIds = new Set<number>();
    for (const profile of ALL_COUNTRY_PROFILES) {
      if (profile.id && profile.id >= 11 && profile.id < 250) {
        validNationIds.add(profile.id);
      }
    }

    const assignmentGrid = LandWatershedFlood.flood(
      rawNationGrid,
      width,
      height,
      validNationIds,
    );

    IslandTerritoryResolver.processIsolatedIslands(
      assignmentGrid,
      width,
      height,
      validNationIds,
    );

    WaterBodyClassifier.classifyOceanAndLakes(
      assignmentGrid,
      width,
      height,
      bitBuffer,
    );

    const activeCountryIds = new Set<number>();
    const pixelAreaMap = new Map<number, number>();

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const nationId = assignmentGrid[y * width + x]!;
        if (nationId >= 11 && nationId < 250) {
          activeCountryIds.add(nationId);
          pixelAreaMap.set(nationId, (pixelAreaMap.get(nationId) || 0) + 1);
        }
      }
    }

    return {
      activeCountryIds,
      pixelAreaMap,
      consolidatedNationGrid: assignmentGrid,
    };
  }
}
