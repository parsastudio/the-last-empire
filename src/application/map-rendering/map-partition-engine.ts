import { PARTITION_COUNTRIES_LIST } from "./partition-config";

interface CountryMapping {
  id: number;
  code: string;
  name: string;
  color: [number, number, number];
  areaSqKm: number;
}

export class MapPartitionEngine {
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

    const seeds: number[] = [];
    const seedOwner = new Uint8Array(width * height);
    const visited = new Uint8Array(width * height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const id = resultBuffer[idx]!;
        if (removedIds.has(id)) {
          const neighbors = [
            x > 0 ? idx - 1 : -1,
            x < width - 1 ? idx + 1 : -1,
            y > 0 ? idx - width : -1,
            y < height - 1 ? idx + width : -1,
          ];
          for (const nIdx of neighbors) {
            if (nIdx !== -1) {
              const nId = resultBuffer[nIdx]!;
              if (nId >= 11 && !removedIds.has(nId)) {
                seeds.push(idx);
                seedOwner[idx] = nId;
                visited[idx] = 1;
                break;
              }
            }
          }
        }
      }
    }

    let head = 0;
    while (head < seeds.length) {
      const idx = seeds[head]!;
      head++;

      const owner = seedOwner[idx]!;
      resultBuffer[idx] = owner;

      const x = idx % width;
      const y = Math.floor(idx / width);

      const neighbors = [
        x > 0 ? idx - 1 : -1,
        x < width - 1 ? idx + 1 : -1,
        y > 0 ? idx - width : -1,
        y < height - 1 ? idx + width : -1,
      ];

      for (const nIdx of neighbors) {
        if (nIdx !== -1 && visited[nIdx] === 0) {
          const nId = resultBuffer[nIdx]!;
          if (removedIds.has(nId)) {
            visited[nIdx] = 1;
            seedOwner[nIdx] = owner;
            seeds.push(nIdx);
          }
        }
      }
    }

    return resultBuffer;
  }
}
