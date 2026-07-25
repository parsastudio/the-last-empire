export class GridTerrainModifier {
  public getTerrainDefenseMultiplier(y: number): number {
    const isPolar = y < 100 || y > 412;
    if (isPolar) {
      return 1.4;
    }

    const isEquatorial = y > 200 && y < 312;
    if (isEquatorial) {
      return 1.1;
    }

    return 1.0;
  }
}
