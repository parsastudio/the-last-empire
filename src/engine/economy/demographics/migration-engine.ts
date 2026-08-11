import { Nation } from "@/domain/nation/nation.schema";

export interface MigrationSummary {
  updatedNations: Record<string, Nation>;
  totalMigrants: number;
}

interface EmigrantCandidate {
  nationId: string;
  desiredPushAmount: number;
}

interface AttractorCandidate {
  nationId: string;
  score: number;
  emptyCapacityRoom: number;
}

export class MigrationEngine {
  public static processGlobalMigration(
    nations: Record<string, Nation>,
  ): MigrationSummary {
    const updatedNations: Record<string, Nation> = { ...nations };
    const candidates: EmigrantCandidate[] = [];
    const attractors: AttractorCandidate[] = [];

    let totalDesiredPush = 0;
    let totalGlobalEmptyCapacity = 0;
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
          candidates.push({ nationId: id, desiredPushAmount: pushAmount });
          totalDesiredPush += pushAmount;
        }
      } else if (stability > 60) {
        const emptyRoom = Math.max(0, capacity - pop);
        if (emptyRoom > 0) {
          const score = (stability - 60) * Math.min(1.0, emptyRoom / 10000000);
          if (score > 0) {
            attractors.push({
              nationId: id,
              score,
              emptyCapacityRoom: emptyRoom,
            });
            totalAttractionScore += score;
            totalGlobalEmptyCapacity += emptyRoom;
          }
        }
      }
    }

    if (
      totalDesiredPush === 0 ||
      totalAttractionScore === 0 ||
      totalGlobalEmptyCapacity === 0
    ) {
      return {
        updatedNations,
        totalMigrants: 0,
      };
    }

    let actualTotalMigrants = totalDesiredPush;
    let adjustmentFactor = 1.0;

    if (totalDesiredPush > totalGlobalEmptyCapacity) {
      actualTotalMigrants = totalGlobalEmptyCapacity;
      adjustmentFactor = totalGlobalEmptyCapacity / totalDesiredPush;
    }

    for (let i = 0; i < candidates.length; i++) {
      const c = candidates[i]!;
      const actualDeduction = Math.floor(
        c.desiredPushAmount * adjustmentFactor,
      );
      const n = updatedNations[c.nationId];
      if (n && actualDeduction > 0) {
        updatedNations[c.nationId] = {
          ...n,
          population: Math.max(100, n.population - actualDeduction),
        };
      }
    }

    let totalDistributed = 0;

    for (let i = 0; i < attractors.length; i++) {
      const a = attractors[i]!;
      const n = updatedNations[a.nationId];
      if (n) {
        const share = a.score / totalAttractionScore;
        let gain = Math.floor(actualTotalMigrants * share);
        gain = Math.min(gain, a.emptyCapacityRoom);
        totalDistributed += gain;

        updatedNations[a.nationId] = {
          ...n,
          population: n.population + gain,
        };
      }
    }

    const remainder = actualTotalMigrants - totalDistributed;
    if (remainder > 0 && attractors.length > 0) {
      for (let i = 0; i < attractors.length; i++) {
        const a = attractors[i]!;
        const n = updatedNations[a.nationId];
        if (n) {
          const currentRoom = Math.max(
            0,
            (n.maxPopulationCapacity || Math.floor(n.population / 0.95)) -
              n.population,
          );
          if (currentRoom > 0) {
            const add = Math.min(remainder, currentRoom);
            updatedNations[a.nationId] = {
              ...n,
              population: n.population + add,
            };
            break;
          }
        }
      }
    }

    return {
      updatedNations,
      totalMigrants: actualTotalMigrants,
    };
  }
}
