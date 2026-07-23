import type { Nation } from "@/domain/nation/nation.schema";
import type { Province } from "@/domain/map/province.schema";

export interface OccupationResult {
  winner: Nation;
  loser: Nation;
  transferredTreasury: number;
  seizedTerritory: number;
  capturedProvinceIds: string[];
}

export class TerritoryOccupationManager {
  public processVictoryOccupation(
    winner: Nation,
    loser: Nation,
    provinces: Record<string, Province>,
    seizeRatio = 0.25,
  ): OccupationResult {
    const transferredTreasury = Math.max(
      0,
      Math.floor(loser.treasury * seizeRatio),
    );

    const loserProvinces = Object.values(provinces).filter(
      (p) => p.ownerNationId === loser.id,
    );

    const numToCapture = Math.max(
      1,
      Math.floor(loserProvinces.length * seizeRatio),
    );
    const capturedProvinces = loserProvinces.slice(0, numToCapture);
    const capturedProvinceIds = capturedProvinces.map((p) => p.id);

    let seizedTerritory = 0;
    capturedProvinces.forEach((prov) => {
      seizedTerritory += prov.territorySize;
    });

    const updatedWinner = {
      ...winner,
      treasury: winner.treasury + transferredTreasury,
      geography: {
        ...winner.geography,
        territorySize: winner.geography.territorySize + seizedTerritory,
        contiguousMainlandSize:
          winner.geography.contiguousMainlandSize + seizedTerritory,
      },
    };

    const updatedLoser = {
      ...loser,
      treasury: Math.max(0, loser.treasury - transferredTreasury),
      geography: {
        ...loser.geography,
        territorySize: Math.max(
          0,
          loser.geography.territorySize - seizedTerritory,
        ),
        contiguousMainlandSize: Math.max(
          0,
          loser.geography.contiguousMainlandSize - seizedTerritory,
        ),
      },
      government: {
        ...loser.government,
        stability: Math.max(0, loser.government.stability - 20),
      },
    };

    return {
      winner: updatedWinner,
      loser: updatedLoser,
      transferredTreasury,
      seizedTerritory,
      capturedProvinceIds,
    };
  }
}
