import { Province } from "@/domain/province/province.schema";

export interface DemographicsTransferResult {
  transferredPopulation: number;
  transferredCapacity: number;
}

export class DemographicsTransferCalculator {
  public static calculateTransfer(
    conqueredProvincesList: Province[],
    isAttackerVictory: boolean,
  ): DemographicsTransferResult {
    if (!isAttackerVictory || conqueredProvincesList.length === 0) {
      return { transferredPopulation: 0, transferredCapacity: 0 };
    }

    let transferredPopulation = 0;
    let transferredCapacity = 0;

    for (let i = 0; i < conqueredProvincesList.length; i++) {
      const p = conqueredProvincesList[i]!;
      transferredPopulation += p.population;
      transferredCapacity += p.maxPopulationCapacity;
    }

    return {
      transferredPopulation,
      transferredCapacity,
    };
  }
}
