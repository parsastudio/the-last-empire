import { GovernmentType } from "@/domain/politics/politics.schema";
import {
  GOVERNMENT_TRAITS_CONFIG,
  GovernmentTraitConfig,
  GovernmentTraitModifier,
} from "@/domain/politics/government-traits.config";

export class GovernmentTraitsUtility {
  public static getTraitConfig(
    type: GovernmentType | string,
  ): GovernmentTraitConfig {
    if (type in GOVERNMENT_TRAITS_CONFIG) {
      return GOVERNMENT_TRAITS_CONFIG[type as GovernmentType];
    }
    return GOVERNMENT_TRAITS_CONFIG.PLURALIST_PARLIAMENTARY;
  }

  public static getModifiers(
    type: GovernmentType | string,
  ): GovernmentTraitModifier {
    return this.getTraitConfig(type).modifiers;
  }
}
