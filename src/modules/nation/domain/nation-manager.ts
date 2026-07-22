import type { Nation } from "@/core/types";

export class NationManager {
  public getTotalArmyCount(nation: Nation): number {
    return (
      nation.military.infantry +
      nation.military.airForce +
      nation.military.navy +
      nation.military.droneMissile
    );
  }

  public isHealthy(nation: Nation): boolean {
    return (
      nation.isAlive &&
      nation.government.stability > 30 &&
      nation.treasury >= 0 &&
      nation.population > 100000
    );
  }

  public getFlagUrl(nation: Nation): string {
    return `/flags/${nation.flagCode.toLowerCase()}.png`;
  }
}
