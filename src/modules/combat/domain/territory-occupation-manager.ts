import type { Nation } from "@/core/types/nation.types";

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
    const transferredTreasury = Math.floor(loser.treasury * seizeRatio);
    const seizedTerritory = Math.min(
      loser.geography.territorySize,
      Math.floor(loser.geography.territorySize * seizeRatio),
    );

    const updatedWinner: Nation = {
      ...winner,
      treasury: winner.treasury + transferredTreasury,
      geography: {
        ...winner.geography,
        territorySize: winner.geography.territorySize + seizedTerritory,
      },
    };

    const updatedLoser: Nation = {
      ...loser,
      treasury: loser.treasury - transferredTreasury,
      geography: {
        ...loser.geography,
        territorySize: loser.geography.territorySize - seizedTerritory,
      },
    };

    return {
      winner: updatedWinner,
      loser: updatedLoser,
      transferredTreasury,
      seizedTerritory,
    };
  }
}
