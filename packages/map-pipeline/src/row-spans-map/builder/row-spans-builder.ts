import { BuiltRowSpans } from "@/infrastructure/row-spans-map/core/row-spans-types";

export class RowSpansBuilder {
  public static build(
    data: Uint16Array,
    mapWidth: number,
    mapHeight: number,
  ): BuiltRowSpans {
    const rowOffsets = new Uint32Array(mapHeight + 1);
    const spansList: number[] = [];

    let minSpans = Infinity;
    let maxSpans = 0;

    for (let y = 0; y < mapHeight; y++) {
      rowOffsets[y] = spansList.length;
      const rowOffset = y * mapWidth;

      let currentPid = data[rowOffset]! & 0x0fff;
      let rowSpanCount = 0;

      for (let x = 1; x < mapWidth; x++) {
        const pid = data[rowOffset + x]! & 0x0fff;
        if (pid !== currentPid) {
          const packed = (((x - 1) & 0xffff) << 16) | (currentPid & 0xffff);
          spansList.push(packed >>> 0);
          rowSpanCount++;
          currentPid = pid;
        }
      }

      const lastPacked =
        (((mapWidth - 1) & 0xffff) << 16) | (currentPid & 0xffff);
      spansList.push(lastPacked >>> 0);
      rowSpanCount++;

      if (rowSpanCount < minSpans) minSpans = rowSpanCount;
      if (rowSpanCount > maxSpans) maxSpans = rowSpanCount;
    }

    rowOffsets[mapHeight] = spansList.length;

    const packedSpans = new Uint32Array(spansList);

    return {
      rowOffsets,
      packedSpans,
      minSpansPerRow: minSpans === Infinity ? 0 : minSpans,
      maxSpansPerRow: maxSpans,
      totalSpans: spansList.length,
    };
  }
}
