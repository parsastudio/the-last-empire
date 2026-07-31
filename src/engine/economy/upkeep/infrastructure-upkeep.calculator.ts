import { Nation } from "@/domain/nation/nation.schema";

export class InfrastructureUpkeepCalculator {
  public calculateInfrastructureCost(
    nation: Nation,
    baseInfraUpkeepRate: number,
  ): number {
    const baseInfraUpkeep =
      nation.geography.infrastructureLevel * baseInfraUpkeepRate * 15000;

    const sizeFactor = 1 + Math.log10(nation.geography.territorySize + 1) * 0.5;

    return Math.floor(baseInfraUpkeep * sizeFactor);
  }
}
