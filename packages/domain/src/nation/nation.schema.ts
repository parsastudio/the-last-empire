import { z } from "zod";
import { GovernmentStateSchema } from "@/domain/politics/politics.schema";
import { MilitaryStackSchema } from "@/domain/military/military.schema";
import { RelationProfileSchema } from "@/domain/diplomacy/diplomacy.schema";
import {
  AiDoctrineTypeSchema,
  AiDoctrineWeightsSchema,
} from "@/domain/nation/nation-doctrine.schema";
import { EconomicDoctrineStanceSchema } from "@/domain/politics/economic-doctrine.schema";

export const ActiveModifierSchema = z.object({
  id: z.string(),
  name: z.string(),
  effectType: z.string(),
  magnitude: z.number(),
  turnsRemaining: z.number().nonnegative(),
});

export const NationSchema = z.object({
  id: z.string(),
  name: z.string(),
  isAi: z.boolean(),
  isAlive: z.boolean(),
  flagCode: z.string(),
  economicStance: EconomicDoctrineStanceSchema.default("BALANCED_MIXED"),
  treasury: z.number(),
  nationalDebt: z.number().nonnegative(),
  industrialLevel: z.number().positive(),
  navalFleet: z.number().nonnegative().default(0),
  government: GovernmentStateSchema,
  military: MilitaryStackSchema,
  relations: z.record(z.string(), RelationProfileSchema),
  activeModifiers: z.array(ActiveModifierSchema),
  globalReputation: z.number().min(-100).max(100),
  executedEspionageTiers: z.array(z.string()).default([]),
  attackedTargetIdsThisTurn: z.array(z.string()).default([]),
  warFocusTargetId: z.string().nullable().optional(),
  postWarCooldownTurns: z.number().nonnegative().default(0),
  doctrine: AiDoctrineTypeSchema.default("DOMESTIC_INDUSTRIALIST"),
  doctrineWeights: AiDoctrineWeightsSchema.optional(),
  securityGuarantorId: z.string().nullable().optional().default(null),
  isEmergencyProtectorate: z.boolean().default(false).optional(),
});

export type ActiveModifier = z.infer<typeof ActiveModifierSchema>;
export type Nation = z.infer<typeof NationSchema>;
