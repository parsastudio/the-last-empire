import { z } from "zod";
import { GovernmentStateSchema } from "@/modules/politics/schemas/politics.schema";
import {
  ResourcesSchema,
  UpkeepRatesSchema,
} from "@/modules/economy/schemas/economy.schema";
import {
  MilitaryStackSchema,
  RecruitmentOrderSchema,
} from "@/modules/military/schemas/military.schema";
import { RelationProfileSchema } from "@/modules/diplomacy/schemas/diplomacy.schema";
import { ImfLoanSchema } from "@/modules/trade/schemas/trade.schema";

export const NationTraitSchema = z.enum([
  "OIL_RICH",
  "ISLAND_FORTRESS",
  "MILITARISTIC",
  "FRAGILE_ECONOMY",
  "INDUSTRIAL_HUB",
  "ISOLATED_SOCIETY",
]);

export const ActiveModifierSchema = z.object({
  id: z.string(),
  name: z.string(),
  effectType: z.string(),
  magnitude: z.number(),
  turnsRemaining: z.number().nonnegative(),
});

export const GeographySchema = z.object({
  landNeighbors: z.array(z.string()),
  seaNeighbors: z.array(z.string()),
  hasSeaAccess: z.boolean(),
  territorySize: z.number().nonnegative(),
  infrastructureLevel: z.number().positive(),
});

export const NationSchema = z.object({
  id: z.string(),
  name: z.string(),
  isAi: z.boolean(),
  isAlive: z.boolean(),
  flagCode: z.string(),
  gdp: z.number().nonnegative(),
  taxRate: z.number().min(0).max(100),
  tariffRate: z.number().min(0).max(100),
  treasury: z.number(),
  debt: z.number().nonnegative(),
  population: z.number().nonnegative(),
  inflation: z.number().min(0),
  warExhaustion: z.number().min(0).max(100),
  reputation: z.number().min(-100).max(100),
  industrialLevel: z.number().positive(),
  government: GovernmentStateSchema,
  resources: ResourcesSchema,
  upkeep: UpkeepRatesSchema,
  military: MilitaryStackSchema,
  recruitmentQueue: z.array(RecruitmentOrderSchema),
  geography: GeographySchema,
  relations: z.record(z.string(), RelationProfileSchema),
  activeModifiers: z.array(ActiveModifierSchema),
  imfLoans: z.array(ImfLoanSchema),
  traits: z.array(NationTraitSchema),
});
