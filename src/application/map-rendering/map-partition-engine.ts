import { PARTITION_COUNTRIES_LIST } from "./partition-config";
import { PartitionFrontierSearch } from "./partition/partition-frontier-search";
import { PartitionBfsExpander } from "./partition/partition-bfs-expander";

interface CountryMapping {
  id: number;
  code: string;
  name: string;
  color: [number, number, number];
  areaSqKm: number;
}

export class MapPartitionEngine {
  private frontierSearch = new PartitionFrontierSearch();
  private bfsExpander = new PartitionBfsExpander();

  public applyPartition(
    buffer: Uint8Array,
    width: number,
    height: number,
    countries: CountryMapping[],
  ): Uint8Array {
    const resultBuffer = new Uint8Array(buffer);
    const removedIds = new Set<number>();

    for (const country of countries) {
      if (PARTITION_COUNTRIES_LIST.includes(country.code)) {
        removedIds.add(country.id);
      }
    }

    if (removedIds.size === 0) {
      return resultBuffer;
    }

    const { frontiers, visited } = this.frontierSearch.findInitialFrontiers(
      resultBuffer,
      width,
      height,
      removedIds,
    );

    this.bfsExpander.expandFrontiers(
      resultBuffer,
      width,
      height,
      frontiers,
      visited,
      removedIds,
    );

    return resultBuffer;
  }
}
