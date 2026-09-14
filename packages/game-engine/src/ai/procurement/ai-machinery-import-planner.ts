import {
  GameAction,
  ActionFactory,
  Nation,
  Province,
  IndustryCalculator,
  NationGettersUtility,
  DiplomacyTradeValidator,
} from "@geopolitics/domain";
import { AiProcurementWeightsUtility } from "@/engine/ai/procurement/ai-procurement-weights.utility";

export interface MachineryImportPlanResult {
  actions: GameAction[];
  spentMoney: number;
  remainingBudget: number;
}

export class AIMachineryImportPlanner {
  public static readonly MAX_IMPORT_SELLERS = 10;

  public static planImport(
    buyer: Nation,
    allNations: Record<string, Nation>,
    allocatedImportBudget: number,
    provincesMap?: Record<string, Province>,
    ownedProvinces?: Province[],
  ): MachineryImportPlanResult {
    const actions: GameAction[] = [];
    if (allocatedImportBudget < IndustryCalculator.IMPORT_BASE_PRICE) {
      return { actions, spentMoney: 0, remainingBudget: allocatedImportBudget };
    }

    const eligibleSellers: { nation: Nation; industrialLevel: number }[] = [];

    for (const seller of Object.values(allNations)) {
      if (DiplomacyTradeValidator.isEligibleMachinerySeller(buyer, seller)) {
        eligibleSellers.push({
          nation: seller,
          industrialLevel: seller.industrialLevel,
        });
      }
    }

    if (eligibleSellers.length === 0) {
      return { actions, spentMoney: 0, remainingBudget: allocatedImportBudget };
    }

    eligibleSellers.sort((a, b) => b.industrialLevel - a.industrialLevel);
    const topSellers = eligibleSellers.slice(0, this.MAX_IMPORT_SELLERS);
    const weights = AiProcurementWeightsUtility.calculateDecayWeights(
      topSellers.length,
      1.5,
    );

    let remainingBudget = allocatedImportBudget;
    let spentMoney = 0;

    const probedBatches = NationGettersUtility.getNationFactoryTiers(
      buyer.id,
      provincesMap,
      ownedProvinces,
    );

    const buyerBatches =
      probedBatches.length > 0 ? probedBatches : (buyer.factoryTiers ?? []);
    const totalFactories = buyerBatches.reduce((sum, b) => sum + b.count, 0);

    if (totalFactories <= 0) {
      return { actions, spentMoney: 0, remainingBudget: allocatedImportBudget };
    }

    for (let i = 0; i < topSellers.length; i++) {
      const seller = topSellers[i]!.nation;
      const sellerWeight = weights[i] || 0;
      const calculatedShare = Math.floor(allocatedImportBudget * sellerWeight);

      const minTechBatch = buyerBatches.length
        ? Math.min(...buyerBatches.map((b) => b.techLevel))
        : buyer.equipmentTechLevel;

      if (minTechBatch >= seller.industrialLevel) continue;

      const unitPrice = IndustryCalculator.calculateEquipmentImportPrice(
        seller.industrialLevel,
        minTechBatch,
        buyer.industrialLevel,
      );

      if (unitPrice <= 0 || remainingBudget < unitPrice) continue;

      const effectiveBudget = Math.min(
        remainingBudget,
        calculatedShare >= unitPrice ? calculatedShare : remainingBudget,
      );

      const maxAffordable = Math.floor(effectiveBudget / unitPrice);
      if (maxAffordable <= 0) continue;

      const targetBatchCount = Math.max(1, Math.ceil(totalFactories * 0.2));
      const quantityToBuy = Math.min(maxAffordable, targetBatchCount);
      const totalCost = quantityToBuy * unitPrice;

      if (totalCost > 0 && remainingBudget >= totalCost) {
        actions.push(
          ActionFactory.buyIndustrialEquipment(
            buyer.id,
            seller.id,
            quantityToBuy,
          ),
        );
        remainingBudget -= totalCost;
        spentMoney += totalCost;
      }
    }

    return {
      actions,
      spentMoney,
      remainingBudget,
    };
  }
}
