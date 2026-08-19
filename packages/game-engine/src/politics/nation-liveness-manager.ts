import { GameState } from "@/domain/game/game-state.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { TurnLogBuilder } from "@/domain/shared/domain-utilities";

export class NationLivenessManager {
  public updateLiveness(state: GameState): GameState {
    const updatedNations: Record<string, Nation> = { ...state.nations };
    const deadCanonicalIds = new Set<string>();
    const newAnnexationLogs = [];

    for (const [id, nation] of Object.entries(updatedNations)) {
      const canonicalId = CountryRegistry.resolveCanonicalId(id);
      const hasTerritory = (nation.geography?.territoryPixelCount ?? 0) > 0;
      const hasPopulation = (nation.population ?? 0) > 0;

      if (nation.isAlive && (!hasTerritory || !hasPopulation)) {
        deadCanonicalIds.add(canonicalId);
        deadCanonicalIds.add(id);

        const collapseMsg = `فروپاشی کامل دولت: کشور ${nation.name} به دلیل از دست دادن تمامی قلمروها و ساختار حاکمیتی خود به طور کامل منحل گردید.`;
        newAnnexationLogs.push(
          TurnLogBuilder.createAnnexationLog(
            state.currentTurn,
            "UNKNOWN",
            nation.id,
            collapseMsg,
          ),
        );

        updatedNations[id] = {
          ...nation,
          isAlive: false,
          population: 0,
          treasury: 0,
          nationalDebt: 0,
          warFocusTargetId: null,
          provinceIds: [],
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
            inventory: {},
          },
          geography: {
            ...nation.geography,
            territoryPixelCount: 0,
            hasSeaAccess: false,
            landNeighbors: [],
            seaNeighbors: [],
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

      const nextLandNeighbors = nation.geography.landNeighbors.filter(
        (neighborId) =>
          !deadCanonicalIds.has(
            CountryRegistry.resolveCanonicalId(neighborId),
          ) && !deadCanonicalIds.has(neighborId),
      );

      const nextSeaNeighbors = nation.geography.seaNeighbors.filter(
        (neighborId) =>
          !deadCanonicalIds.has(
            CountryRegistry.resolveCanonicalId(neighborId),
          ) && !deadCanonicalIds.has(neighborId),
      );

      updatedNations[id] = {
        ...nation,
        warFocusTargetId: nextWarFocus,
        relations: relationsChanged ? updatedRelations : nation.relations,
        geography: {
          ...nation.geography,
          landNeighbors: nextLandNeighbors,
          seaNeighbors: nextSeaNeighbors,
        },
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
