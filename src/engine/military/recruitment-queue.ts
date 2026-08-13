import { Nation } from "@/domain/nation/nation.schema";
import { UnitType, RecruitmentOrder } from "@/domain/military/military.schema";
import { GameError } from "@/domain/shared/domain-utilities";
import { MilitaryPricingCalculator } from "@/domain/military/military-pricing-calculator.utility";
import { MilitaryInventoryHelper } from "@/domain/military/military-inventory-helper";

export class RecruitmentQueueManager {
  public enqueueOrder(
    nation: Nation,
    unitType: UnitType,
    quantity: number,
  ): Nation {
    const totalMoney = MilitaryPricingCalculator.calculateTotalCost(
      unitType,
      quantity,
      nation.military.techLevel,
      nation.industrialLevel,
    );

    if (nation.treasury < totalMoney) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "موجودی خزانه برای ساخت یگان کافی نیست.",
      );
    }

    const newOrder: RecruitmentOrder = {
      id: `${unitType}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      unitType,
      quantity,
      turnsRemaining: 2,
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
