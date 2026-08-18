import { Nation } from "@/domain/nation/nation.schema";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";

export class RankManager {
  public static recalculateRanks(
    nations: Record<string, Nation>,
  ): Record<string, Nation> {
    const updatedNations: Record<string, Nation> = { ...nations };

    const sortedAliveNations = Object.values(updatedNations)
      .filter((n) => n.isAlive)
      .sort((a, b) => {
        const gdpDiff = getNationGdp(b) - getNationGdp(a);
        if (gdpDiff !== 0) return gdpDiff;
        const popDiff = b.population - a.population;
        if (popDiff !== 0) return popDiff;
        return a.id.localeCompare(b.id);
      });

    for (let index = 0; index < sortedAliveNations.length; index++) {
      const nation = sortedAliveNations[index]!;
      const newRank = index + 1;
      if (nation.rank !== newRank) {
        updatedNations[nation.id] = {
          ...updatedNations[nation.id]!,
          rank: newRank,
        };
      }
    }

    return updatedNations;
  }
}
