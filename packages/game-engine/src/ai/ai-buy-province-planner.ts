import {
  GameAction,
  ActionFactory,
  Nation,
  Province,
  CountryRegistry,
  ProvinceTradeValidator,
  NationRelationResolver,
} from "@geopolitics/domain";

export interface BuyProvincePlanResult {
  action: GameAction | null;
  cost: number;
}

interface ProvinceEvaluationCandidate {
  sellerId: string;
  provinceId: number;
  purchasePrice: number;
  utilityScore: number;
}

export class AIBuyProvincePlanner {
  public static readonly MIN_TREASURY_RESERVE_RATIO = 0.35;
  public static readonly ABSOLUTE_MIN_TREASURY = 20_000_000_000;

  public static planBuyProvince(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    rankMap?: Map<string, number>,
    reachableTargets?: Nation[],
    availableTreasury?: number,
  ): BuyProvincePlanResult {
    const currentTreasury =
      availableTreasury !== undefined ? availableTreasury : nation.treasury;

    if (
      !nation.isAlive ||
      !nation.isAi ||
      nation.hasBoughtProvinceThisTurn ||
      currentTreasury < this.ABSOLUTE_MIN_TREASURY ||
      !provincesMap
    ) {
      return { action: null, cost: 0 };
    }

    if (NationRelationResolver.isAtWar(nation, allNations)) {
      return { action: null, cost: 0 };
    }

    const potentialSellers =
      reachableTargets ?? Object.values(allNations).filter((n) => n.isAlive);

    let bestCandidate: ProvinceEvaluationCandidate | null = null;

    for (let i = 0; i < potentialSellers.length; i++) {
      const seller = potentialSellers[i]!;
      if (seller.id === nation.id || !seller.isAlive) continue;

      const canonicalSeller = CountryRegistry.resolveCanonicalId(seller.id);
      const isWar = NationRelationResolver.isWar(
        nation.relations,
        canonicalSeller,
      );
      if (isWar) continue;

      const rel =
        nation.relations[canonicalSeller] || nation.relations[seller.id];
      if ((rel?.tension ?? 10) >= 45) continue;

      const sellerProvinces = Object.values(provincesMap).filter(
        (p) =>
          CountryRegistry.resolveCanonicalId(p.ownerNationId) ===
          canonicalSeller,
      );

      if (sellerProvinces.length <= 1) continue;

      for (let pIdx = 0; pIdx < sellerProvinces.length; pIdx++) {
        const province = sellerProvinces[pIdx]!;
        const validation = ProvinceTradeValidator.validate(
          nation,
          seller,
          province,
          provincesMap,
          allNations,
        );

        if (!validation.isValid) continue;

        const purchasePrice = validation.purchasePrice;
        const postPurchaseRemaining = currentTreasury - purchasePrice;
        const requiredReserve = Math.floor(
          currentTreasury * this.MIN_TREASURY_RESERVE_RATIO,
        );

        if (postPurchaseRemaining < requiredReserve) continue;

        const maritimeBonus = province.hasSeaAccess ? 1.4 : 1.0;
        const economicReturn = validation.provinceGdp * maritimeBonus;
        const costPenalty = purchasePrice * 0.1;
        const utilityScore =
          economicReturn + province.pixelCount * 10 - costPenalty;

        if (!bestCandidate || utilityScore > bestCandidate.utilityScore) {
          bestCandidate = {
            sellerId: seller.id,
            provinceId: province.provinceId,
            purchasePrice,
            utilityScore,
          };
        }
      }
    }

    if (bestCandidate) {
      return {
        action: ActionFactory.buyProvince(
          nation.id,
          bestCandidate.sellerId,
          bestCandidate.provinceId,
          bestCandidate.purchasePrice,
        ),
        cost: bestCandidate.purchasePrice,
      };
    }

    return { action: null, cost: 0 };
  }
}
