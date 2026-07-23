export interface AnalyzeConnectivityResult {
  contiguousMainlandSize: number;
  contiguousMainlandIds: string[];
  isolatedPockets: {
    id: string;
    territorySize: number;
    territoryIds: string[];
  }[];
}

export class ConnectivityGraph {
  public analyzeConnectivity(
    ownedTerritories: { id: string; size: number }[],
    neighborsMap: Record<string, string[]>,
    capitalId: string,
  ): AnalyzeConnectivityResult {
    if (ownedTerritories.length === 0) {
      return {
        contiguousMainlandSize: 0,
        contiguousMainlandIds: [],
        isolatedPockets: [],
      };
    }

    const ownedSet = new Set(ownedTerritories.map((t) => t.id));
    const visited = new Set<string>();
    const components: string[][] = [];

    for (const territory of ownedTerritories) {
      if (!visited.has(territory.id)) {
        const component: string[] = [];
        const queue: string[] = [territory.id];
        visited.add(territory.id);

        while (queue.length > 0) {
          const current = queue.shift()!;
          component.push(current);

          const neighbors = neighborsMap[current] || [];
          for (const neighbor of neighbors) {
            if (ownedSet.has(neighbor) && !visited.has(neighbor)) {
              visited.add(neighbor);
              queue.push(neighbor);
            }
          }
        }
        components.push(component);
      }
    }

    let mainlandIndex = -1;
    if (capitalId && ownedSet.has(capitalId)) {
      mainlandIndex = components.findIndex((comp) => comp.includes(capitalId));
    }

    if (mainlandIndex === -1) {
      let maxArea = -1;
      for (let i = 0; i < components.length; i++) {
        const comp = components[i]!;
        const compArea = comp.reduce((acc, tId) => {
          const found = ownedTerritories.find((t) => t.id === tId);
          return acc + (found ? found.size : 0);
        }, 0);

        if (compArea > maxArea) {
          maxArea = compArea;
          mainlandIndex = i;
        }
      }
    }

    const mainlandIds = components[mainlandIndex] || [];
    const pocketComponents = components.filter(
      (_, idx) => idx !== mainlandIndex,
    );

    const contiguousMainlandSize = mainlandIds.reduce((acc, tId) => {
      const found = ownedTerritories.find((t) => t.id === tId);
      return acc + (found ? found.size : 0);
    }, 0);

    const isolatedPockets = pocketComponents.map((comp, idx) => {
      const territorySize = comp.reduce((acc, tId) => {
        const found = ownedTerritories.find((t) => t.id === tId);
        return acc + (found ? found.size : 0);
      }, 0);

      return {
        id: `pocket-${idx}-${Date.now()}`,
        territorySize,
        territoryIds: comp,
      };
    });

    return {
      contiguousMainlandSize,
      contiguousMainlandIds: mainlandIds,
      isolatedPockets,
    };
  }
}
