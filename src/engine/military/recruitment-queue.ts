import { Nation } from "@/domain/nation/nation.schema";
import { UnitType, RecruitmentOrder } from "@/domain/military/military.schema";
import { GameError } from "@/domain/shared/domain-utilities";
import { MilitaryPricingCalculator } from "@/domain/military/military-pricing-calculator.utility";

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
    const updatedMilitary = { ...nation.military };

    for (const order of nation.recruitmentQueue) {
      const nextTurns = order.turnsRemaining - 1;
      if (nextTurns <= 0) {
        if (order.unitType === "INFANTRY") {
          updatedMilitary.infantry += order.quantity;
        } else if (order.unitType === "ARMOR") {
          updatedMilitary.armor = (updatedMilitary.armor || 0) + order.quantity;
        } else if (order.unitType === "AIR_DEFENSE") {
          updatedMilitary.airDefense =
            (updatedMilitary.airDefense || 0) + order.quantity;
        } else if (order.unitType === "AIR_FORCE") {
          updatedMilitary.airForce += order.quantity;
        } else if (order.unitType === "DRONE_MISSILE") {
          updatedMilitary.droneMissile += order.quantity;
        } else if (order.unitType === "NAVAL_FLEET") {
          updatedMilitary.navalFleet =
            (updatedMilitary.navalFleet || 0) + order.quantity;
        }
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
