export class BorderDetector {
  public isSovereignBorder(
    x: number,
    y: number,
    width: number,
    height: number,
    id: number,
    idx: number,
    srcData: Uint8ClampedArray,
    dynamicIds?: Uint16Array | null,
  ): boolean {
    const getOwnerAt = (px: number, py: number): number => {
      const pIdx = (py * width + px) * 4;
      const original = srcData[pIdx + 2] || 0;
      if (
        dynamicIds &&
        dynamicIds[py * width + px]! > 0 &&
        original >= 11 &&
        original < 250
      ) {
        return dynamicIds[py * width + px]!;
      }
      return original;
    };

    const currentOwner = getOwnerAt(x, y);

    if (x < width - 1) {
      const rightOwner = getOwnerAt(x + 1, y);
      if (
        rightOwner !== currentOwner &&
        ((currentOwner >= 11 && currentOwner < 250) ||
          (rightOwner >= 11 && rightOwner < 250))
      ) {
        return true;
      }
    }

    if (y < height - 1) {
      const bottomOwner = getOwnerAt(x, y + 1);
      if (
        bottomOwner !== currentOwner &&
        ((currentOwner >= 11 && currentOwner < 250) ||
          (bottomOwner >= 11 && bottomOwner < 250))
      ) {
        return true;
      }
    }

    return false;
  }
}
