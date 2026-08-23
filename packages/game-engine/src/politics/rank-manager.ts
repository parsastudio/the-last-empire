import {
  Nation,
  Province,
  getNationGdp,
  NationGettersUtility,
} from "@geopolitics/domain";

export class RankManager {
  public static recalculateRanks(
    nations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
  ): Record<string, Nation> {
    const updatedNations: Record<string, Nation> = { ...nations };

    const sortedAliveNations = Object.values(updatedNations)
      .filter((n) => n.isAlive)
      .sort((a, b) => {
        const gdpDiff =
          getNationGdp(b, provincesMap) - getNationGdp(a, provincesMap);
        if (gdpDiff !== 0) return gdpDiff;
        const popB = NationGettersUtility.getPopulation(b.id, provincesMap);
        const popA = NationGettersUtility.getPopulation(a.id, provincesMap);
        const popDiff = popB - popA;
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
