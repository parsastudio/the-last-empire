import { z } from "zod";
import {
  GovernmentType,
  GovernmentTypeSchema,
} from "@/domain/politics/politics.schema";

export const GovernmentTraitModifierSchema = z.object({
  procurementCostMultiplier: z.number().positive(),
  maintenanceCostMultiplier: z.number().positive(),
  militaryResearchCostMultiplier: z.number().positive(),
  industrialResearchCostMultiplier: z.number().positive(),
  peaceStabilityRecoveryMultiplier: z.number().positive(),
  warStabilityFatigueMultiplier: z.number().positive(),
  crisisStabilityResistanceMultiplier: z.number().positive(),
});

export const GovernmentTraitConfigSchema = z.object({
  type: GovernmentTypeSchema,
  modifiers: GovernmentTraitModifierSchema,
});

export type GovernmentTraitModifier = z.infer<
  typeof GovernmentTraitModifierSchema
>;
export type GovernmentTraitConfig = z.infer<typeof GovernmentTraitConfigSchema>;

export const GOVERNMENT_TRAITS_CONFIG: Record<
  GovernmentType,
  GovernmentTraitConfig
> = {
  PLURALIST_PARLIAMENTARY: {
    type: "PLURALIST_PARLIAMENTARY",
    modifiers: {
      procurementCostMultiplier: 1.0,
      maintenanceCostMultiplier: 1.2,
      militaryResearchCostMultiplier: 0.8,
      industrialResearchCostMultiplier: 0.8,
      peaceStabilityRecoveryMultiplier: 1.3,
      warStabilityFatigueMultiplier: 1.5,
      crisisStabilityResistanceMultiplier: 1.0,
    },
  },
  IDEOLOGICAL_REGIME: {
    type: "IDEOLOGICAL_REGIME",
    modifiers: {
      procurementCostMultiplier: 1.0,
      maintenanceCostMultiplier: 0.8,
      militaryResearchCostMultiplier: 1.2,
      industrialResearchCostMultiplier: 1.2,
      peaceStabilityRecoveryMultiplier: 0.7,
      warStabilityFatigueMultiplier: 0.5,
      crisisStabilityResistanceMultiplier: 1.2,
    },
  },
  TECHNOCRATIC_ONE_PARTY: {
    type: "TECHNOCRATIC_ONE_PARTY",
    modifiers: {
      procurementCostMultiplier: 0.8,
      maintenanceCostMultiplier: 1.2,
      militaryResearchCostMultiplier: 1.0,
      industrialResearchCostMultiplier: 0.85,
      peaceStabilityRecoveryMultiplier: 1.0,
      warStabilityFatigueMultiplier: 1.0,
      crisisStabilityResistanceMultiplier: 0.75,
    },
  },
  HEREDITARY_MONARCHY: {
    type: "HEREDITARY_MONARCHY",
    modifiers: {
      procurementCostMultiplier: 1.2,
      maintenanceCostMultiplier: 0.9,
      militaryResearchCostMultiplier: 1.15,
      industrialResearchCostMultiplier: 1.15,
      peaceStabilityRecoveryMultiplier: 1.0,
      warStabilityFatigueMultiplier: 0.8,
      crisisStabilityResistanceMultiplier: 1.4,
    },
  },
  CENTRALIZED_PRESIDENTIAL: {
    type: "CENTRALIZED_PRESIDENTIAL",
    modifiers: {
      procurementCostMultiplier: 0.9,
      maintenanceCostMultiplier: 1.1,
      militaryResearchCostMultiplier: 1.0,
      industrialResearchCostMultiplier: 1.0,
      peaceStabilityRecoveryMultiplier: 0.9,
      warStabilityFatigueMultiplier: 0.9,
      crisisStabilityResistanceMultiplier: 1.0,
    },
  },
};
