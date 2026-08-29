import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { getProvinceGdp } from "@/domain/nation/gdp-calculator.utility";
import { CountryRegistry } from "@/domain/data/countries";
import { LandNeighborResolver } from "@/domain/map/land-neighbor-resolver";
import { NationGettersUtility } from "@/domain/nation/nation-getters.utility";
import { NationRelationResolver } from "@/domain/diplomacy/nation-relation-resolver.utility";

export interface ProvinceBuyoutEvaluation {
  canBuy: boolean;
  cost: number;
  provinceGdp: number;
  reason?: string;
  isCoastal: boolean;
  multiplier: number;
  estimatedRoiTurns: number;
}

export class ProvinceBuyoutCalculator {
  public static readonly INLAND_MULTIPLIER = 4;
  public static readonly COASTAL_MULTIPLIER = 5;

  public static calculateCost(province: Province): {
    cost: number;
    multiplier: number;
    provinceGdp: number;
  } {
    const provinceGdp = getProvinceGdp(province);
    const multiplier = province.hasSeaAccess
      ? this.COASTAL_MULTIPLIER
      : this.INLAND_MULTIPLIER;
    const cost = Math.max(10_000_000_000, Math.floor(provinceGdp * multiplier));
    return { cost, multiplier, provinceGdp };
  }

  public static evaluate(
    buyer: Nation,
    provinceId: number,
    provincesMap?: Record<string, Province>,
    allNations?: Record<string, Nation>,
  ): ProvinceBuyoutEvaluation {
    if (!provincesMap || !provinceId) {
      return {
        canBuy: false,
        cost: 0,
        provinceGdp: 0,
        isCoastal: false,
        multiplier: 4,
        estimatedRoiTurns: 4,
        reason: "اطلاعات استان در دسترس نیست.",
      };
    }

    const province = provincesMap[provinceId.toString()];
    if (!province) {
      return {
        canBuy: false,
        cost: 0,
        provinceGdp: 0,
        isCoastal: false,
        multiplier: 4,
        estimatedRoiTurns: 4,
        reason: "استان مورد نظر یافت نشد.",
      };
    }

    const canonicalBuyerId = CountryRegistry.resolveCanonicalId(buyer.id);
    const canonicalOwnerId = CountryRegistry.resolveCanonicalId(
      province.ownerNationId,
    );

    if (canonicalBuyerId === canonicalOwnerId) {
      return {
        canBuy: false,
        cost: 0,
        provinceGdp: getProvinceGdp(province),
        isCoastal: province.hasSeaAccess,
        multiplier: province.hasSeaAccess ? 5 : 4,
        estimatedRoiTurns: 0,
        reason: "این استان در حال حاضر متعلق به خاک خود شماست.",
      };
    }

    const seller = allNations
      ? allNations[canonicalOwnerId] || allNations[province.ownerNationId]
      : null;
    if (!seller || !seller.isAlive) {
      return {
        canBuy: false,
        cost: 0,
        provinceGdp: getProvinceGdp(province),
        isCoastal: province.hasSeaAccess,
        multiplier: province.hasSeaAccess ? 5 : 4,
        estimatedRoiTurns: province.hasSeaAccess ? 5 : 4,
        reason: "کشور مالک این استان در حال حاضر فعال نیست.",
      };
    }

    const sellerOwnedProvinces = NationGettersUtility.getOwnedProvinces(
      seller.id,
      provincesMap,
    );
    if (sellerOwnedProvinces.length <= 1) {
      return {
        canBuy: false,
        cost: 0,
        provinceGdp: getProvinceGdp(province),
        isCoastal: province.hasSeaAccess,
        multiplier: province.hasSeaAccess ? 5 : 4,
        estimatedRoiTurns: province.hasSeaAccess ? 5 : 4,
        reason:
          "کشورهای تک‌استانی طبق قوانین بین‌الملل مجاز به واگذاری تنها استان خود نیستند.",
      };
    }

    if (province.hasSeaAccess) {
      const sellerCoastalCount = sellerOwnedProvinces.filter(
        (p) => p.hasSeaAccess,
      ).length;
      if (sellerCoastalCount <= 1) {
        return {
          canBuy: false,
          cost: 0,
          provinceGdp: getProvinceGdp(province),
          isCoastal: true,
          multiplier: 5,
          estimatedRoiTurns: 5,
          reason:
            "دولت‌ها هرگز آخرین استان ساحلی و راه ارتباطی خود به آب‌های آزاد را واگذار نمی‌کنند.",
        };
      }
    }

    const rel = NationRelationResolver.getRelation(buyer.relations, seller.id);
    const stance = rel ? rel.stance : "NORMAL_DIPLOMACY";

    if (stance === "WAR") {
      return {
        canBuy: false,
        cost: 0,
        provinceGdp: getProvinceGdp(province),
        isCoastal: province.hasSeaAccess,
        multiplier: province.hasSeaAccess ? 5 : 4,
        estimatedRoiTurns: province.hasSeaAccess ? 5 : 4,
        reason:
          "در وضعیت جنگ امکان معامله تجاری و خرید دیپلماتیک استان وجود ندارد.",
      };
    }

    const isLandNeighbor = LandNeighborResolver.hasProvinceLandBorder(
      provinceId,
      buyer.id,
      provincesMap,
    );
    const buyerHasSea = NationGettersUtility.hasSeaAccess(
      buyer.id,
      provincesMap,
    );
    const isMaritimeAccessible = buyerHasSea && province.hasSeaAccess;

    if (!isLandNeighbor && !isMaritimeAccessible) {
      return {
        canBuy: false,
        cost: 0,
        provinceGdp: getProvinceGdp(province),
        isCoastal: province.hasSeaAccess,
        multiplier: province.hasSeaAccess ? 5 : 4,
        estimatedRoiTurns: province.hasSeaAccess ? 5 : 4,
        reason:
          "عدم اتصال سرزمینی: استان هدف باید با خاک کشور شما مرز زمینی مشترک داشته باشد یا هر دو متصل به آب‌های آزاد باشند.",
      };
    }

    const { cost, multiplier, provinceGdp } = this.calculateCost(province);
    const estimatedRoiTurns = province.hasSeaAccess ? 5 : 4;

    if (buyer.treasury < cost) {
      return {
        canBuy: false,
        cost,
        provinceGdp,
        isCoastal: province.hasSeaAccess,
        multiplier,
        estimatedRoiTurns,
        reason: "موجودی خزانه برای پوشش مبلغ خرید این استان کافی نیست.",
      };
    }

    return {
      canBuy: true,
      cost,
      provinceGdp,
      isCoastal: province.hasSeaAccess,
      multiplier,
      estimatedRoiTurns,
    };
  }
}
