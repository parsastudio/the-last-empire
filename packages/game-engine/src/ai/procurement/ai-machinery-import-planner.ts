import {
  GameAction,
  ActionFactory,
  Nation,
  CountryRegistry,
  IndustryCalculator,
} from "@geopolitics/domain";

export interface MachineryImportPlanResult {
  actions: GameAction[];
  remainingTreasury: number;
}

export class AIMachineryImportPlanner {
  public static readonly MAX_IMPORT_SELLERS = 10;

  private static calculateDecayWeights(count: number): number[] {
    if (count <= 0) return [];
    if (count === 1) return [1.0];

    const rawWeights = new Array<number>(count);
    let sum = 0;
    for (let i = 0; i < count; i++) {
      const w = Math.pow(11 - (i + 1), 1.4);
      rawWeights[i] = w;
      sum += w;
    }

    return rawWeights.map((w) => w / (sum || 1));
  }

  public static planImport(
    buyer: Nation,
    allNations: Record<string, Nation>,
    availableTreasury: number,
  ): MachineryImportPlanResult {
    const actions: GameAction[] = [];
    if (availableTreasury < IndustryCalculator.IMPORT_BASE_PRICE) {
      return { actions, remainingTreasury: availableTreasury };
    }

    const eligibleSellers: { nation: Nation; techGap: number }[] = [];

    for (const seller of Object.values(allNations)) {
      if (!seller.isAlive || seller.id === buyer.id) continue;
      const canonicalSeller = CountryRegistry.resolveCanonicalId(seller.id);
      const rel =
        buyer.relations[canonicalSeller] || buyer.relations[seller.id];

      if (rel?.stance === "WAR" || (rel?.tension ?? 10) >= 50) continue;
      if (seller.industrialLevel > buyer.equipmentTechLevel) {
        eligibleSellers.push({
          nation: seller,
          techGap: seller.industrialLevel - buyer.industrialLevel,
        });
      }
    }

    if (eligibleSellers.length === 0) {
      return { actions, remainingTreasury: availableTreasury };
    }

    eligibleSellers.sort((a, b) => b.techGap - a.techGap);
    const topSellers = eligibleSellers.slice(0, this.MAX_IMPORT_SELLERS);
    const weights = this.calculateDecayWeights(topSellers.length);

    const totalImportBudget = Math.floor(availableTreasury * 0.4);
    let currentTreasury = availableTreasury;

    for (let i = 0; i < topSellers.length; i++) {
      const seller = topSellers[i]!.nation;
      const sellerWeight = weights[i] || 0;
      const sellerAllocatedBudget = Math.floor(
        totalImportBudget * sellerWeight,
      );

      if (sellerAllocatedBudget <= 0) continue;

      const unitPrice = IndustryCalculator.calculateEquipmentImportPrice(
        seller.industrialLevel,
        buyer.equipmentTechLevel,
        buyer.industrialLevel,
      );

      if (unitPrice <= 0) continue;

      const maxAffordable = Math.floor(
        Math.min(currentTreasury, sellerAllocatedBudget) / unitPrice,
      );
      if (maxAffordable <= 0) continue;

      const quantityToBuy = Math.min(maxAffordable, 20);
      const totalCost = quantityToBuy * unitPrice;

      if (totalCost > 0 && currentTreasury >= totalCost) {
        actions.push(
          ActionFactory.buyIndustrialEquipment(
            buyer.id,
            seller.id,
            quantityToBuy,
          ),
        );
        currentTreasury -= totalCost;
      }
    }

    return {
      actions,
      remainingTreasury: currentTreasury,
    };
  }
}
