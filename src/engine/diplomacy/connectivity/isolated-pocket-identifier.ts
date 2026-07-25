export interface IsolatedPocketResult {
  id: string;
  territorySize: number;
  territoryIds: string[];
}

export class IsolatedPocketIdentifier {
  public identifyPockets(
    pocketComponents: string[][],
    ownedTerritories: { id: string; size: number }[],
  ): IsolatedPocketResult[] {
    return pocketComponents.map((comp, idx) => {
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
  }
}
