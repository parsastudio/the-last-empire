import type { Nation } from "@/modules/nation/schemas/nation.schema";
import type {
  UnitType,
  RecruitmentOrder,
} from "@/modules/military/schemas/military.schema";
import { GameError } from "@/core/errors/game-error";
import { UnitCostCalculator } from "./unit-cost-calculator";
import { CoastalRequirementValidator } from "./coastal-requirement-validator";

export class RecruitmentQueueManager {
  private costCalculator: UnitCostCalculator;
  private coastalValidator: CoastalRequirementValidator;

  constructor() {
    this.costCalculator = new UnitCostCalculator();
    this.coastalValidator = new CoastalRequirementValidator();
  }

  public enqueueOrder(
    nation: Nation,
    unitType: UnitType,
    quantity: number,
  ): Nation {
    this.coastalValidator.validateSeaAccess(nation, unitType);

    const costDetails = this.costCalculator.calculateTotalCost(
      unitType,
      quantity,
      nation.industrialLevel,
    );

    if (nation.treasury < costDetails.moneyCost) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "Not enough money in treasury for recruitment",
      );
    }

    if (nation.resources.manpower < costDetails.manpowerCost) {
      throw new GameError(
        "INSUFFICIENT_RESOURCES",
        "Not enough manpower available for recruitment",
      );
    }

    const newOrder: RecruitmentOrder = {
      id: `${unitType}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      unitType,
      quantity,
      turnsRemaining: costDetails.buildTurns,
      totalCost: costDetails.moneyCost,
      manpowerRequired: costDetails.manpowerCost,
    };

    return {
      ...nation,
      treasury: nation.treasury - costDetails.moneyCost,
      resources: {
        ...nation.resources,
        manpower: nation.resources.manpower - costDetails.manpowerCost,
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
        switch (order.unitType) {
          case "INFANTRY":
            updatedMilitary.infantry += order.quantity;
            break;
          case "AIR_FORCE":
            updatedMilitary.airForce += order.quantity;
            break;
          case "NAVY":
            updatedMilitary.navy += order.quantity;
            break;
          case "DRONE_MISSILE":
            updatedMilitary.droneMissile += order.quantity;
            break;
        }
      } else {
        remainingQueue.push({
          ...order,
          turnsRemaining: nextTurns,
        });
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
    const orderIndex = nation.recruitmentQueue.findIndex(
      (o) => o.id === orderId,
    );
    if (orderIndex === -1) {
      throw new GameError(
        "INVALID_ACTION",
        `Order ID ${orderId} not found in recruitment queue`,
      );
    }

    const order = nation.recruitmentQueue[orderIndex];
    const moneyRefund = Math.floor(order.totalCost * refundRate);
    const manpowerRefund = order.manpowerRequired;

    const newQueue = nation.recruitmentQueue.filter((o) => o.id !== orderId);

    return {
      ...nation,
      treasury: nation.treasury + moneyRefund,
      resources: {
        ...nation.resources,
        manpower: nation.resources.manpower + manpowerRefund,
      },
      recruitmentQueue: newQueue,
    };
  }
}
