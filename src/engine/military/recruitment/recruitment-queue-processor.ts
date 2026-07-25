import { Nation } from "@/domain/nation/nation.schema";
import { RecruitmentOrder } from "@/domain/military/military.schema";

export class RecruitmentQueueProcessor {
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
}
