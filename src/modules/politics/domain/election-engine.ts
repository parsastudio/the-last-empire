import type { Nation } from "@/modules/nation/schemas/nation.schema";

export interface ElectionResult {
  electionHeld: boolean;
  incumbentWon: boolean;
  updatedNation: Nation;
}

export class ElectionEngine {
  private readonly electionIntervalTurns = 20;

  public processElection(
    nation: Nation,
    currentTurn: number,
    randomVal: number,
  ): ElectionResult {
    if (nation.government.type !== "DEMOCRACY") {
      return { electionHeld: false, incumbentWon: true, updatedNation: nation };
    }

    const lastElection = nation.government.lastElectionTurn ?? 0;
    if (currentTurn - lastElection < this.electionIntervalTurns) {
      return { electionHeld: false, incumbentWon: true, updatedNation: nation };
    }

    const incumbentWinChance =
      (nation.government.stability / 100) * 0.7 +
      (100 - nation.taxRate) * 0.003;

    const incumbentWon = randomVal < incumbentWinChance;

    let newTaxRate = nation.taxRate;
    let newStability = nation.government.stability;

    if (!incumbentWon) {
      newTaxRate = Math.max(
        10,
        Math.min(25, nation.taxRate + Math.floor(randomVal * 10) - 5),
      );
      newStability = Math.min(100, nation.government.stability + 15);
    }

    const updatedNation: Nation = {
      ...nation,
      taxRate: newTaxRate,
      government: {
        ...nation.government,
        stability: newStability,
        lastElectionTurn: currentTurn,
      },
    };

    return {
      electionHeld: true,
      incumbentWon,
      updatedNation,
    };
  }
}
