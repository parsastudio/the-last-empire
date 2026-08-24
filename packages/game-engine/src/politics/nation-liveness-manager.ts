import { GameState, TurnLogEntry } from "@/domain/game/game-state.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { TurnLogBuilder } from "@/domain/shared/domain-utilities";
import { NationGettersUtility } from "@geopolitics/domain";

export class NationLivenessManager {
  public updateLiveness(state: GameState): GameState {
    const updatedNations: Record<string, Nation> = { ...state.nations };
    const deadCanonicalIds = new Set<string>();
    const newAnnexationLogs: TurnLogEntry[] = [];

    for (const [id, nation] of Object.entries(updatedNations)) {
      const canonicalId = CountryRegistry.resolveCanonicalId(id);
      const hasProvinces = NationGettersUtility.isAlive(id, state.provinces);

      if (!hasProvinces) {
        deadCanonicalIds.add(canonicalId);
        deadCanonicalIds.add(id);

        if (nation.isAlive) {
          newAnnexationLogs.push(
            TurnLogBuilder.createLogEntry(
              state.currentTurn,
              nation.id,
              "CRITICAL",
              "NATION_COLLAPSED",
              "GLOBAL_ANNEXATION",
              "GLOBAL",
            ),
          );
        }

        updatedNations[id] = {
          ...nation,
          isAlive: false,
          treasury: 0,
          nationalDebt: 0,
          warFocusTargetId: null,
          recruitmentQueue: [],
          executedEspionageTiers: [],
          military: {
            ...nation.military,
            infantry: 0,
            armor: 0,
            airDefense: 0,
            airForce: 0,
            droneMissile: 0,
            navalFleet: 0,
          },
          relations: {},
        };
      }
    }

    if (deadCanonicalIds.size === 0) {
      return {
        ...state,
        nations: updatedNations,
      };
    }

    for (const [id, nation] of Object.entries(updatedNations)) {
      if (!nation.isAlive) {
        continue;
      }

      const updatedRelations = { ...nation.relations };
      let relationsChanged = false;

      for (const targetId of Object.keys(updatedRelations)) {
        const canonicalTarget = CountryRegistry.resolveCanonicalId(targetId);
        if (
          deadCanonicalIds.has(canonicalTarget) ||
          deadCanonicalIds.has(targetId)
        ) {
          delete updatedRelations[targetId];
          relationsChanged = true;
        }
      }

      let nextWarFocus = nation.warFocusTargetId;
      if (
        nextWarFocus &&
        (deadCanonicalIds.has(
          CountryRegistry.resolveCanonicalId(nextWarFocus),
        ) ||
          deadCanonicalIds.has(nextWarFocus))
      ) {
        nextWarFocus = null;
      }

      updatedNations[id] = {
        ...nation,
        warFocusTargetId: nextWarFocus,
        relations: relationsChanged ? updatedRelations : nation.relations,
      };
    }

    const filteredProposals = state.pendingProposals.filter((proposal) => {
      const senderCanonical = CountryRegistry.resolveCanonicalId(
        proposal.senderNationId,
      );
      const receiverCanonical = CountryRegistry.resolveCanonicalId(
        proposal.receiverNationId,
      );
      return (
        !deadCanonicalIds.has(senderCanonical) &&
        !deadCanonicalIds.has(proposal.senderNationId) &&
        !deadCanonicalIds.has(receiverCanonical) &&
        !deadCanonicalIds.has(proposal.receiverNationId)
      );
    });

    return {
      ...state,
      nations: updatedNations,
      pendingProposals: filteredProposals,
      turnLogs: [...state.turnLogs, ...newAnnexationLogs],
    };
  }
}
