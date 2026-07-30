export class BorderDetector {
  public isSovereignBorder(
    x: number,
    y: number,
    width: number,
    height: number,
    currentOwner: number,
    maskData: Uint8Array,
    dynamicIds?: Uint16Array | null,
  ): boolean {
    const pixelIdx = y * width + x;

    if (x < width - 1) {
      const rightIdx = pixelIdx + 1;
      let rightOwner = maskData[rightIdx] || 0;
      if (
        dynamicIds &&
        dynamicIds[rightIdx]! > 0 &&
        rightOwner >= 11 &&
        rightOwner < 250
      ) {
        rightOwner = dynamicIds[rightIdx]!;
      }
      if (
        rightOwner !== currentOwner &&
        ((currentOwner >= 11 && currentOwner < 250) ||
          (rightOwner >= 11 && rightOwner < 250))
      ) {
        return true;
      }
    }

    if (y < height - 1) {
      const bottomIdx = pixelIdx + width;
      let bottomOwner = maskData[bottomIdx] || 0;
      if (
        dynamicIds &&
        dynamicIds[bottomIdx]! > 0 &&
        bottomOwner >= 11 &&
        bottomOwner < 250
      ) {
        bottomOwner = dynamicIds[bottomIdx]!;
      }
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
