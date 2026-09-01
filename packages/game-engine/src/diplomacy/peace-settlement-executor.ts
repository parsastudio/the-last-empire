import {
  GameState,
  Nation,
  Province,
  CountryRegistry,
  TurnLogBuilder,
  PeaceTermsCalculator,
  SignPeaceSettlementAction,
  GameError,
  getProvinceGdp,
  getNationGdp,
  NationGettersUtility,
  DebtCalculatorUtility,
  PendingProposalManagerUtility,
  IndustryCalculator,
  DIPLOMACY_CONFIG,
} from "@geopolitics/domain";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";
import { NationAnnexationExecutor } from "@/engine/combat/conquest/nation-annexation-executor";

export class PeaceSettlementExecutor {
  public static execute(
    state: GameState,
    action: SignPeaceSettlementAction,
  ): GameState {
    const sourceNation = NationGettersUtility.resolveNation(
      action.nationId,
      state.nations,
    );
    const targetNation = NationGettersUtility.resolveNation(
      action.targetNationId,
      state.nations,
    );

    if (!sourceNation || !targetNation) {
      throw new GameError("NATION_NOT_FOUND", "یکی از طرفین معاهده یافت نشد.");
    }

    const canonicalSource = CountryRegistry.resolveCanonicalId(sourceNation.id);
    const canonicalTarget = CountryRegistry.resolveCanonicalId(targetNation.id);

    const rel =
      sourceNation.relations[canonicalTarget] ||
      sourceNation.relations[targetNation.id];

    if (
      rel?.warDeclaredTurn !== undefined &&
      state.currentTurn <= rel.warDeclaredTurn
    ) {
      throw new GameError(
        "INVALID_ACTION",
        "امکان امضای معاهده صلح در همان نوبت آغاز جنگ وجود ندارد (باید حداقل یک نوبت بگذرد).",
      );
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
      state.currentTurn,
    );

    if (!terms.canAffordTerms) {
      throw new GameError(
        "INVALID_ACTION",
        terms.description || "شروط معاهده صلح در حال حاضر قابل اجرا نیست.",
      );
    }

    let updatedProvinces: Record<string, Province> = { ...state.provinces };
    let updatedNations: Record<string, Nation> = { ...state.nations };

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
      const loserProvsBefore = NationGettersUtility.getOwnedProvinces(
        loserCanonical,
        updatedProvinces,
      );
      const totalLoserGdpBefore = getNationGdp(
        loserCanonical,
        updatedProvinces,
        loserProvsBefore,
      );

      let cededGdp = 0;
      let cededFactories = 0;

      for (let i = 0; i < loserProvsBefore.length; i++) {
        const p = loserProvsBefore[i]!;
        if (terms.concededProvinceIds.includes(p.provinceId)) {
          cededGdp += getProvinceGdp(p);
          cededFactories += p.factoriesCount;
        }
      }

      const curDebt = updatedNations[loserNation.id]?.nationalDebt || 0;
      const debtRelief = DebtCalculatorUtility.calculateProportionalDebtRelief(
        curDebt,
        cededGdp,
        totalLoserGdpBefore,
      );

      const loserNationObj = updatedNations[loserNation.id]!;
      const winnerNationObj = updatedNations[winnerNation.id]!;

      const updatedLoserBatches = IndustryCalculator.removeFactories(
        loserNationObj.factoryTiers,
        cededFactories,
      );
      const updatedLoserEquipTech =
        IndustryCalculator.calculateWeightedAverageTech(
          updatedLoserBatches,
          loserNationObj.industrialLevel,
        );

      const updatedWinnerBatches = IndustryCalculator.addFactories(
        winnerNationObj.factoryTiers,
        cededFactories,
        loserNationObj.equipmentTechLevel,
      );
      const updatedWinnerEquipTech =
        IndustryCalculator.calculateWeightedAverageTech(
          updatedWinnerBatches,
          winnerNationObj.industrialLevel,
        );

      updatedNations[loserNation.id] = {
        ...loserNationObj,
        nationalDebt: Math.max(0, curDebt - debtRelief),
        factoryTiers: updatedLoserBatches,
        equipmentTechLevel: updatedLoserEquipTech,
      };

      updatedNations[winnerNation.id] = {
        ...winnerNationObj,
        factoryTiers: updatedWinnerBatches,
        equipmentTechLevel: updatedWinnerEquipTech,
      };

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
      const annexationResult = NationAnnexationExecutor.executeTotalAnnexation(
        updatedProvinces,
        updatedNations,
        winnerNation.id,
        loserNation.id,
        winnerNation.isAi ? DIPLOMACY_CONFIG.POST_WAR_COOLDOWN_TURNS : 0,
      );

      updatedProvinces = annexationResult.updatedProvinces;
      updatedNations = annexationResult.updatedNations;

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
        postWarCooldownTurns: sourceNation.isAi
          ? DIPLOMACY_CONFIG.POST_WAR_COOLDOWN_TURNS
          : 0,
        relations: sRelations,
      };

      updatedNations[targetNation.id] = {
        ...tObj,
        warFocusTargetId:
          tObj.warFocusTargetId === canonicalSource
            ? null
            : tObj.warFocusTargetId,
        postWarCooldownTurns: targetNation.isAi
          ? DIPLOMACY_CONFIG.POST_WAR_COOLDOWN_TURNS
          : 0,
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

    const filteredProposals = PendingProposalManagerUtility.removeBilateral(
      state.pendingProposals,
      sourceNation.id,
      targetNation.id,
    );

    return {
      ...state,
      provinces: updatedProvinces,
      nations: updatedNations,
      pendingProposals: filteredProposals,
      turnLogs: [...state.turnLogs, ...newLogs],
    };
  }
}
