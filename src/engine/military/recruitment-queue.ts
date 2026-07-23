import type { Nation } from "@/domain/nation/nation.schema";
import type {
  UnitType,
  RecruitmentOrder,
} from "@/domain/military/military.schema";
import { GameError } from "@/domain/shared/game-error";
import { UnitCostCalculator } from "./unit-cost-calculator";
import { ManpowerManager } from "@/engine/economy/manpower-manager";
import { ResourceDependencyManager } from "@/engine/economy/resource-dependency-manager";

export class RecruitmentQueueManager {
  private costCalculator = new UnitCostCalculator();
  private manpowerManager = new ManpowerManager();
  private resourceDependencyManager = new ResourceDependencyManager();

  public enqueueOrder(
    nation: Nation,
    unitType: UnitType,
    quantity: number,
  ): Nation {
    this.resourceDependencyManager.validateUnitRecruitmentResources(
      nation,
      unitType,
      quantity,
    );

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

    let finalSteel = nation.resources.steel;
    if (unitType === "AIR_FORCE" || unitType === "DRONE_MISSILE") {
      finalSteel = Math.max(0, finalSteel - quantity * 2);
    }

    return {
      ...nation,
      treasury: nation.treasury - costDetails.moneyCost,
      resources: {
        ...nation.resources,
        manpower: nation.resources.manpower - costDetails.manpowerCost,
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
        switch (order.unitType) {
          case "INFANTRY":
            updatedMilitary.infantry += order.quantity;
            break;
          case "AIR_FORCE":
            updatedMilitary.airForce += order.quantity;
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
    const maxManpower = this.manpowerManager.getMaxManpower(nation.population);
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
