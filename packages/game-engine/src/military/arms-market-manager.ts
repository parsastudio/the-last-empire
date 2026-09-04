import { GameState } from "@/domain/game/game-state.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { UnitType } from "@/domain/military/military.schema";
import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";
import { MilitaryPricingCalculator } from "@/domain/military/military-pricing-calculator.utility";
import { GameError, TurnLogBuilder } from "@/domain/shared/domain-utilities";
import { CountryRegistry } from "@/domain/data/countries";
import { MilitaryInventoryHelper } from "@/domain/military/military-inventory-helper";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { MilitaryQuotaCalculator } from "@/domain/military/military-quota-calculator.utility";

export class ArmsMarketManager {
  public static executePurchase(
    state: GameState,
    buyerId: string,
    sellerId: string,
    unitType: UnitType,
    quantity: number,
  ): GameState {
    if (quantity <= 0) {
      throw new GameError("INVALID_ACTION", "تعداد سفارش خرید باید مثبت باشد.");
    }

    const canonicalBuyerId = CountryRegistry.resolveCanonicalId(buyerId);
    const canonicalSellerId = CountryRegistry.resolveCanonicalId(sellerId);

    const buyer = state.nations[canonicalBuyerId] || state.nations[buyerId];
    const seller = state.nations[canonicalSellerId] || state.nations[sellerId];

    if (!buyer || !buyer.isAlive) {
      throw new GameError("NATION_NOT_FOUND", "کشور خریدار فعال نیست.");
    }
    if (!seller || !seller.isAlive) {
      throw new GameError("NATION_NOT_FOUND", "کشور فروشنده یافت نشد.");
    }

    if (seller.military.techLevel <= buyer.military.techLevel) {
      throw new GameError(
        "INVALID_ACTION",
        `سطح فناوری نظامی کشور ${seller.name} (${seller.military.techLevel.toFixed(1)}) از فناوری نظامی شما (${buyer.military.techLevel.toFixed(1)}) بالاتر نیست.`,
      );
    }

    const unitStat = MILITARY_UNIT_STATS[unitType];

    const rel =
      seller.relations[canonicalBuyerId] || seller.relations[buyer.id];
    const stance = rel ? rel.stance : "NORMAL_DIPLOMACY";
    const tension = rel ? (rel.tension ?? 10) : 10;

    if (stance === "WAR" || tension >= 50) {
      throw new GameError(
        "INVALID_ACTION",
        `کشور ${seller.name} به دلیل وضعیت جنگی یا تنش امنیتی بالا (۵۰٪ یا بیشتر) حاضر به فروش تسلیحات نیست.`,
      );
    }

    const baseUnitPrice =
      MilitaryPricingCalculator.calculateUnitTypePrice(unitType);
    const marketPricePerUnit =
      MilitaryPricingCalculator.calculateArmsImportUnitPrice(
        unitType,
        buyer.military.techLevel,
        seller.military.techLevel,
      );
    const totalCost = marketPricePerUnit * quantity;

    if (buyer.treasury < totalCost) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "موجودی خزانه برای خرید این محموله تسلیحاتی کافی نیست.",
      );
    }

    const buyerGdp = getNationGdp(buyer, state.provinces);
    const currentValuation =
      MilitaryPricingCalculator.calculateTotalArmyValuation(buyer.military);
    const maxValuation = Math.floor(buyerGdp);
    const addedValuation = baseUnitPrice * quantity;

    if (currentValuation + addedValuation > maxValuation) {
      throw new GameError(
        "INVALID_ACTION",
        "مجموع ارزش ارتش نمی‌تواند از ۱۰۰٪ تولید ناخالص (GDP) فراتر رود.",
      );
    }

    const quotas = MilitaryQuotaCalculator.calculateQuotas(
      buyerGdp,
      buyer.military,
    );
    const q = quotas[unitType];

    if (q.remainingRoom < quantity) {
      throw new GameError(
        "INVALID_ACTION",
        `سقف مجاز سهمیه ${unitStat.nameFa} در ارتش شما تکمیل شده است.`,
      );
    }

    const sellerProfit =
      Math.max(0, marketPricePerUnit - baseUnitPrice) * quantity;

    const updatedBuyerMilitary = MilitaryInventoryHelper.addUnits(
      buyer.military,
      unitType,
      quantity,
      seller.military.techLevel,
    );

    const updatedBuyer: Nation = {
      ...buyer,
      treasury: buyer.treasury - totalCost,
      military: updatedBuyerMilitary,
    };

    const updatedSeller: Nation = {
      ...seller,
      treasury: seller.treasury + sellerProfit,
    };

    const canonicalHuman = CountryRegistry.resolveCanonicalId(
      state.humanNationId,
    );
    const isHumanSeller = canonicalSellerId === canonicalHuman;

    const logs = [];
    if (isHumanSeller && sellerProfit > 0) {
      logs.push(
        TurnLogBuilder.createNationalLog(
          state.currentTurn,
          seller.id,
          "DOMESTIC",
          "INFO",
          "ARMS_TRADE",
          {
            amount: sellerProfit,
            role: "SELLER",
          },
          buyer.id,
        ),
      );
    }

    const updatedNations = {
      ...state.nations,
      [buyer.id]: updatedBuyer,
      [seller.id]: updatedSeller,
    };

    return {
      ...state,
      nations: updatedNations,
      turnLogs: [...state.turnLogs, ...logs],
    };
  }
}
