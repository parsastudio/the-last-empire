import { MainlandAnalyzer } from "./connectivity/mainland-analyzer";
import {
  IsolatedPocketIdentifier,
  IsolatedPocketResult,
} from "./connectivity/isolated-pocket-identifier";

export interface AnalyzeConnectivityResult {
  contiguousMainlandSize: number;
  contiguousMainlandIds: string[];
  isolatedPockets: IsolatedPocketResult[];
}

export class ConnectivityGraph {
  private mainlandAnalyzer = new MainlandAnalyzer();
  private pocketIdentifier = new IsolatedPocketIdentifier();

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
          const current = queue.shift();
          if (current) {
            component.push(current);
            const neighbors = neighborsMap[current] || [];
            for (const neighbor of neighbors) {
              if (ownedSet.has(neighbor) && !visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
              }
            }
          }
        }
        components.push(component);
      }
    }

    const mainlandIndex = this.mainlandAnalyzer.findMainlandIndex(
      components,
      ownedSet,
      capitalId,
      ownedTerritories,
    );

    const mainlandIds = components[mainlandIndex] || [];
    const pocketComponents = components.filter(
      (_, idx) => idx !== mainlandIndex,
    );

    const contiguousMainlandSize = mainlandIds.reduce((acc, tId) => {
      const found = ownedTerritories.find((t) => t.id === tId);
      return acc + (found ? found.size : 0);
    }, 0);

    const isolatedPockets = this.pocketIdentifier.identifyPockets(
      pocketComponents,
      ownedTerritories,
    );

    return {
      contiguousMainlandSize,
      contiguousMainlandIds: mainlandIds,
      isolatedPockets,
    };
  }
}
