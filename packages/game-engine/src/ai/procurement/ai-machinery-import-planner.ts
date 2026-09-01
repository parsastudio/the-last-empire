import {
  GameAction,
  ActionFactory,
  Nation,
  CountryRegistry,
  IndustryCalculator,
  NationGettersUtility,
} from "@geopolitics/domain";

export interface MachineryImportPlanResult {
  actions: GameAction[];
  spentMoney: number;
}

export class AIMachineryImportPlanner {
  public static readonly MAX_IMPORT_SELLERS = 10;

  private static calculateDecayWeights(count: number): number[] {
    if (count <= 0) return [];
    if (count === 1) return [1.0];

    const rawWeights = new Array<number>(count);
    let sum = 0;
    for (let i = 0; i < count; i++) {
      const w = Math.pow(11 - (i + 1), 1.5);
      rawWeights[i] = w;
      sum += w;
    }

    return rawWeights.map((w) => w / (sum || 1));
  }

  public static planImport(
    buyer: Nation,
    allNations: Record<string, Nation>,
    allocatedImportBudget: number,
  ): MachineryImportPlanResult {
    const actions: GameAction[] = [];
    if (allocatedImportBudget < IndustryCalculator.IMPORT_BASE_PRICE) {
      return { actions, spentMoney: 0 };
    }

    const eligibleSellers: { nation: Nation; industrialLevel: number }[] = [];
    const canonicalBuyer = CountryRegistry.resolveCanonicalId(buyer.id);

    for (const seller of Object.values(allNations)) {
      if (!seller.isAlive || seller.id === buyer.id) continue;
      const canonicalSeller = CountryRegistry.resolveCanonicalId(seller.id);
      if (canonicalSeller === canonicalBuyer) continue;

      const rel =
        buyer.relations[canonicalSeller] || buyer.relations[seller.id];

      if (rel?.stance === "WAR" || (rel?.tension ?? 10) >= 50) continue;

      if (seller.industrialLevel > buyer.equipmentTechLevel) {
        eligibleSellers.push({
          nation: seller,
          industrialLevel: seller.industrialLevel,
        });
      }
    }

    if (eligibleSellers.length === 0) {
      return { actions, spentMoney: 0 };
    }

    eligibleSellers.sort((a, b) => b.industrialLevel - a.industrialLevel);
    const topSellers = eligibleSellers.slice(0, this.MAX_IMPORT_SELLERS);
    const weights = this.calculateDecayWeights(topSellers.length);

    let remainingBudget = allocatedImportBudget;
    let spentMoney = 0;

    const buyerBatches = NationGettersUtility.getNationFactoryTiers(
      buyer.id,
      undefined,
    );
    const totalFactories = buyerBatches.reduce((sum, b) => sum + b.count, 0);

    if (totalFactories <= 0) {
      return { actions, spentMoney: 0 };
    }

    for (let i = 0; i < topSellers.length; i++) {
      const seller = topSellers[i]!.nation;
      const sellerWeight = weights[i] || 0;
      const sellerBudget = Math.floor(allocatedImportBudget * sellerWeight);

      if (sellerBudget <= 0 || remainingBudget <= 0) continue;

      const minTechBatch = buyerBatches.length
        ? Math.min(...buyerBatches.map((b) => b.techLevel))
        : buyer.equipmentTechLevel;

      if (minTechBatch >= seller.industrialLevel) continue;

      const unitPrice = IndustryCalculator.calculateEquipmentImportPrice(
        seller.industrialLevel,
        minTechBatch,
        buyer.industrialLevel,
      );

      if (unitPrice <= 0) continue;

      const maxAffordable = Math.floor(
        Math.min(remainingBudget, sellerBudget) / unitPrice,
      );
      if (maxAffordable <= 0) continue;

      const quantityToBuy = Math.min(
        maxAffordable,
        Math.max(1, Math.ceil(totalFactories * 0.15)),
      );
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
    };
  }
}
