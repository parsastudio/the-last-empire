import {
  GameAction,
  ActionFactory,
  Nation,
  CountryRegistry,
  IndustryCalculator,
} from "@geopolitics/domain";

export class AIMachineryImportPlanner {
  public static planImport(
    buyer: Nation,
    allNations: Record<string, Nation>,
    availableTreasury: number,
  ): { action: GameAction | null; remainingTreasury: number } {
    if (availableTreasury < IndustryCalculator.IMPORT_BASE_PRICE) {
      return { action: null, remainingTreasury: availableTreasury };
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
      return { action: null, remainingTreasury: availableTreasury };
    }

    eligibleSellers.sort((a, b) => b.techGap - a.techGap);
    const bestSeller = eligibleSellers[0]!.nation;

    const unitPrice = IndustryCalculator.calculateEquipmentImportPrice(
      bestSeller.industrialLevel,
      buyer.equipmentTechLevel,
      buyer.industrialLevel,
    );

    const maxAffordable = Math.floor((availableTreasury * 0.4) / unitPrice);
    if (maxAffordable <= 0) {
      return { action: null, remainingTreasury: availableTreasury };
    }

    const quantityToBuy = Math.min(maxAffordable, 20);
    const totalCost = quantityToBuy * unitPrice;

    const action = ActionFactory.buyIndustrialEquipment(
      buyer.id,
      bestSeller.id,
      quantityToBuy,
    );

    return {
      action,
      remainingTreasury: availableTreasury - totalCost,
    };
  }
}
