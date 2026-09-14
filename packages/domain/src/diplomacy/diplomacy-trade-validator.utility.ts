import { Nation } from "@/domain/nation/nation.schema";
import { CountryRegistry } from "@/domain/data/countries/country-registry";
import { NationRelationResolver } from "@/domain/diplomacy/nation-relation-resolver.utility";

export class DiplomacyTradeValidator {
  public static readonly MAX_TRADE_TENSION = 50;

  public static isEligibleArmsSeller(buyer: Nation, seller: Nation): boolean {
    if (!seller.isAlive || !buyer.isAlive) return false;

    const canonicalBuyer = CountryRegistry.resolveCanonicalId(buyer.id);
    const canonicalSeller = CountryRegistry.resolveCanonicalId(seller.id);

    if (canonicalBuyer === canonicalSeller) return false;

    const rel = NationRelationResolver.getRelation(
      seller.relations,
      canonicalBuyer,
    );
    const stance = rel ? rel.stance : "NORMAL_DIPLOMACY";
    const tension = rel ? (rel.tension ?? 10) : 10;

    return (
      stance !== "WAR" &&
      tension < this.MAX_TRADE_TENSION &&
      seller.military.techLevel > buyer.military.techLevel
    );
  }

  public static isEligibleMachinerySeller(
    buyer: Nation,
    seller: Nation,
    minRequiredTechLevel?: number,
  ): boolean {
    if (!seller.isAlive || !buyer.isAlive) return false;

    const canonicalBuyer = CountryRegistry.resolveCanonicalId(buyer.id);
    const canonicalSeller = CountryRegistry.resolveCanonicalId(seller.id);

    if (canonicalBuyer === canonicalSeller) return false;

    const rel = NationRelationResolver.getRelation(
      buyer.relations,
      canonicalSeller,
    );
    const stance = rel ? rel.stance : "NORMAL_DIPLOMACY";
    const tension = rel ? (rel.tension ?? 10) : 10;

    if (stance === "WAR" || tension >= this.MAX_TRADE_TENSION) {
      return false;
    }

    const requiredFloor = minRequiredTechLevel ?? buyer.equipmentTechLevel;
    return seller.industrialLevel > requiredFloor;
  }
}
