import { EnclaveMeta } from "@/domain/nation/enclave.schema";

export class OutpostDiscountCalculator {
  private readonly standardDiscountRate = 0.3;
  private readonly defaultDiscountRate = 0.15;

  public determineDiscount(
    originMeta: EnclaveMeta | undefined,
    closestEnclaveMeta: EnclaveMeta | undefined,
  ): {
    discountRate: number;
    feedbackMessage: string;
  } {
    if (originMeta) {
      return {
        discountRate: this.standardDiscountRate,
        feedbackMessage: `30% Logistics discount due to operational base in ${originMeta.originalName}`,
      };
    }

    if (closestEnclaveMeta) {
      return {
        discountRate: this.defaultDiscountRate,
        feedbackMessage: `15% Logistics discount due to closest supporting enclave in ${closestEnclaveMeta.originalName}`,
      };
    }

    return {
      discountRate: 0.0,
      feedbackMessage:
        "Standard intercontinental logistics transport costs apply",
    };
  }
}
