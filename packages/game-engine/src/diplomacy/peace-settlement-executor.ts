import {
  GameState,
  Nation,
  Province,
  CountryRegistry,
  TurnLogBuilder,
  PeaceTermsCalculator,
  SignPeaceSettlementAction,
  GameError,
} from "@geopolitics/domain";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";

export class PeaceSettlementExecutor {
  public static execute(
    state: GameState,
    action: SignPeaceSettlementAction,
  ): GameState {
    const canonicalSource = CountryRegistry.resolveCanonicalId(action.nationId);
    const canonicalTarget = CountryRegistry.resolveCanonicalId(
      action.targetNationId,
    );

    const sourceNation =
      state.nations[canonicalSource] || state.nations[action.nationId];
    const targetNation =
      state.nations[canonicalTarget] || state.nations[action.targetNationId];

    if (!sourceNation || !targetNation) {
      throw new GameError("NATION_NOT_FOUND", "یکی از طرفین معاهده یافت نشد.");
    }

    const humanCanonical = CountryRegistry.resolveCanonicalId(
      state.humanNationId,
    );
    const humanNation =
      canonicalSource === humanCanonical
        ? sourceNation
        : canonicalTarget === humanCanonical
          ? targetNation
          : sourceNation;

    const aiNation =
      humanNation.id === sourceNation.id ? targetNation : sourceNation;

    const terms = PeaceTermsCalculator.calculateTerms(
      humanNation,
      aiNation,
      state.nations,
      state.provinces,
    );

    const updatedProvinces: Record<string, Province> = { ...state.provinces };
    const updatedNations: Record<string, Nation> = { ...state.nations };

    const isFullCapitulation = terms.settlementType === "FULL_CAPITULATION";
    const winnerNation = terms.isAiOffering ? humanNation : aiNation;
    const loserNation = terms.isAiOffering ? aiNation : humanNation;

    const winnerCanonical = CountryRegistry.resolveCanonicalId(winnerNation.id);
    const loserCanonical = CountryRegistry.resolveCanonicalId(loserNation.id);

    if (terms.moneyAmount > 0) {
      const paying = updatedNations[loserNation.id]!;
      const receiving = updatedNations[winnerNation.id]!;

      const actualPaid = Math.min(
        paying.treasury + Math.max(0, Math.floor(paying.treasury * 0.5)),
        terms.moneyAmount,
      );

      updatedNations[loserNation.id] = {
        ...paying,
        treasury: Math.max(0, paying.treasury - actualPaid),
      };
      updatedNations[winnerNation.id] = {
        ...receiving,
        treasury: receiving.treasury + actualPaid,
      };
    }

    if (terms.concededProvinceIds.length > 0) {
      for (let i = 0; i < terms.concededProvinceIds.length; i++) {
        const pid = terms.concededProvinceIds[i]!;
        const prov = updatedProvinces[pid.toString()];
        if (prov) {
          updatedProvinces[pid.toString()] = {
            ...prov,
            ownerNationId: winnerCanonical,
            originalNationId: winnerCanonical,
          };
        }
      }
      BitPackedGridState.getInstance().markDirty();
    }

    const newLogs = [];

    if (isFullCapitulation) {
      const conqueredProvs = Object.values(updatedProvinces).filter(
        (p) =>
          CountryRegistry.resolveCanonicalId(p.ownerNationId) ===
          loserCanonical,
      );

      for (let i = 0; i < conqueredProvs.length; i++) {
        const p = conqueredProvs[i]!;
        updatedProvinces[p.provinceId.toString()] = {
          ...p,
          ownerNationId: winnerCanonical,
          originalNationId: winnerCanonical,
        };
      }

      BitPackedGridState.getInstance().markDirty();

      updatedNations[loserNation.id] = {
        ...updatedNations[loserNation.id]!,
        isAlive: false,
        treasury: 0,
        nationalDebt: 0,
        warFocusTargetId: null,
        relations: {},
      };

      const winnerObj = updatedNations[winnerNation.id]!;
      const winnerRelations = { ...winnerObj.relations };
      delete winnerRelations[loserCanonical];
      delete winnerRelations[loserNation.id];

      updatedNations[winnerNation.id] = {
        ...winnerObj,
        warFocusTargetId:
          winnerObj.warFocusTargetId === loserCanonical
            ? null
            : winnerObj.warFocusTargetId,
        postWarCooldownTurns: winnerNation.isAi ? 5 : 0,
        relations: winnerRelations,
      };

      newLogs.push(
        TurnLogBuilder.createAnnexationLog(
          state.currentTurn,
          winnerNation.id,
          loserNation.id,
        ),
      );
    } else {
      const sObj = updatedNations[sourceNation.id]!;
      const tObj = updatedNations[targetNation.id]!;

      const sRelations = { ...sObj.relations };
      const tRelations = { ...tObj.relations };

      sRelations[canonicalTarget] = {
        targetNationId: canonicalTarget,
        stance: "NORMAL_DIPLOMACY",
        alignment: Math.max(
          10,
          (sRelations[canonicalTarget]?.alignment ?? 0) + 20,
        ),
        tension: Math.min(
          20,
          Math.floor((sRelations[canonicalTarget]?.tension ?? 10) * 0.3),
        ),
      };

      tRelations[canonicalSource] = {
        targetNationId: canonicalSource,
        stance: "NORMAL_DIPLOMACY",
        alignment: Math.max(
          10,
          (tRelations[canonicalSource]?.alignment ?? 0) + 20,
        ),
        tension: Math.min(
          20,
          Math.floor((tRelations[canonicalSource]?.tension ?? 10) * 0.3),
        ),
      };

      updatedNations[sourceNation.id] = {
        ...sObj,
        warFocusTargetId:
          sObj.warFocusTargetId === canonicalTarget
            ? null
            : sObj.warFocusTargetId,
        postWarCooldownTurns: sourceNation.isAi ? 5 : 0,
        relations: sRelations,
      };

      updatedNations[targetNation.id] = {
        ...tObj,
        warFocusTargetId:
          tObj.warFocusTargetId === canonicalSource
            ? null
            : tObj.warFocusTargetId,
        postWarCooldownTurns: targetNation.isAi ? 5 : 0,
        relations: tRelations,
      };

      newLogs.push(
        TurnLogBuilder.createGlobalDiplomacyLog(
          state.currentTurn,
          sourceNation.id,
          targetNation.id,
          "TREATY_ACCEPTED",
          {
            treatyLabel: terms.headline,
            money: terms.moneyAmount,
            provincesCount: terms.concededProvinceIds.length,
          },
          "INFO",
        ),
      );
    }

    const filteredProposals = state.pendingProposals.filter((p) => {
      const pSrc = CountryRegistry.resolveCanonicalId(p.senderNationId);
      const pRec = CountryRegistry.resolveCanonicalId(p.receiverNationId);
      const isThisPair =
        (pSrc === canonicalSource && pRec === canonicalTarget) ||
        (pSrc === canonicalTarget && pRec === canonicalSource);
      return !isThisPair;
    });

    return {
      ...state,
      provinces: updatedProvinces,
      nations: updatedNations,
      pendingProposals: filteredProposals,
      turnLogs: [...state.turnLogs, ...newLogs],
    };
  }
}
