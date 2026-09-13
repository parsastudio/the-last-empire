import { z } from "zod";
import { GovernmentStateSchema } from "@/domain/politics/politics.schema";
import { MilitaryStackSchema } from "@/domain/military/military.schema";
import { RelationProfileSchema } from "@/domain/diplomacy/diplomacy.schema";
import {
  AiDoctrineTypeSchema,
  AiDoctrineWeightsSchema,
} from "@/domain/nation/nation-doctrine.schema";
import { EconomicDoctrineStanceSchema } from "@/domain/politics/economic-doctrine.schema";
import { FactoryBatchSchema } from "@/domain/economy/factory-batch.schema";

export const ActiveModifierSchema = z.object({
  id: z.string(),
  name: z.string(),
  effectType: z.string(),
  magnitude: z.number(),
  turnsRemaining: z.number().nonnegative(),
});

export const NationTurnActivitySchema = z.object({
  attackedTargetIds: z.array(z.string()).default([]),
  sentAidTargetIds: z.array(z.string()).default([]),
  boostedProjectIds: z.array(z.string()).default([]),
  executedEspionageTiers: z.array(z.string()).default([]),
});

export type NationTurnActivity = z.infer<typeof NationTurnActivitySchema>;

export const DEFAULT_NATION_TURN_ACTIVITY: NationTurnActivity = Object.freeze({
  attackedTargetIds: [],
  sentAidTargetIds: [],
  boostedProjectIds: [],
  executedEspionageTiers: [],
});

export const NationSchema = z.object({
  id: z.string(),
  isAi: z.boolean(),
  isAlive: z.boolean(),
  flagCode: z.string(),
  economicStance: EconomicDoctrineStanceSchema.default("BALANCED_MIXED"),
  treasury: z.number(),
  nationalDebt: z.number().nonnegative(),
  industrialLevel: z.number().positive().default(1.0),
  equipmentTechLevel: z.number().positive().default(1.0),
  factoryTiers: z.array(FactoryBatchSchema).default([]),
  navalFleet: z.number().nonnegative().default(0),
  government: GovernmentStateSchema,
  military: MilitaryStackSchema,
  relations: z.record(z.string(), RelationProfileSchema),
  activeModifiers: z.array(ActiveModifierSchema),
  globalReputation: z.number().min(-100).max(100),
  projectProgressSteps: z.record(z.string(), z.number()).default({}),
  completedProjectIds: z.array(z.string()).default([]),
  warFocusTargetId: z.string().nullable().optional(),
  postWarCooldownTurns: z.number().nonnegative().default(0),
  doctrine: AiDoctrineTypeSchema.default("DOMESTIC_INDUSTRIALIST"),
  doctrineWeights: AiDoctrineWeightsSchema.optional(),
  defenseGuarantorIds: z.array(z.string()).default([]),
  securityGuarantorId: z.string().nullable().optional().default(null),
  isEmergencyProtectorate: z.boolean().default(false).optional(),
});

export type ActiveModifier = z.infer<typeof ActiveModifierSchema>;
export type Nation = z.infer<typeof NationSchema>;
