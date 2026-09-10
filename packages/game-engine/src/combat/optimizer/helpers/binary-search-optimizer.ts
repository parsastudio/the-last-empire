export class BinarySearchOptimizer {
  public static findMinimalPassing(
    low: number,
    high: number,
    predicate: (value: number) => boolean,
  ): number {
    let optimal = high;
    let l = low;
    let r = high;

    while (l <= r) {
      const mid = Math.floor((l + r) / 2);
      if (predicate(mid)) {
        optimal = mid;
        r = mid - 1;
      } else {
        l = mid + 1;
      }
    }

    return optimal;
  }
}
