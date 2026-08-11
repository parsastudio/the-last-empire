import { Nation } from "@/domain/nation/nation.schema";

export interface MigrationSummary {
  updatedNations: Record<string, Nation>;
  totalMigrants: number;
}

interface EmigrantPool {
  nationId: string;
  amount: number;
}

interface AttractorPool {
  nationId: string;
  score: number;
}

export class MigrationEngine {
  public static processGlobalMigration(
    nations: Record<string, Nation>,
  ): MigrationSummary {
    const updatedNations: Record<string, Nation> = { ...nations };
    const emigrants: EmigrantPool[] = [];
    const attractors: AttractorPool[] = [];

    let totalPush = 0;
    let totalAttractionScore = 0;

    const nationKeys = Object.keys(nations);
    for (let i = 0; i < nationKeys.length; i++) {
      const id = nationKeys[i]!;
      const nation = nations[id];
      if (!nation || !nation.isAlive) continue;

      const stability = nation.government.stability;
      const pop = nation.population;
      const capacity = nation.maxPopulationCapacity || Math.floor(pop / 0.95);

      if (stability < 40) {
        const pushRate = Math.min(0.03, (40 - stability) * 0.0008);
        const pushAmount = Math.floor(pop * pushRate);
        if (pushAmount > 0) {
          emigrants.push({ nationId: id, amount: pushAmount });
          totalPush += pushAmount;
        }
      } else if (stability > 60) {
        const capacityRoom = Math.max(0, capacity - pop);
        if (capacityRoom > 0) {
          const score =
            (stability - 60) * Math.min(1.0, capacityRoom / 10000000);
          if (score > 0) {
            attractors.push({ nationId: id, score });
            totalAttractionScore += score;
          }
        }
      }
    }

    if (totalPush === 0 || totalAttractionScore === 0) {
      return {
        updatedNations,
        totalMigrants: 0,
      };
    }

    for (let i = 0; i < emigrants.length; i++) {
      const e = emigrants[i]!;
      const n = updatedNations[e.nationId];
      if (n) {
        updatedNations[e.nationId] = {
          ...n,
          population: Math.max(100, n.population - e.amount),
        };
      }
    }

    let allocatedTotal = 0;
    for (let i = 0; i < attractors.length; i++) {
      const a = attractors[i]!;
      const n = updatedNations[a.nationId];
      if (n) {
        const share = a.score / totalAttractionScore;
        const gain = Math.floor(totalPush * share);
        allocatedTotal += gain;

        updatedNations[a.nationId] = {
          ...n,
          population: n.population + gain,
        };
      }
    }

    const remainder = totalPush - allocatedTotal;
    if (remainder > 0 && attractors.length > 0) {
      const topAttractorId = attractors[0]!.nationId;
      const topNation = updatedNations[topAttractorId];
      if (topNation) {
        updatedNations[topAttractorId] = {
          ...topNation,
          population: topNation.population + remainder,
        };
      }
    }

    return {
      updatedNations,
      totalMigrants: totalPush,
    };
  }
}
