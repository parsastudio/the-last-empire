import { PARTITION_COUNTRIES_LIST } from "../config/partition-countries.config";
import { PartitionFrontierSearch } from "../partition/partition-frontier-search";
import { PartitionBfsExpander } from "../partition/partition-bfs-expander";

export class TerritoryPartitioner {
  private frontierSearch = new PartitionFrontierSearch();
  private bfsExpander = new PartitionBfsExpander();

  public partitionBuffer(
    buffer: Uint8Array,
    width: number,
    height: number,
    activeIdToCodeMap: Map<number, string>,
  ): Uint8Array {
    const partitionCodes = new Set(
      PARTITION_COUNTRIES_LIST.map((c) => c.toUpperCase()),
    );

    const activeIdsSet = new Set(activeIdToCodeMap.keys());
    const removedIds = new Set<number>();

    const totalPixels = width * height;
    for (let i = 0; i < totalPixels; i++) {
      const id = buffer[i]!;
      if (id >= 11 && id < 250) {
        if (!activeIdsSet.has(id)) {
          removedIds.add(id);
        } else {
          const code = activeIdToCodeMap.get(id);
          if (code && partitionCodes.has(code.toUpperCase())) {
            removedIds.add(id);
          }
        }
      }
    }

    if (removedIds.size === 0) {
      return buffer;
    }

    const { frontiers, visited } = this.frontierSearch.findInitialFrontiers(
      buffer,
      width,
      height,
      removedIds,
    );

    this.bfsExpander.expandFrontiers(
      buffer,
      width,
      height,
      frontiers,
      visited,
      removedIds,
    );

    return buffer;
  }
}
