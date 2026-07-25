export class GridStateIntegrityChecker {
  public isIntegrityValid(serialized: string): boolean {
    if (!serialized) {
      return false;
    }
    const parts = serialized.split("|");
    return parts.every((p) => {
      const segments = p.split(":");
      return segments.length === 6;
    });
  }
}
