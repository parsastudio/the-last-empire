import { z } from "zod";
import { GovernmentStateSchema } from "@/domain/politics/politics.schema";
import {
  MilitaryStackSchema,
  RecruitmentOrderSchema,
} from "@/domain/military/military.schema";
import { RelationProfileSchema } from "@/domain/diplomacy/diplomacy.schema";
import { DoctrinesStateSchema } from "@/domain/politics/doctrines.schema";

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
  taxRate: z.number().min(0).max(50),
  tariffRate: z.number().min(0).max(100),
  treasury: z.number(),
  nationalDebt: z.number().nonnegative(),
  industrialLevel: z.number().positive(),
  government: GovernmentStateSchema,
  military: MilitaryStackSchema,
  recruitmentQueue: z.array(RecruitmentOrderSchema),
  relations: z.record(z.string(), RelationProfileSchema),
  activeModifiers: z.array(ActiveModifierSchema),
  globalReputation: z.number().min(-100).max(100),
  doctrines: DoctrinesStateSchema,
  executedEspionageTiers: z.array(z.number()).default([]),
  warFocusTargetId: z.string().nullable().optional(),
});

export type ActiveModifier = z.infer<typeof ActiveModifierSchema>;
export type Nation = z.infer<typeof NationSchema>;
