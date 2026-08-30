import {
  GameState,
  Nation,
  Province,
  CountryRegistry,
  TurnLogBuilder,
  PeaceTermsCalculator,
  TurnLogEntry,
  NationGettersUtility,
} from "@geopolitics/domain";
import { NationAnnexationExecutor } from "@/engine/combat/conquest/nation-annexation-executor";

export class AiWarResolutionSweep {
  public static resolveAiWars(state: GameState): GameState {
    let updatedNations: Record<string, Nation> = { ...state.nations };
    let updatedProvinces: Record<string, Province> = { ...state.provinces };
    const newLogs: TurnLogEntry[] = [];

    const canonicalHuman = CountryRegistry.resolveCanonicalId(
      state.humanNationId,
    );
    const processedPairs = new Set<string>();

    const nationEntries = Object.entries(updatedNations);

    for (let i = 0; i < nationEntries.length; i++) {
      const [nationId, nation] = nationEntries[i]!;
      if (!nation.isAlive || !nation.isAi) continue;

      const canonicalA = CountryRegistry.resolveCanonicalId(nationId);
      if (canonicalA === canonicalHuman) continue;

      const relations = nation.relations || {};

      for (const [targetId, rel] of Object.entries(relations)) {
        if (rel.stance !== "WAR") continue;

        const canonicalB = CountryRegistry.resolveCanonicalId(targetId);
        if (canonicalB === canonicalHuman || canonicalB === canonicalA)
          continue;

        const pairKey = [canonicalA, canonicalB].sort().join(":");
        if (processedPairs.has(pairKey)) continue;
        processedPairs.add(pairKey);

        const targetNation = NationGettersUtility.resolveNation(
          canonicalB,
          updatedNations,
        );
        if (!targetNation || !targetNation.isAlive || !targetNation.isAi)
          continue;

        const twmiA = PeaceTermsCalculator.calculateTwmi(
          nation,
          updatedNations,
          updatedProvinces,
        );
        const twmiB = PeaceTermsCalculator.calculateTwmi(
          targetNation,
          updatedNations,
          updatedProvinces,
        );

        const ratioA = twmiA / Math.max(1, twmiB);
        const ratioB = twmiB / Math.max(1, twmiA);

        let winner: Nation | null = null;
        let loser: Nation | null = null;

        if (ratioA >= 2.0) {
          winner = nation;
          loser = targetNation;
        } else if (ratioB >= 2.0) {
          winner = targetNation;
          loser = nation;
        }

        if (!winner || !loser) continue;

        const winnerCanonical = CountryRegistry.resolveCanonicalId(winner.id);
        const loserCanonical = CountryRegistry.resolveCanonicalId(loser.id);

        const allProvinces = Object.values(updatedProvinces);
        const winnerHoldsCapturedProvince = allProvinces.some((p) => {
          const owner = CountryRegistry.resolveCanonicalId(p.ownerNationId);
          const original = CountryRegistry.resolveCanonicalId(
            p.originalNationId || p.ownerNationId,
          );
          return owner === winnerCanonical && original === loserCanonical;
        });

        if (!winnerHoldsCapturedProvince) continue;

        const annexationResult =
          NationAnnexationExecutor.executeTotalAnnexation(
            updatedProvinces,
            updatedNations,
            winner.id,
            loser.id,
            5,
          );

        updatedProvinces = annexationResult.updatedProvinces;
        updatedNations = annexationResult.updatedNations;

        newLogs.push(
          TurnLogBuilder.createAnnexationLog(
            state.currentTurn,
            winner.id,
            loser.id,
          ),
        );
      }
    }

    return {
      ...state,
      provinces: updatedProvinces,
      nations: updatedNations,
      turnLogs: [...state.turnLogs, ...newLogs],
    };
  }
}
