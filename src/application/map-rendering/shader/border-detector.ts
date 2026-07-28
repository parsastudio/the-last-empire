export class BorderDetector {
  public isSovereignBorder(
    x: number,
    y: number,
    width: number,
    height: number,
    id: number,
    idx: number,
    srcData: Uint8ClampedArray,
  ): boolean {
    if (x < width - 1) {
      const rightId = srcData[idx + 4 + 2] || 0;
      if (
        rightId !== id &&
        ((id >= 11 && id < 250) || (rightId >= 11 && rightId < 250))
      ) {
        return true;
      }
    }
    if (y < height - 1) {
      const bottomId = srcData[idx + width * 4 + 2] || 0;
      if (
        bottomId !== id &&
        ((id >= 11 && id < 250) || (bottomId >= 11 && bottomId < 250))
      ) {
        return true;
      }
    }
    return false;
  }
}
