import type { Nation, IsolatedPocket } from "@/domain/nation/nation.schema";

export interface OccupationResult {
  winner: Nation;
  loser: Nation;
  transferredTreasury: number;
  seizedTerritory: number;
}

export class TerritoryOccupationManager {
  public processVictoryOccupation(
    winner: Nation,
    loser: Nation,
    seizeRatio = 0.25,
  ): OccupationResult {
    const transferredTreasury = Math.max(
      0,
      Math.floor(loser.treasury * seizeRatio),
    );
    const seizedTerritory = Math.min(
      loser.geography.territorySize,
      Math.floor(loser.geography.territorySize * seizeRatio),
    );

    const loserTotalTerritory = loser.geography.territorySize;
    let remainingToSeize = seizedTerritory;

    const updatedLoser = { ...loser };
    const updatedWinner = { ...winner };

    const borderedPocketIndex =
      updatedLoser.geography.isolatedPockets.findIndex((pocket) => {
        return pocket.territoryIds.some(
          (id) =>
            updatedWinner.id === id ||
            updatedWinner.geography.landNeighbors.includes(id) ||
            updatedWinner.geography.seaNeighbors.includes(id),
        );
      });

    if (borderedPocketIndex !== -1) {
      const pocket =
        updatedLoser.geography.isolatedPockets[borderedPocketIndex];
      if (pocket) {
        const reduction = Math.min(pocket.territorySize, remainingToSeize);
        pocket.territorySize -= reduction;
        remainingToSeize -= reduction;
        if (pocket.territorySize <= 0) {
          updatedLoser.geography.isolatedPockets.splice(borderedPocketIndex, 1);
        }
      }
    }

    if (remainingToSeize > 0) {
      const mainlandRatio =
        updatedLoser.geography.contiguousMainlandSize /
        (loserTotalTerritory || 1);
      if (mainlandRatio > 0.5) {
        const reduction = Math.min(
          updatedLoser.geography.contiguousMainlandSize,
          remainingToSeize,
        );
        updatedLoser.geography.contiguousMainlandSize -= reduction;
        remainingToSeize -= reduction;
      } else {
        let largestPocketIndex = -1;
        let largestSize = -1;
        updatedLoser.geography.isolatedPockets.forEach((pocket, idx) => {
          if (pocket.territorySize > largestSize) {
            largestSize = pocket.territorySize;
            largestPocketIndex = idx;
          }
        });

        if (largestPocketIndex !== -1) {
          const pocket =
            updatedLoser.geography.isolatedPockets[largestPocketIndex];
          if (pocket) {
            const reduction = Math.min(pocket.territorySize, remainingToSeize);
            pocket.territorySize -= reduction;
            remainingToSeize -= reduction;
            if (pocket.territorySize <= 0) {
              updatedLoser.geography.isolatedPockets.splice(
                largestPocketIndex,
                1,
              );
            }
          }
        }
      }
    }

    if (remainingToSeize > 0) {
      const reduction = Math.min(
        updatedLoser.geography.contiguousMainlandSize,
        remainingToSeize,
      );
      updatedLoser.geography.contiguousMainlandSize -= reduction;
      remainingToSeize -= reduction;
    }

    updatedWinner.treasury += transferredTreasury;
    updatedWinner.geography.territorySize += seizedTerritory;

    updatedLoser.treasury = Math.max(
      0,
      updatedLoser.treasury - transferredTreasury,
    );
    updatedLoser.geography.territorySize = Math.max(
      0,
      updatedLoser.geography.territorySize - seizedTerritory,
    );
    updatedLoser.government.stability = Math.max(
      0,
      updatedLoser.government.stability - 20,
    );

    const isDirectNeighbor =
      updatedWinner.geography.landNeighbors.includes(updatedLoser.id) ||
      updatedWinner.geography.seaNeighbors.includes(updatedLoser.id);

    if (isDirectNeighbor) {
      updatedWinner.geography.contiguousMainlandSize += seizedTerritory;
    } else {
      const newPocket: IsolatedPocket = {
        id: `pocket-conquered-${updatedLoser.id}-${Date.now()}`,
        territorySize: seizedTerritory,
        territoryIds: [updatedLoser.id],
        coordinates: [],
      };
      updatedWinner.geography.isolatedPockets.push(newPocket);
    }

    let maxSegmentSize = updatedWinner.geography.contiguousMainlandSize;
    let maxSegmentIndex = -1;

    updatedWinner.geography.isolatedPockets.forEach((pocket, idx) => {
      if (pocket.territorySize > maxSegmentSize) {
        maxSegmentSize = pocket.territorySize;
        maxSegmentIndex = idx;
      }
    });

    if (maxSegmentIndex !== -1) {
      const largestPocket =
        updatedWinner.geography.isolatedPockets[maxSegmentIndex];
      if (largestPocket) {
        const oldMainlandSize = updatedWinner.geography.contiguousMainlandSize;
        const oldMainlandCoords = updatedWinner.geography.coordinates || [];

        updatedWinner.geography.contiguousMainlandSize =
          largestPocket.territorySize;
        updatedWinner.geography.coordinates = largestPocket.coordinates || [];

        const demotedPocket: IsolatedPocket = {
          id: `pocket-demoted-${Date.now()}`,
          territorySize: oldMainlandSize,
          territoryIds: [updatedWinner.id],
          coordinates: oldMainlandCoords,
        };

        updatedWinner.geography.isolatedPockets[maxSegmentIndex] =
          demotedPocket;
      }
    }

    return {
      winner: updatedWinner,
      loser: updatedLoser,
      transferredTreasury,
      seizedTerritory,
    };
  }
}
