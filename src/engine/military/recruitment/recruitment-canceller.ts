import { Nation } from "@/domain/nation/nation.schema";
import { GameError } from "@/domain/shared/game-error";
import { ManpowerManager } from "@/engine/economy/manpower-manager";

export class RecruitmentCanceller {
  private manpowerManager = new ManpowerManager();

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
    if (!order) {
      return nation;
    }

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
