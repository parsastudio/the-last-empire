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
    const currentOwner =
      dynamicIds && dynamicIds[y * width + x]! > 0
        ? dynamicIds[y * width + x]!
        : id;

    if (x < width - 1) {
      const rightOwner =
        dynamicIds && dynamicIds[y * width + x + 1]! > 0
          ? dynamicIds[y * width + x + 1]!
          : srcData[idx + 4 + 2] || 0;

      if (
        rightOwner !== currentOwner &&
        ((currentOwner >= 11 && currentOwner < 250) ||
          (rightOwner >= 11 && rightOwner < 250))
      ) {
        return true;
      }
    }

    if (y < height - 1) {
      const bottomOwner =
        dynamicIds && dynamicIds[(y + 1) * width + x]! > 0
          ? dynamicIds[(y + 1) * width + x]!
          : srcData[idx + width * 4 + 2] || 0;

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
