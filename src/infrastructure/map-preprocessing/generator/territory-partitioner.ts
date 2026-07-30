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
    idToCodeMap: Map<number, string>,
  ): Uint8Array {
    const partitionCodes = new Set(
      PARTITION_COUNTRIES_LIST.map((c) => c.toUpperCase()),
    );

    const removedIds = new Set<number>();
    for (const [id, code] of idToCodeMap.entries()) {
      if (partitionCodes.has(code.toUpperCase())) {
        removedIds.add(id);
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
