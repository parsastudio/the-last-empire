import { GameState } from "@/domain/game/game-state.schema";
import { BuyIndustrialEquipmentAction } from "@/domain/game/action.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { ProvinceDynamicState } from "@/domain/province/province.schema";
import { GameError, TurnLogBuilder } from "@/domain/shared/domain-utilities";
import { CountryRegistry } from "@/domain/data/countries";
import { IndustryCalculator } from "@/domain/economy/industry-calculator.utility";
import { NationGettersUtility } from "@geopolitics/domain";
import { ExecutionResult } from "@/engine/actions/execution-result";

export class BuyIndustrialEquipmentExecutor {
  public static execute(
    state: GameState,
    action: BuyIndustrialEquipmentAction,
    buyer: Nation,
    buyerKey: string,
  ): ExecutionResult<{
    quantity: number;
    totalCost: number;
    sellerId: string;
  }> {
    const sellerCanonical = CountryRegistry.resolveCanonicalId(
      action.sellerNationId,
    );
    const seller =
      state.nations[sellerCanonical] || state.nations[action.sellerNationId];

    if (!seller || !seller.isAlive) {
      throw new GameError(
        "SELLER_NOT_FOUND",
        "کشور فروشنده تجهیزات صنعتی در دسترس نیست.",
      );
    }

    const rel =
      buyer.relations[sellerCanonical] ||
      buyer.relations[action.sellerNationId];
    if (rel?.stance === "WAR" || (rel?.tension ?? 10) >= 50) {
      throw new GameError(
        "DIPLOMATIC_TENSION",
        "به دلیل تنش دیپلماتیک یا جنگ، امکان معامله صنعتی با این کشور وجود ندارد.",
      );
    }

    const sellerTech = seller.industrialLevel;
    const canonicalBuyer = CountryRegistry.resolveCanonicalId(buyer.id);
    const ownedProvinces = Object.values(state.provinces).filter(
      (p) =>
        CountryRegistry.resolveCanonicalId(p.ownerNationId) === canonicalBuyer,
    );

    const nationalBatches = NationGettersUtility.getNationFactoryTiers(
      buyer.id,
      state.provinces,
      ownedProvinces,
    );

    const totalBuyerFactories = nationalBatches.reduce(
      (sum, b) => sum + b.count,
      0,
    );

    if (totalBuyerFactories <= 0) {
      throw new GameError(
        "INVALID_ACTION",
        "شما کارخانه فعالی برای نصب تجهیزات وارداتی ندارید.",
      );
    }

    const requestedSourceTech = action.sourceTechLevel;

    if (requestedSourceTech !== undefined) {
      const roundedSource = Number(requestedSourceTech.toFixed(2));
      if (roundedSource >= sellerTech) {
        throw new GameError(
          "INVALID_ACTION",
          "سطح فناوری صنعتی فروشنده از این رده بالاتر نیست.",
        );
      }

      const availableInTier = nationalBatches
        .filter((b) => Math.abs(b.techLevel - roundedSource) < 0.05)
        .reduce((sum, b) => sum + b.count, 0);

      if (availableInTier <= 0) {
        throw new GameError(
          "INVALID_ACTION",
          "هیچ کارخانه‌ای در رده انتخابی جهت واردات تجهیزات یافت نشد.",
        );
      }

      const qty = Math.min(availableInTier, action.quantity);
      const unitPrice = IndustryCalculator.calculateEquipmentImportPrice(
        sellerTech,
        roundedSource,
        buyer.industrialLevel,
      );
      const totalCost = qty * unitPrice;

      if (buyer.treasury < totalCost) {
        throw new GameError(
          "INSUFFICIENT_FUNDS",
          "موجودی خزانه برای واردات این حجم از ابزارآلات صنعتی کافی نیست.",
        );
      }

      let provRemainingToUpgrade = qty;
      const updatedProvinces: Record<string, ProvinceDynamicState> = {
        ...state.provinces,
      };

      for (
        let i = 0;
        i < ownedProvinces.length && provRemainingToUpgrade > 0;
        i++
      ) {
        const p = ownedProvinces[i]!;
        const matchingInProv = p.factoryTiers
          .filter((t) => Math.abs(t.techLevel - roundedSource) < 0.05)
          .reduce((sum, t) => sum + t.count, 0);

        if (matchingInProv <= 0) continue;

        const takeCount = Math.min(matchingInProv, provRemainingToUpgrade);
        const nextTiers = IndustryCalculator.upgradeSpecificTier(
          p.factoryTiers,
          takeCount,
          roundedSource,
          sellerTech,
        );

        updatedProvinces[p.provinceId.toString()] = {
          ...p,
          factoryTiers: nextTiers,
        };

        provRemainingToUpgrade -= takeCount;
      }

      const updatedBatches = NationGettersUtility.getNationFactoryTiers(
        buyer.id,
        updatedProvinces,
      );
      const newEquipTech = IndustryCalculator.calculateWeightedAverageTech(
        updatedBatches,
        sellerTech,
      );

      const sellerKey = state.nations[sellerCanonical]
        ? sellerCanonical
        : seller.id;

      const canonicalHuman = CountryRegistry.resolveCanonicalId(
        state.humanNationId,
      );
      const isHumanSeller = sellerCanonical === canonicalHuman;

      const logs = [];
      if (isHumanSeller && totalCost > 0) {
        logs.push(
          TurnLogBuilder.createNationalLog(
            state.currentTurn,
            seller.id,
            "DOMESTIC",
            "INFO",
            "ARMS_TRADE",
            {
              amount: totalCost,
              role: "SELLER",
              tradeType: "MACHINERY",
            },
            buyer.id,
          ),
        );
      }

      const newState: GameState = {
        ...state,
        provinces: updatedProvinces,
        turnLogs: [...state.turnLogs, ...logs],
        nations: {
          ...state.nations,
          [buyerKey]: {
            ...buyer,
            treasury: buyer.treasury - totalCost,
            factoryTiers: updatedBatches,
            equipmentTechLevel: newEquipTech,
          },
          [sellerKey]: {
            ...seller,
            treasury: seller.treasury + totalCost,
          },
        },
      };

      return {
        newState,
        resultData: {
          quantity: qty,
          totalCost,
          sellerId: seller.id,
        },
        logs,
      };
    }

    const hasImportableFactories = nationalBatches.some(
      (b) => b.techLevel < sellerTech,
    );

    if (!hasImportableFactories) {
      throw new GameError(
        "INVALID_ACTION",
        "سطح فناوری صنعتی فروشنده از تمام خطوط تولید فعلی شما بالاتر نیست.",
      );
    }

    const qty = Math.min(totalBuyerFactories, action.quantity);

    let totalCost = 0;
    let remainingToUpgrade = qty;
    const consolidated = IndustryCalculator.consolidateBatches(nationalBatches);

    for (let i = 0; i < consolidated.length; i++) {
      const batch = consolidated[i]!;
      if (batch.techLevel >= sellerTech || remainingToUpgrade <= 0) continue;
      const countToTake = Math.min(batch.count, remainingToUpgrade);
      const unitPrice = IndustryCalculator.calculateEquipmentImportPrice(
        sellerTech,
        batch.techLevel,
        buyer.industrialLevel,
      );
      totalCost += countToTake * unitPrice;
      remainingToUpgrade -= countToTake;
    }

    if (buyer.treasury < totalCost) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "موجودی خزانه برای واردات این حجم از ابزارآلات صنعتی کافی نیست.",
      );
    }

    let provRemainingToUpgrade = qty;
    const updatedProvinces: Record<string, ProvinceDynamicState> = {
      ...state.provinces,
    };

    const sortedProvinces = [...ownedProvinces].sort((a, b) => {
      const minTechA = a.factoryTiers.length
        ? Math.min(...a.factoryTiers.map((t) => t.techLevel))
        : 1.0;
      const minTechB = b.factoryTiers.length
        ? Math.min(...b.factoryTiers.map((t) => t.techLevel))
        : 1.0;
      return minTechA - minTechB;
    });

    for (
      let i = 0;
      i < sortedProvinces.length && provRemainingToUpgrade > 0;
      i++
    ) {
      const p = sortedProvinces[i]!;
      const upgradableInProv = p.factoryTiers
        .filter((t) => t.techLevel < sellerTech)
        .reduce((sum, t) => sum + t.count, 0);

      if (upgradableInProv <= 0) continue;

      const takeCount = Math.min(upgradableInProv, provRemainingToUpgrade);
      const nextTiers = IndustryCalculator.upgradeLowestFactories(
        p.factoryTiers,
        takeCount,
        sellerTech,
      );

      updatedProvinces[p.provinceId.toString()] = {
        ...p,
        factoryTiers: nextTiers,
      };

      provRemainingToUpgrade -= takeCount;
    }

    const updatedBatches = NationGettersUtility.getNationFactoryTiers(
      buyer.id,
      updatedProvinces,
    );
    const newEquipTech = IndustryCalculator.calculateWeightedAverageTech(
      updatedBatches,
      sellerTech,
    );

    const sellerKey = state.nations[sellerCanonical]
      ? sellerCanonical
      : seller.id;

    const canonicalHuman = CountryRegistry.resolveCanonicalId(
      state.humanNationId,
    );
    const isHumanSeller = sellerCanonical === canonicalHuman;

    const logs = [];
    if (isHumanSeller && totalCost > 0) {
      logs.push(
        TurnLogBuilder.createNationalLog(
          state.currentTurn,
          seller.id,
          "DOMESTIC",
          "INFO",
          "ARMS_TRADE",
          {
            amount: totalCost,
            role: "SELLER",
            tradeType: "MACHINERY",
          },
          buyer.id,
        ),
      );
    }

    const newState: GameState = {
      ...state,
      provinces: updatedProvinces,
      turnLogs: [...state.turnLogs, ...logs],
      nations: {
        ...state.nations,
        [buyerKey]: {
          ...buyer,
          treasury: buyer.treasury - totalCost,
          factoryTiers: updatedBatches,
          equipmentTechLevel: newEquipTech,
        },
        [sellerKey]: {
          ...seller,
          treasury: seller.treasury + totalCost,
        },
      },
    };

    return {
      newState,
      resultData: {
        quantity: qty,
        totalCost,
        sellerId: seller.id,
      },
      logs,
    };
  }
}
