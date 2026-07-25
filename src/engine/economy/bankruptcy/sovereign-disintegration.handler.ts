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

    const updatedAllNations = { ...allNations };
    const aliveLandNeighbors = nation.geography.landNeighbors.filter(
      (id) => allNations[id] && allNations[id].isAlive,
    );

    if (aliveLandNeighbors.length > 0) {
      const refugeesPerNeighbor = Math.floor(
        (popLoss * 0.05) / aliveLandNeighbors.length,
      );

      for (const neighborId of aliveLandNeighbors) {
        const neighbor = updatedAllNations[neighborId];
        if (neighbor) {
          updatedAllNations[neighborId] = {
            ...neighbor,
            population: neighbor.population + refugeesPerNeighbor,
            government: {
              ...neighbor.government,
              stability: Math.max(10, neighbor.government.stability - 15),
              corruption: Math.min(100, neighbor.government.corruption + 10),
            },
          };
        }
      }
    }

    return { updatedNation, updatedAllNations };
  }
}
