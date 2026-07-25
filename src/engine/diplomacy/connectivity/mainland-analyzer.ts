export class MainlandAnalyzer {
  public findMainlandIndex(
    components: string[][],
    ownedSet: Set<string>,
    capitalId: string,
    ownedTerritories: { id: string; size: number }[],
  ): number {
    let mainlandIndex = -1;
    if (capitalId && ownedSet.has(capitalId)) {
      mainlandIndex = components.findIndex((comp) => comp.includes(capitalId));
    }

    if (mainlandIndex === -1) {
      let maxArea = -1;
      for (let i = 0; i < components.length; i++) {
        const comp = components[i];
        if (comp) {
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
    }

    return mainlandIndex;
  }
}
