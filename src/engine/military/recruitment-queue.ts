import { Nation } from "@/domain/nation/nation.schema";
import { UnitType } from "@/domain/military/military.schema";
import { RecruitmentEnqueuer } from "./recruitment/recruitment-enqueuer";
import { RecruitmentQueueProcessor } from "./recruitment/recruitment-queue-processor";
import { RecruitmentCanceller } from "./recruitment/recruitment-canceller";

export class RecruitmentQueueManager {
  private enqueuer = new RecruitmentEnqueuer();
  private processor = new RecruitmentQueueProcessor();
  private canceller = new RecruitmentCanceller();

  public enqueueOrder(
    nation: Nation,
    unitType: UnitType,
    quantity: number,
  ): Nation {
    return this.enqueuer.enqueueOrder(nation, unitType, quantity);
  }

  public processTurnQueue(nation: Nation): Nation {
    return this.processor.processTurnQueue(nation);
  }

  public cancelOrder(
    nation: Nation,
    orderId: string,
    refundRate = 0.75,
  ): Nation {
    return this.canceller.cancelOrder(nation, orderId, refundRate);
  }
}
