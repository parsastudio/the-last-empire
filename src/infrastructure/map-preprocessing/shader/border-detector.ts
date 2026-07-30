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
      if (dynamicIds && dynamicIds[py * width + px]! > 0) {
        return dynamicIds[py * width + px]!;
      }
      const pIdx = (py * width + px) * 4;
      return srcData[pIdx + 2] || 0;
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
