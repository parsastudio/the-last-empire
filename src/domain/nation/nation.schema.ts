import { z } from "zod";
import { GovernmentStateSchema } from "@/domain/politics/politics.schema";
import {
  ResourcesSchema,
  UpkeepRatesSchema,
} from "@/domain/economy/economy.schema";
import {
  MilitaryStackSchema,
  RecruitmentOrderSchema,
} from "@/domain/military/military.schema";
import { RelationProfileSchema } from "@/domain/diplomacy/diplomacy.schema";
import { DoctrinesStateSchema } from "@/domain/politics/doctrines.schema";
import {
  RegionDemographicsSchema,
  RegionDemographics,
} from "./region-demographics.schema";
import { CoordinateSchema } from "@/domain/map/coordinate.schema";

export type { RegionDemographics };

export const NationTraitSchema = z.enum([
  "OIL_RICH",
  "ISLAND_FORTRESS",
  "MILITARISTIC",
  "FRAGILE_ECONOMY",
  "ISOLATED_SOCIETY",
  "SOVEREIGN_FORTRESS",
]);

export const ActiveModifierSchema = z.object({
  id: z.string(),
  name: z.string(),
  effectType: z.string(),
  magnitude: z.number(),
  turnsRemaining: z.number().nonnegative(),
});

export const IsolatedPocketSchema = z.object({
  id: z.string(),
  territorySize: z.number().nonnegative(),
  territoryIds: z.array(z.string()),
  coordinates: z.array(CoordinateSchema),
});

export const GeographySchema = z.object({
  landNeighbors: z.array(z.string()),
  seaNeighbors: z.array(z.string()),
  hasSeaAccess: z.boolean(),
  territorySize: z.number().nonnegative(),
  infrastructureLevel: z.number().positive(),
  contiguousMainlandSize: z.number().nonnegative(),
  isolatedPockets: z.array(IsolatedPocketSchema),
  coordinates: z.array(CoordinateSchema),
});

export const NationSchema = z.object({
  id: z.string(),
  name: z.string(),
  isAi: z.boolean(),
  isAlive: z.boolean(),
  flagCode: z.string(),
  rank: z.number().positive().default(1),
  gdp: z.number().nonnegative(),
  taxRate: z.number().min(0).max(100),
  tariffRate: z.number().min(0).max(100),
  treasury: z.number(),
  nationalDebt: z.number().nonnegative(),
  population: z.number().nonnegative(),
  industrialLevel: z.number().positive(),
  consecutiveDeficitTurns: z.number().nonnegative(),
  government: GovernmentStateSchema,
  resources: ResourcesSchema,
  upkeep: UpkeepRatesSchema,
  military: MilitaryStackSchema,
  recruitmentQueue: z.array(RecruitmentOrderSchema),
  geography: GeographySchema,
  relations: z.record(z.string(), RelationProfileSchema),
  activeModifiers: z.array(ActiveModifierSchema),
  traits: z.array(NationTraitSchema),
  globalReputation: z.number().min(-100).max(100),
  doctrines: DoctrinesStateSchema,
  proxyInfluenceBudget: z.record(z.string(), z.number().nonnegative()),
  regionsDemographics: z.array(RegionDemographicsSchema).optional(),
});

export type NationTrait = z.infer<typeof NationTraitSchema>;
export type ActiveModifier = z.infer<typeof ActiveModifierSchema>;
export type IsolatedPocket = z.infer<typeof IsolatedPocketSchema>;
export type Geography = z.infer<typeof GeographySchema>;
export type Nation = z.infer<typeof NationSchema>;
