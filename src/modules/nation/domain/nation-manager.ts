import type { Nation } from "../schemas/nation.schema";

export class NationManager {
  public getTotalArmyCount(nation: Nation): number {
    return (
      nation.military.infantry +
      nation.military.airForce +
      nation.military.droneMissile
    );
  }

  public getTotalMilitaryPower(nation: Nation): number {
    return (
      nation.military.infantry * 1.0 +
      nation.military.airForce * 3.0 +
      nation.military.droneMissile * 2.5
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
