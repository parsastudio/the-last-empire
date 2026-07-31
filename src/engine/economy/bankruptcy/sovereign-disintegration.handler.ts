import { Nation } from "@/domain/nation/nation.schema";

export class SovereignDisintegrationHandler {
  public applyDisintegration(
    nation: Nation,
    allNations: Record<string, Nation>,
  ): { updatedNation: Nation; updatedAllNations: Record<string, Nation> } {
    const territoryLoss = Math.floor(nation.geography.territorySize * 0.25);
    const popLoss = Math.floor(nation.population * 0.2);

    const updatedNation = {
      ...nation,
      geography: {
        ...nation.geography,
        territorySize: Math.max(
          10,
          nation.geography.territorySize - territoryLoss,
        ),
      },
      population: Math.max(10000, nation.population - popLoss),
      consecutiveDeficitTurns: 0,
    };

    return { updatedNation, updatedAllNations: allNations };
  }
}
