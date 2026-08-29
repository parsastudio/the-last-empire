import {
  GameState,
  Nation,
  Province,
  CountryRegistry,
  TurnLogBuilder,
  PeaceTermsCalculator,
  TurnLogEntry,
} from "@geopolitics/domain";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";

export class AiWarResolutionSweep {
  public static resolveAiWars(state: GameState): GameState {
    const updatedNations: Record<string, Nation> = { ...state.nations };
    const updatedProvinces: Record<string, Province> = { ...state.provinces };
    const newLogs: TurnLogEntry[] = [];
    let isMapDirty = false;

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

        const targetNation =
          updatedNations[canonicalB] || updatedNations[targetId];
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

        const remainingLoserProvinces = allProvinces.filter(
          (p) =>
            CountryRegistry.resolveCanonicalId(p.ownerNationId) ===
            loserCanonical,
        );

        for (let p = 0; p < remainingLoserProvinces.length; p++) {
          const prov = remainingLoserProvinces[p]!;
          updatedProvinces[prov.provinceId.toString()] = {
            ...prov,
            ownerNationId: winnerCanonical,
            originalNationId: winnerCanonical,
          };
        }

        isMapDirty = true;

        const winnerObj = updatedNations[winner.id]!;
        const winnerRelations = { ...winnerObj.relations };
        delete winnerRelations[loserCanonical];
        delete winnerRelations[loser.id];

        const hasOtherWars = Object.values(winnerRelations).some(
          (r) => r.stance === "WAR",
        );

        updatedNations[winner.id] = {
          ...winnerObj,
          treasury: winnerObj.treasury + Math.max(0, loser.treasury),
          warFocusTargetId:
            winnerObj.warFocusTargetId === loserCanonical
              ? null
              : winnerObj.warFocusTargetId,
          postWarCooldownTurns: !hasOtherWars ? 5 : 0,
          relations: winnerRelations,
        };

        updatedNations[loser.id] = {
          ...loser,
          isAlive: false,
          treasury: 0,
          nationalDebt: 0,
          warFocusTargetId: null,
          recruitmentQueue: [],
          executedEspionageTiers: [],
          attackedTargetIdsThisTurn: [],
          postWarCooldownTurns: 0,
          military: {
            ...loser.military,
            infantry: 0,
            armor: 0,
            airDefense: 0,
            airForce: 0,
            droneMissile: 0,
          },
          relations: {},
        };

        newLogs.push(
          TurnLogBuilder.createAnnexationLog(
            state.currentTurn,
            winner.id,
            loser.id,
          ),
        );
      }
    }

    if (isMapDirty) {
      BitPackedGridState.getInstance().markDirty();
    }

    return {
      ...state,
      provinces: updatedProvinces,
      nations: updatedNations,
      turnLogs: [...state.turnLogs, ...newLogs],
    };
  }
}
