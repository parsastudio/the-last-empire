import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import { NationIdResolver } from "@/domain/shared/domain-utilities";

export interface BitPackedNeighborResult {
  landNeighborsMap: Map<number, Set<number>>;
  oceanAccessMap: Map<number, boolean>;
}

export class BitPackedNeighborDetector {
  public detectNeighbors(buffer: BitPackedBuffer): BitPackedNeighborResult {
    const width = buffer.getWidth();
    const height = buffer.getHeight();

    const landNeighborsMap = new Map<number, Set<number>>();
    const oceanAccessMap = new Map<number, boolean>();

    const neighbors = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
    ];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const nationId = buffer.getNationId(x, y);

        if (nationId < 11 || nationId >= 250) {
          continue;
        }

        if (!landNeighborsMap.has(nationId)) {
          landNeighborsMap.set(nationId, new Set<number>());
        }

        for (let k = 0; k < 4; k++) {
          const nx = (x + neighbors[k]!.dx + width) % width;
          const ny = y + neighbors[k]!.dy;

          if (ny >= 0 && ny < height) {
            const neighborNation = buffer.getNationId(nx, ny);

            if (neighborNation === 0) {
              oceanAccessMap.set(nationId, true);
            } else if (
              neighborNation >= 11 &&
              neighborNation < 250 &&
              neighborNation !== nationId
            ) {
              landNeighborsMap.get(nationId)!.add(neighborNation);
            }
          }
        }
      }
    }

    return { landNeighborsMap, oceanAccessMap };
  }

  public resolveCanonicalNeighbors(
    numericNeighbors: Set<number>,
    nations: Record<string, unknown>,
  ): string[] {
    const result: string[] = [];

    for (const numId of numericNeighbors) {
      const canonical = NationIdResolver.resolveCanonicalId(numId);
      if (nations[canonical] || nations[`NATION_${numId}`]) {
        result.push(canonical);
      }
    }

    return result;
  }
}
