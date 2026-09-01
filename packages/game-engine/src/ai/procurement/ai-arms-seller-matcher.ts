import {
  Nation,
  CountryRegistry,
  NationRelationResolver,
} from "@geopolitics/domain";

export class AIArmsSellerMatcher {
  public static findEligibleArmsSellers(
    buyer: Nation,
    allNations: Record<string, Nation>,
  ): Nation[] {
    const sellers: Nation[] = [];
    const canonicalBuyer = CountryRegistry.resolveCanonicalId(buyer.id);

    for (const seller of Object.values(allNations)) {
      if (!seller.isAlive || seller.id === buyer.id) continue;
      const canonicalSeller = CountryRegistry.resolveCanonicalId(seller.id);
      if (canonicalSeller === canonicalBuyer) continue;

      const rel = NationRelationResolver.getRelation(
        seller.relations,
        canonicalBuyer,
      );
      const stance = rel ? rel.stance : "NORMAL_DIPLOMACY";
      const tension = rel ? (rel.tension ?? 10) : 10;

      if (
        stance !== "WAR" &&
        tension < 50 &&
        seller.military.techLevel > buyer.military.techLevel
      ) {
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
