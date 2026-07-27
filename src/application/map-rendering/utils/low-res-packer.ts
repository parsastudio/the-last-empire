export class LowResPacker {
  public pack4KTo1024(
    bytes: Uint8Array,
    lowResWidth = 1024,
    lowResHeight = 512,
    scale = 4,
  ): Uint8Array {
    const packed1024 = new Uint8Array(lowResWidth * lowResHeight * 2);
    for (let gy = 0; gy < lowResHeight; gy++) {
      for (let gx = 0; gx < lowResWidth; gx++) {
        let hasForcedPassage = false;
        const countryCounts = new Map<number, number>();
        const waterCounts = new Int32Array(11);
        for (let sy = 0; sy < scale; sy++) {
          for (let sx = 0; sx < scale; sx++) {
            const hx = gx * scale + sx;
            const hy = gy * scale + sy;
            const val = bytes[hy * 4096 + hx] ?? 0;
            if (val === 254) {
              hasForcedPassage = true;
            } else if (val >= 11) {
              countryCounts.set(val, (countryCounts.get(val) ?? 0) + 1);
            } else {
              waterCounts[val]++;
            }
          }
        }
        let finalB = 0;
        let finalR = 0;
        if (hasForcedPassage) {
          finalB = 0;
          finalR = 1;
        } else {
          let maxCountryCount = 0;
          for (const [id, count] of countryCounts.entries()) {
            if (count > maxCountryCount) {
              maxCountryCount = count;
              finalB = id;
            }
          }
          if (finalB === 0) {
            let maxWaterCount = 0;
            for (let w = 0; w < 11; w++) {
              if (waterCounts[w] > maxWaterCount) {
                maxWaterCount = waterCounts[w];
                finalR = w;
              }
            }
          }
        }
        const pIdx = (gy * lowResWidth + gx) * 2;
        packed1024[pIdx] = (0 << 2) | (finalR & 0x3);
        packed1024[pIdx + 1] = finalB;
      }
    }
    return packed1024;
  }
}
