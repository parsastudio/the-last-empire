import { Nation, DiplomacyTradeValidator } from "@geopolitics/domain";

export class AIArmsSellerMatcher {
  public static findEligibleArmsSellers(
    buyer: Nation,
    allNations: Record<string, Nation>,
  ): Nation[] {
    const sellers: Nation[] = [];

    for (const seller of Object.values(allNations)) {
      if (DiplomacyTradeValidator.isEligibleArmsSeller(buyer, seller)) {
        sellers.push(seller);
      }
    }

    sellers.sort((a, b) => b.military.techLevel - a.military.techLevel);
    return sellers;
  }

  public static findBestArmsSeller(
    buyer: Nation,
    allNations: Record<string, Nation>,
  ): Nation | null {
    const sellers = this.findEligibleArmsSellers(buyer, allNations);
    return sellers.length > 0 ? sellers[0]! : null;
  }
}
