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
import { NationGettersUtility } from "@geopolitics/domain";

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

    const unitStat = MILITARY_UNIT_STATS[unitType];
    if (Math.floor(seller.military.techLevel) < unitStat.requiredTechLevel) {
      throw new GameError(
        "INVALID_ACTION",
        `کشور ${seller.name} سطح فناوری لازم برای تولید این یگان را ندارد.`,
      );
    }

    const rel =
      seller.relations[canonicalBuyerId] || seller.relations[buyer.id];
    const alignment = rel ? (rel.alignment ?? 0) : 0;
    const tension = rel ? (rel.tension ?? 10) : 10;

    if (alignment < 15 || tension >= 60) {
      throw new GameError(
        "INVALID_ACTION",
        `کشور ${seller.name} به دلیل عدم همسویی استراتژیک یا تنش مرزی حاضر به فروش تسلیحات نیست.`,
      );
    }

    const buyerNavalPower =
      (buyer.military.navalFleet || 0) * (buyer.military.techLevel || 1);

    for (const partner of Object.values(state.nations)) {
      if (!partner.isAlive || partner.id === buyer.id) continue;
      const partnerRel =
        buyer.relations[CountryRegistry.resolveCanonicalId(partner.id)] ||
        buyer.relations[partner.id];

      if (partnerRel?.stance === "WAR") {
        const enemyNavalPower =
          (partner.military.navalFleet || 0) *
          (partner.military.techLevel || 1);
        if (enemyNavalPower > buyerNavalPower) {
          throw new GameError(
            "EXECUTION_FAILED",
            "محموله تسلیحاتی به دلیل محاصره کامل دریایی توسط کشور متخاصم امکان تحویل ندارد.",
          );
        }
      }
    }

    const baseUnitPrice =
      MilitaryPricingCalculator.calculateUnitTypePrice(unitType);
    const marketPricePerUnit = Math.floor(baseUnitPrice * 1.5);
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

    let queuedValuation = 0;
    for (let i = 0; i < buyer.recruitmentQueue.length; i++) {
      queuedValuation += buyer.recruitmentQueue[i]!.totalCost;
    }

    if (currentValuation + queuedValuation + addedValuation > maxValuation) {
      throw new GameError(
        "INVALID_ACTION",
        "مجموع ارزش ارتش نمی‌تواند از ۱۰۰٪ تولید ناخالص (GDP) فراتر رود.",
      );
    }

    const hasSea = NationGettersUtility.hasSeaAccess(buyer.id, state.provinces);
    const quotas = MilitaryQuotaCalculator.calculateQuotas(
      buyerGdp,
      buyer.military,
      hasSea,
      buyer.recruitmentQueue,
    );
    const q = quotas[unitType];

    if (q.remainingRoom < quantity) {
      throw new GameError(
        "INVALID_ACTION",
        `سقف مجاز سهمیه ${unitStat.nameFa} در ارتش شما تکمیل شده است.`,
      );
    }

    const sellerProfit = Math.floor(baseUnitPrice * 0.5) * quantity;

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
    const isHumanInvolved =
      canonicalBuyerId === canonicalHuman ||
      canonicalSellerId === canonicalHuman;

    const logs = [];
    if (isHumanInvolved) {
      const isHumanBuyer = canonicalBuyerId === canonicalHuman;
      logs.push(
        TurnLogBuilder.createNationalLog(
          state.currentTurn,
          isHumanBuyer ? buyer.id : seller.id,
          "DOMESTIC",
          "INFO",
          "ARMS_TRADE",
          {
            quantity,
            unitName: unitStat.nameFa,
            role: isHumanBuyer ? "BUYER" : "SELLER",
          },
          isHumanBuyer ? seller.id : buyer.id,
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
