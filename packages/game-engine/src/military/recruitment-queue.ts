import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { UnitType, RecruitmentOrder } from "@/domain/military/military.schema";
import { GameError } from "@/domain/shared/domain-utilities";
import { MilitaryPricingCalculator } from "@/domain/military/military-pricing-calculator.utility";
import { MilitaryInventoryHelper } from "@/domain/military/military-inventory-helper";
import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { MilitaryQuotaCalculator } from "@/domain/military/military-quota-calculator.utility";

export class RecruitmentQueueManager {
  public enqueueOrder(
    nation: Nation,
    unitType: UnitType,
    quantity: number,
    provincesMap?: Record<string, Province>,
  ): Nation {
    const unitPrice =
      MilitaryPricingCalculator.calculateUnitTypePrice(unitType);
    const totalMoney = unitPrice * quantity;

    if (nation.treasury < totalMoney) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "موجودی خزانه برای ساخت یگان کافی نیست.",
      );
    }

    const gdp = getNationGdp(nation, provincesMap);
    const currentTotalValuation =
      MilitaryPricingCalculator.calculateTotalArmyValuationWithQueue(
        nation.military,
        nation.recruitmentQueue,
      );
    const maxValuation = Math.floor(gdp);

    if (currentTotalValuation + totalMoney > maxValuation) {
      throw new GameError(
        "INVALID_ACTION",
        "مجموع ارزش ارتش نمی‌تواند از ۱۰۰٪ تولید ناخالص (GDP) فراتر رود.",
      );
    }

    const quotas = MilitaryQuotaCalculator.calculateQuotas(
      gdp,
      nation.military,
      nation.recruitmentQueue,
    );
    const q = quotas[unitType];

    if (q.remainingRoom < quantity) {
      throw new GameError(
        "INVALID_ACTION",
        `سقف مجاز ساخت ${MILITARY_UNIT_STATS[unitType].nameFa} تکمیل شده است.`,
      );
    }

    const unitStat = MILITARY_UNIT_STATS[unitType];
    const turnsRemaining = unitStat ? unitStat.buildTurns : 1;

    const newOrder: RecruitmentOrder = {
      id: `${unitType}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      unitType,
      quantity,
      turnsRemaining,
      totalCost: totalMoney,
    };

    return {
      ...nation,
      treasury: nation.treasury - totalMoney,
      recruitmentQueue: [...nation.recruitmentQueue, newOrder],
    };
  }

  public processTurnQueue(nation: Nation): Nation {
    const remainingQueue: RecruitmentOrder[] = [];
    let updatedMilitary = { ...nation.military };

    for (const order of nation.recruitmentQueue) {
      const nextTurns = order.turnsRemaining - 1;
      if (nextTurns <= 0) {
        updatedMilitary = MilitaryInventoryHelper.addUnits(
          updatedMilitary,
          order.unitType,
          order.quantity,
          nation.military.techLevel,
        );
      } else {
        remainingQueue.push({ ...order, turnsRemaining: nextTurns });
      }
    }

    return {
      ...nation,
      military: updatedMilitary,
      recruitmentQueue: remainingQueue,
    };
  }

  public cancelOrder(
    nation: Nation,
    orderId: string,
    refundRate = 0.75,
  ): Nation {
    const order = nation.recruitmentQueue.find((o) => o.id === orderId);
    if (!order) {
      throw new GameError("INVALID_ACTION", `سفارش ${orderId} یافت نشد.`);
    }

    const moneyRefund = Math.floor(order.totalCost * refundRate);
    const newQueue = nation.recruitmentQueue.filter((o) => o.id !== orderId);

    return {
      ...nation,
      treasury: nation.treasury + moneyRefund,
      recruitmentQueue: newQueue,
    };
  }
}
