import type { Nation } from "@/domain/nation/nation.schema";
import type { Province } from "@/domain/map/province.schema";
import { executeProvinceAttack } from "@/application/province-engine";

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

    const winnerProvinces = Object.values(provinces).filter(
      (p) => p.ownerNationId === winner.id,
    );

    const groupedProvs: Record<string, Province[]> = {
      [loser.id]: loserProvinces,
      [winner.id]: winnerProvinces,
    };

    const result = executeProvinceAttack(loser.id, groupedProvs, winner.id);
    const capturedProvinceIds = result.newlyConqueredProvIds;

    let seizedTerritory = 0;
    capturedProvinceIds.forEach((id) => {
      const prov = provinces[id];
      if (prov) {
        seizedTerritory += prov.territorySize;
      }
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
