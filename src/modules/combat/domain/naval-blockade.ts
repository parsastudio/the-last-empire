import type { Nation } from "@/core/types/nation.types";

export class NavalBlockadeManager {
  public isBlockadeEffective(enemyNavy: number, targetNavy: number): boolean {
    return enemyNavy > targetNavy * 1.5;
  }

  public applyBlockadeEffect(nation: Nation, isBlockaded: boolean): number {
    if (!isBlockaded) {
      return nation.gdp;
    }
    return Math.floor(nation.gdp * 0.6);
  }
}
