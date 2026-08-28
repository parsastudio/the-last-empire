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
  public static readonly INLAND_MULTIPLIER = 3;
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
    const cost = Math.max(1_000_000_000, Math.floor(provinceGdp * multiplier));
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
        multiplier: 3,
        estimatedRoiTurns: 10,
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
        multiplier: 3,
        estimatedRoiTurns: 10,
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
        multiplier: province.hasSeaAccess ? 5 : 3,
        estimatedRoiTurns: 0,
        reason: "این استان در حال حاضر متعلق به کشور شماست.",
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
        multiplier: province.hasSeaAccess ? 5 : 3,
        estimatedRoiTurns: 10,
        reason: "کشور مالک این استان دیگر وجود ندارد.",
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
        multiplier: province.hasSeaAccess ? 5 : 3,
        estimatedRoiTurns: 10,
        reason:
          "کشورهای تک‌استانی طبق قوانین بین‌الملل مجاز به واگذاری تنها استان خود نیستند.",
      };
    }

    const rel = NationRelationResolver.getRelation(buyer.relations, seller.id);
    const stance = rel ? rel.stance : "NORMAL_DIPLOMACY";
    const tension = rel ? (rel.tension ?? 10) : 10;

    if (stance === "WAR") {
      return {
        canBuy: false,
        cost: 0,
        provinceGdp: getProvinceGdp(province),
        isCoastal: province.hasSeaAccess,
        multiplier: province.hasSeaAccess ? 5 : 3,
        estimatedRoiTurns: 10,
        reason:
          "در وضعیت جنگ امکان معامله تجاری و خرید دیپلماتیک استان وجود ندارد.",
      };
    }

    if (tension >= 75) {
      return {
        canBuy: false,
        cost: 0,
        provinceGdp: getProvinceGdp(province),
        isCoastal: province.hasSeaAccess,
        multiplier: province.hasSeaAccess ? 5 : 3,
        estimatedRoiTurns: 10,
        reason:
          "به دلیل تنش دیپلماتیک شدید (بالای ۷۵٪)، دولت مقابل حاضر به واگذاری خاک نیست.",
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
        multiplier: province.hasSeaAccess ? 5 : 3,
        estimatedRoiTurns: 10,
        reason:
          "عدم اتصال سرزمینی: استان هدف باید با شما مرز زمینی یا دسترسی به آب‌های آزاد مشترک داشته باشد.",
      };
    }

    const { cost, multiplier, provinceGdp } = this.calculateCost(province);
    const estimatedRoiTurns = province.hasSeaAccess ? 12 : 9;

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
