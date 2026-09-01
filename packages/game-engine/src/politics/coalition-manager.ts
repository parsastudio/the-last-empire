import {
  GameState,
  Nation,
  Province,
  CountryRegistry,
  NationGettersUtility,
  GlobalCoalition,
  TurnLogBuilder,
} from "@geopolitics/domain";

export class CoalitionManager {
  public static readonly COALITION_TRIGGER_THRESHOLD = 0.5;

  public static evaluateCoalitionState(
    state: GameState,
    rankMap?: Map<string, number>,
    provincesByOwnerMap?: Map<string, Province[]>,
  ): GameState {
    const aliveNations = Object.values(state.nations).filter((n) => n.isAlive);
    if (aliveNations.length <= 2) {
      return state;
    }

    const activeRankMap =
      rankMap ??
      NationGettersUtility.calculateRankMap(state.nations, state.provinces);

    const sortedByRank = [...aliveNations].sort((a, b) => {
      const rA =
        activeRankMap.get(CountryRegistry.resolveCanonicalId(a.id)) ?? 999;
      const rB =
        activeRankMap.get(CountryRegistry.resolveCanonicalId(b.id)) ?? 999;
      return rA - rB;
    });

    const rank1Nation = sortedByRank[0];
    if (!rank1Nation) return state;

    const rank1Canonical = CountryRegistry.resolveCanonicalId(rank1Nation.id);

    if (state.globalCoalition) {
      return this.maintainExistingCoalition(state, state.globalCoalition);
    }

    let totalWorldProvincesCount = Object.keys(state.provinces).length;
    if (totalWorldProvincesCount <= 0) {
      totalWorldProvincesCount = 1;
    }

    const rank1Provinces =
      provincesByOwnerMap?.get(rank1Canonical) ??
      NationGettersUtility.getOwnedProvinces(rank1Canonical, state.provinces);

    const territoryShare = rank1Provinces.length / totalWorldProvincesCount;

    if (territoryShare >= this.COALITION_TRIGGER_THRESHOLD) {
      return this.formGlobalCoalition(state, rank1Nation, sortedByRank);
    }

    return state;
  }

  private static formGlobalCoalition(
    state: GameState,
    targetNation: Nation,
    sortedAliveNations: Nation[],
  ): GameState {
    const targetCanonical = CountryRegistry.resolveCanonicalId(targetNation.id);
    const coalitionMembers = sortedAliveNations.filter((n) => {
      const canId = CountryRegistry.resolveCanonicalId(n.id);
      return canId !== targetCanonical;
    });

    if (coalitionMembers.length === 0) return state;

    const memberIds = coalitionMembers.map((m) =>
      CountryRegistry.resolveCanonicalId(m.id),
    );

    const updatedNations: Record<string, Nation> = { ...state.nations };

    for (const member of coalitionMembers) {
      const memberCanonical = CountryRegistry.resolveCanonicalId(member.id);
      const mRel = { ...(updatedNations[memberCanonical]?.relations || {}) };
      mRel[targetCanonical] = {
        targetNationId: targetCanonical,
        stance: "WAR",
        alignment: -100,
        tension: 100,
        warDeclaredTurn: state.currentTurn,
      };

      for (const otherMember of coalitionMembers) {
        const otherCanonical = CountryRegistry.resolveCanonicalId(
          otherMember.id,
        );
        if (otherCanonical !== memberCanonical) {
          mRel[otherCanonical] = {
            targetNationId: otherCanonical,
            stance: "NON_AGGRESSION_PACT",
            alignment: Math.max(50, mRel[otherCanonical]?.alignment ?? 50),
            tension: 0,
          };
        }
      }

      updatedNations[memberCanonical] = {
        ...updatedNations[memberCanonical]!,
        relations: mRel,
        warFocusTargetId: targetCanonical,
      };
    }

    const targetRel = { ...(updatedNations[targetCanonical]?.relations || {}) };
    for (const member of coalitionMembers) {
      const mCanonical = CountryRegistry.resolveCanonicalId(member.id);
      targetRel[mCanonical] = {
        targetNationId: mCanonical,
        stance: "WAR",
        alignment: -100,
        tension: 100,
        warDeclaredTurn: state.currentTurn,
      };
    }

    updatedNations[targetCanonical] = {
      ...updatedNations[targetCanonical]!,
      relations: targetRel,
    };

    const coalitionObj: GlobalCoalition = {
      targetNationId: targetCanonical,
      memberNationIds: memberIds,
      triggeredTurn: state.currentTurn,
    };

    const coalitionLog = TurnLogBuilder.createCoalitionFormedLog(
      state.currentTurn,
      targetNation.id,
      memberIds.join(", "),
    );

    return {
      ...state,
      nations: updatedNations,
      globalCoalition: coalitionObj,
      turnLogs: [...state.turnLogs, coalitionLog],
    };
  }

  private static maintainExistingCoalition(
    state: GameState,
    coalition: GlobalCoalition,
  ): GameState {
    const targetCanonical = CountryRegistry.resolveCanonicalId(
      coalition.targetNationId,
    );
    const targetNation = state.nations[targetCanonical];

    if (!targetNation || !targetNation.isAlive) {
      return {
        ...state,
        globalCoalition: null,
      };
    }

    const currentAliveMembers = coalition.memberNationIds.filter((mId) => {
      const cId = CountryRegistry.resolveCanonicalId(mId);
      const n = state.nations[cId];
      return n && n.isAlive;
    });

    if (currentAliveMembers.length === 0) {
      return {
        ...state,
        globalCoalition: null,
      };
    }

    const updatedCoalition: GlobalCoalition = {
      ...coalition,
      memberNationIds: currentAliveMembers,
    };

    return {
      ...state,
      globalCoalition: updatedCoalition,
    };
  }
}
