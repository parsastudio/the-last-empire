import { GovernmentType } from "@/domain/politics/politics.schema";
import {
  GovernmentStabilityTraits,
  GOVERNMENT_TRAITS_MAP,
} from "@/domain/politics/government-traits.config";

export type { GovernmentStabilityTraits };

export class GovernmentSystem {
  public static getTraits(type: GovernmentType): GovernmentStabilityTraits {
    return GOVERNMENT_TRAITS_MAP[type];
  }
}
