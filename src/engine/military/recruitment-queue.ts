import { Nation } from "@/domain/nation/nation.schema";
import { UnitType, RecruitmentOrder } from "@/domain/military/military.schema";
import { GameError } from "@/domain/shared/game-error";

export class RecruitmentQueueManager {
  public enqueueOrder(
    nation: Nation,
    unitType: UnitType,
    quantity: number,
  ): Nation {
    if (unitType === "AIR_FORCE" || unitType === "DRONE_MISSILE") {
      const requiredSteel = quantity * 2;
      if (nation.resources.steel < requiredSteel) {
        throw new GameError(
          "INSUFFICIENT_RESOURCES",
          `Recruiting ${unitType} requires at least ${requiredSteel} steel`,
        );
      }
    }

    const discount = Math.max(0.7, 1 - (nation.industrialLevel - 1) * 0.05);
    let moneyCostUnit = 250000000;
    let manpowerUnit = 10;
    let buildTurns = 2;

    if (unitType === "AIR_FORCE") {
      moneyCostUnit = 1000000000;
      manpowerUnit = 5;
      buildTurns = 4;
    } else if (unitType === "DRONE_MISSILE") {
      moneyCostUnit = 1500000000;
      manpowerUnit = 1;
      buildTurns = 1;
    }

    const totalMoney = Math.floor(moneyCostUnit * discount) * quantity;
    const totalManpower = manpowerUnit * quantity;

    if (nation.treasury < totalMoney) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "Not enough treasury for recruitment",
      );
    }
    if (nation.resources.manpower < totalManpower) {
      throw new GameError(
        "INSUFFICIENT_RESOURCES",
        "Not enough manpower for recruitment",
      );
    }

    const newOrder: RecruitmentOrder = {
      id: `${unitType}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      unitType,
      quantity,
      turnsRemaining: buildTurns,
      totalCost: totalMoney,
      manpowerRequired: totalManpower,
    };

    let finalSteel = nation.resources.steel;
    if (unitType === "AIR_FORCE" || unitType === "DRONE_MISSILE") {
      finalSteel = Math.max(0, finalSteel - quantity * 2);
    }

    return {
      ...nation,
      treasury: nation.treasury - totalMoney,
      resources: {
        ...nation.resources,
        manpower: nation.resources.manpower - totalManpower,
        steel: finalSteel,
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
      throw new GameError("INVALID_ACTION", `Order ID ${orderId} not found`);
    }

    const moneyRefund = Math.floor(order.totalCost * refundRate);
    const manpowerRefund = order.manpowerRequired;
    const newQueue = nation.recruitmentQueue.filter((o) => o.id !== orderId);

    const maxManpower = Math.floor(nation.population * 0.15);
    const finalManpower = Math.min(
      maxManpower,
      nation.resources.manpower + manpowerRefund,
    );

    let finalSteel = nation.resources.steel;
    if (order.unitType === "AIR_FORCE" || order.unitType === "DRONE_MISSILE") {
      finalSteel = finalSteel + order.quantity * 2;
    }

    return {
      ...nation,
      treasury: nation.treasury + moneyRefund,
      resources: {
        ...nation.resources,
        manpower: finalManpower,
        steel: finalSteel,
      },
      recruitmentQueue: newQueue,
    };
  }
}
