import {
  GameState,
  Nation,
  Province,
  CountryRegistry,
  NationGettersUtility,
  getNationGdp,
  TurnLogBuilder,
} from "@geopolitics/domain";

export class CoalitionManager {
  public static evaluateCoalitionState(
    state: GameState,
    rankMap?: Map<string, number>,
    provincesByOwnerMap?: Map<string, Province[]>,
  ): GameState {
    const existing = state.globalCoalition;

    if (existing) {
      return this.syncExistingCoalition(state, existing);
    }

    const aliveNations = Object.values(state.nations).filter((n) => n.isAlive);
    if (aliveNations.length <= 1) return state;

    const totalWorldPixels = Object.values(state.provinces || {}).reduce(
      (sum, p) => sum + (p.pixelCount || 0),
      0,
    );

    const totalWorldGdp = aliveNations.reduce(
      (sum, n) =>
        sum + getNationGdp(n, state.provinces, undefined, provincesByOwnerMap),
      0,
    );

    let hegemonicNation: Nation | null = null;

    for (let i = 0; i < aliveNations.length; i++) {
      const candidate = aliveNations[i]!;
      const myPixels = NationGettersUtility.getTerritoryPixelCount(
        candidate.id,
        state.provinces,
        undefined,
        provincesByOwnerMap,
      );
      const myGdp = getNationGdp(
        candidate,
        state.provinces,
        undefined,
        provincesByOwnerMap,
      );

      const territoryShare =
        totalWorldPixels > 0 ? myPixels / totalWorldPixels : 0;
      const gdpShare = totalWorldGdp > 0 ? myGdp / totalWorldGdp : 0;

      if (territoryShare >= 0.5 || gdpShare >= 0.5) {
        hegemonicNation = candidate;
        break;
      }
    }

    if (!hegemonicNation) {
      return state;
    }

    const targetCanonical = CountryRegistry.resolveCanonicalId(
      hegemonicNation.id,
    );

    const effectiveRankMap =
      rankMap ??
      NationGettersUtility.calculateRankMap(
        state.nations,
        state.provinces,
        provincesByOwnerMap,
      );

    const nonTargetAlive = aliveNations.filter((n) => {
      const cid = CountryRegistry.resolveCanonicalId(n.id);
      return cid !== targetCanonical;
    });

    if (nonTargetAlive.length === 0) {
      return state;
    }

    nonTargetAlive.sort((a, b) => {
      const rA =
        effectiveRankMap.get(CountryRegistry.resolveCanonicalId(a.id)) ?? 99;
      const rB =
        effectiveRankMap.get(CountryRegistry.resolveCanonicalId(b.id)) ?? 99;
      return rA - rB;
    });

    const chosenMembers = nonTargetAlive.slice(0, 3);
    const memberCanonicalIds = chosenMembers.map((m) =>
      CountryRegistry.resolveCanonicalId(m.id),
    );

    const updatedNations: Record<string, Nation> = { ...state.nations };

    for (let i = 0; i < chosenMembers.length; i++) {
      const member = chosenMembers[i]!;
      const mId = member.id;
      const memberRelations = { ...member.relations };

      memberRelations[targetCanonical] = {
        targetNationId: targetCanonical,
        stance: "WAR",
        alignment: -100,
        tension: 100,
      };

      for (let j = 0; j < memberCanonicalIds.length; j++) {
        const peerId = memberCanonicalIds[j]!;
        if (peerId !== CountryRegistry.resolveCanonicalId(mId)) {
          memberRelations[peerId] = {
            targetNationId: peerId,
            stance: "ALLIANCE",
            alignment: 100,
            tension: 0,
          };
        }
      }

      updatedNations[mId] = {
        ...member,
        warFocusTargetId: targetCanonical,
        relations: memberRelations,
      };
    }

    const targetNationObj =
      updatedNations[targetCanonical] || updatedNations[hegemonicNation.id]!;
    const targetRelations = { ...targetNationObj.relations };

    for (let i = 0; i < memberCanonicalIds.length; i++) {
      const mId = memberCanonicalIds[i]!;
      targetRelations[mId] = {
        targetNationId: mId,
        stance: "WAR",
        alignment: -100,
        tension: 100,
      };
    }

    updatedNations[targetNationObj.id] = {
      ...targetNationObj,
      relations: targetRelations,
    };

    const memberNames = chosenMembers.map((m) => m.name).join("، ");
    const coalitionLog = TurnLogBuilder.createCoalitionFormedLog(
      state.currentTurn,
      hegemonicNation.id,
      memberNames,
    );

    return {
      ...state,
      nations: updatedNations,
      globalCoalition: {
        targetNationId: targetCanonical,
        memberNationIds: memberCanonicalIds,
        triggeredTurn: state.currentTurn,
      },
      turnLogs: [...state.turnLogs, coalitionLog],
    };
  }

  private static syncExistingCoalition(
    state: GameState,
    existing: {
      targetNationId: string;
      memberNationIds: string[];
      triggeredTurn: number;
    },
  ): GameState {
    const aliveMembers = existing.memberNationIds.filter((id) => {
      const canonical = CountryRegistry.resolveCanonicalId(id);
      const nation = state.nations[canonical] || state.nations[id];
      return nation && nation.isAlive;
    });

    if (aliveMembers.length === existing.memberNationIds.length) {
      return state;
    }

    const deadMembersCount =
      existing.memberNationIds.length - aliveMembers.length;
    const newLogs = [];

    if (deadMembersCount > 0) {
      newLogs.push(
        TurnLogBuilder.createCoalitionMemberFallenLog(
          state.currentTurn,
          existing.memberNationIds[0] || "COALITION",
          existing.targetNationId,
          aliveMembers.length,
        ),
      );
    }

    return {
      ...state,
      globalCoalition: {
        ...existing,
        memberNationIds: aliveMembers,
      },
      turnLogs: [...state.turnLogs, ...newLogs],
    };
  }
}
