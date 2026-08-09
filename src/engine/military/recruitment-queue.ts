import { Nation } from "@/domain/nation/nation.schema";
import { UnitType, RecruitmentOrder } from "@/domain/military/military.schema";
import { GameError } from "@/domain/shared/domain-utilities";
import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";

export class RecruitmentQueueManager {
  public enqueueOrder(
    nation: Nation,
    unitType: UnitType,
    quantity: number,
  ): Nation {
    const stats = MILITARY_UNIT_STATS[unitType];

    const discount = Math.max(0.7, 1 - (nation.industrialLevel - 1) * 0.05);
    const totalMoney = Math.floor(stats.moneyCost * discount) * quantity;
    const totalManpower = stats.manpowerCost * quantity;

    if (nation.treasury < totalMoney) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "موجودی خزانه برای ساخت یگان کافی نیست.",
      );
    }
    if (nation.resources.manpower < totalManpower) {
      throw new GameError(
        "INSUFFICIENT_RESOURCES",
        "نیروی انسانی کافی برای ساخت یگان وجود ندارد.",
      );
    }

    const newOrder: RecruitmentOrder = {
      id: `${unitType}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      unitType,
      quantity,
      turnsRemaining: stats.buildTurns,
      totalCost: totalMoney,
      manpowerRequired: totalManpower,
    };

    return {
      ...nation,
      treasury: nation.treasury - totalMoney,
      resources: {
        ...nation.resources,
        manpower: nation.resources.manpower - totalManpower,
      },
      recruitmentQueue: [...nation.recruitmentQueue, newOrder],
    };
  }

  public processTurnQueue(nation: Nation): Nation {
    const remainingQueue: RecruitmentOrder[] = [];
    const updatedMilitary = { ...nation.military };

    for (const order of nation.recruitmentQueue) {
      const nextTurns = order.turnsRemaining - 1;
      if (nextTurns <= 0) {
        if (order.unitType === "INFANTRY")
          updatedMilitary.infantry += order.quantity;
        else if (order.unitType === "AIR_FORCE")
          updatedMilitary.airForce += order.quantity;
        else if (order.unitType === "DRONE_MISSILE")
          updatedMilitary.droneMissile += order.quantity;
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
    const manpowerRefund = order.manpowerRequired;
    const newQueue = nation.recruitmentQueue.filter((o) => o.id !== orderId);

    const maxManpower = Math.floor(nation.population * 0.15);
    const finalManpower = Math.min(
      maxManpower,
      nation.resources.manpower + manpowerRefund,
    );

    return {
      ...nation,
      treasury: nation.treasury + moneyRefund,
      resources: {
        ...nation.resources,
        manpower: finalManpower,
      },
      recruitmentQueue: newQueue,
    };
  }
}
