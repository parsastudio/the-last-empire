import { Nation, CountryRegistry } from "@geopolitics/domain";

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

      const rel =
        seller.relations[canonicalBuyer] || seller.relations[buyer.id];
      const stance = rel ? rel.stance : "NORMAL_DIPLOMACY";
      const tension = rel ? (rel.tension ?? 10) : 10;

      if (stance !== "WAR" && tension < 50) {
        sellers.push(seller);
      }
    }

    sellers.sort((a, b) => b.military.techLevel - a.military.techLevel);
    return sellers;
  }
}
