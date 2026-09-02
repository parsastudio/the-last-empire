import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { NationGettersUtility } from "@/domain/nation/nation-getters.utility";
import { LandNeighborResolver } from "@/domain/map/land-neighbor-resolver";
import { NationRelationResolver } from "@/domain/diplomacy/nation-relation-resolver.utility";
import { getProvinceGdp } from "@/domain/nation/gdp-calculator.utility";

export interface ProvinceTradeValidationResult {
  isValid: boolean;
  reason?: string;
  isOwnCountry: boolean;
  isAtWar: boolean;
  hasBoughtThisTurn: boolean;
  isHigherRankSeller: boolean;
  isLastProvince: boolean;
  isLastCoastalProvince: boolean;
  isGeographicallyConnected: boolean;
  canAfford: boolean;
  purchasePrice: number;
  provinceGdp: number;
  shortageAmount: number;
  buyerRank: number;
  sellerRank: number;
  costMultiplier: number;
}

export class ProvinceTradeValidator {
  public static validate(
    buyer: Nation,
    seller: Nation,
    province: Province,
    provincesMap?: Record<string, Province>,
    nationsMap?: Record<string, Nation>,
  ): ProvinceTradeValidationResult {
    const canonicalBuyer = CountryRegistry.resolveCanonicalId(buyer.id);
    const canonicalSeller = CountryRegistry.resolveCanonicalId(seller.id);
    const canonicalOwner = CountryRegistry.resolveCanonicalId(
      province.ownerNationId,
    );

    const isOwnCountry = canonicalBuyer === canonicalOwner;

    const rel = NationRelationResolver.getRelation(
      seller.relations,
      canonicalBuyer,
    );
    const isAtWar = rel?.stance === "WAR";

    const hasBoughtThisTurn = Boolean(buyer.hasBoughtProvinceThisTurn);

    const buyerRank = NationGettersUtility.getRank(
      buyer.id,
      nationsMap,
      provincesMap,
    );
    const sellerRank = NationGettersUtility.getRank(
      seller.id,
      nationsMap,
      provincesMap,
    );

    const isHigherRankSeller = sellerRank < buyerRank;

    const sellerOwnedProvinces = provincesMap
      ? Object.values(provincesMap).filter(
          (p) =>
            CountryRegistry.resolveCanonicalId(p.ownerNationId) ===
            canonicalSeller,
        )
      : [];

    const isLastProvince = sellerOwnedProvinces.length <= 1;

    const sellerCoastalCount = sellerOwnedProvinces.filter((p) =>
      Boolean(p.hasSeaAccess),
    ).length;
    const hasSeaAccess = Boolean(province.hasSeaAccess);
    const isLastCoastalProvince = hasSeaAccess && sellerCoastalCount <= 1;

    const isLandNeighbor = provincesMap
      ? LandNeighborResolver.hasProvinceLandBorder(
          province.provinceId,
          buyer.id,
          provincesMap,
        )
      : false;

    const buyerHasSea = provincesMap
      ? NationGettersUtility.hasSeaAccess(buyer.id, provincesMap)
      : false;

    const isMaritimeAccessible = buyerHasSea && hasSeaAccess;
    const isGeographicallyConnected = isLandNeighbor || isMaritimeAccessible;

    const costMultiplier = hasSeaAccess ? 1.5 : 1.0;
    const provinceGdp = getProvinceGdp(
      province,
      seller.equipmentTechLevel ?? 1.0,
    );
    const purchasePrice = Math.max(
      10_000_000_000,
      Math.floor(provinceGdp * costMultiplier),
    );

    const canAfford = buyer.treasury >= purchasePrice;
    const shortageAmount = Math.max(0, purchasePrice - buyer.treasury);

    let reason: string | undefined = undefined;

    if (isOwnCountry) {
      reason = "این استان در حال حاضر در تملک قانونی امپراتوری شماست.";
    } else if (isAtWar) {
      reason = `کشور ${seller.name} به دلیل وضعیت جنگی حاضر به واگذاری این استان نیست.`;
    } else if (hasBoughtThisTurn) {
      reason =
        "سقف خرید استان در این نوبت تکمیل شده است (حداکثر ۱ استان در هر نوبت).";
    } else if (isHigherRankSeller) {
      reason = `کشور ${seller.name} (رتبه #${sellerRank}) دارای سطح قدرت بالاتری از شما (رتبه #${buyerRank}) است و به کشور ضعیف‌تر استان نمی‌فروشد.`;
    } else if (isLastProvince) {
      reason = `امکان خرید آخرین استان کشور ${seller.name} وجود ندارد.`;
    } else if (isLastCoastalProvince) {
      reason = `کشور ${seller.name} حاضر به واگذاری تنها دسترسی دریایی خود نیست.`;
    } else if (!isGeographicallyConnected) {
      reason = "عدم وجود پیوستگی مرزی زمینی یا دسترسی به آب‌های آزاد.";
    } else if (!canAfford) {
      reason = "موجودی خزانه ملی برای تأمین قیمت خرید این استان کافی نیست.";
    }

    const isValid =
      !isOwnCountry &&
      !isAtWar &&
      !hasBoughtThisTurn &&
      !isHigherRankSeller &&
      !isLastProvince &&
      !isLastCoastalProvince &&
      isGeographicallyConnected &&
      canAfford;

    return {
      isValid,
      reason,
      isOwnCountry,
      isAtWar,
      hasBoughtThisTurn,
      isHigherRankSeller,
      isLastProvince,
      isLastCoastalProvince,
      isGeographicallyConnected,
      canAfford,
      purchasePrice,
      provinceGdp,
      shortageAmount,
      buyerRank,
      sellerRank,
      costMultiplier,
    };
  }
}
