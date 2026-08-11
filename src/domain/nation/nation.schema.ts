import { z } from "zod";
import { GovernmentStateSchema } from "@/domain/politics/politics.schema";
import { MilitaryPayrollRatesSchema } from "@/domain/economy/economy.schema";
import {
  MilitaryStackSchema,
  RecruitmentOrderSchema,
} from "@/domain/military/military.schema";
import { RelationProfileSchema } from "@/domain/diplomacy/diplomacy.schema";
import { DoctrinesStateSchema } from "@/domain/politics/doctrines.schema";
import {
  RegionDemographicsSchema,
  RegionDemographics,
} from "@/domain/nation/region-demographics.schema";
import { CoordinateSchema } from "@/domain/map/coordinate.schema";

export const ActiveModifierSchema = z.object({
  id: z.string(),
  name: z.string(),
  effectType: z.string(),
  magnitude: z.number(),
  turnsRemaining: z.number().nonnegative(),
});

export const IsolatedPocketSchema = z.object({
  id: z.string(),
  pixelCount: z.number().nonnegative(),
  territoryIds: z.array(z.string()),
  coordinates: z.array(CoordinateSchema),
});

export const GeographySchema = z.object({
  landNeighbors: z.array(z.string()),
  seaNeighbors: z.array(z.string()),
  hasSeaAccess: z.boolean(),
  territoryPixelCount: z.number().nonnegative(),
  infrastructureLevel: z.number().positive(),
  contiguousMainlandPixelCount: z.number().nonnegative(),
  isolatedPockets: z.array(IsolatedPocketSchema),
  coordinates: z.array(CoordinateSchema),
});

export const ResourcesSchema = z.object({});

export const NationSchema = z.object({
  id: z.string(),
  name: z.string(),
  isAi: z.boolean(),
  isAlive: z.boolean(),
  flagCode: z.string(),
  rank: z.number().positive().default(1),
  gdp: z.number().nonnegative(),
  perCapitaProductivity: z.number().nonnegative().default(5000),
  maxPopulationCapacity: z.number().nonnegative().default(100000000),
  taxRate: z.number().min(0).max(50),
  tariffRate: z.number().min(0).max(100),
  treasury: z.number(),
  nationalDebt: z.number().nonnegative(),
  population: z.number().nonnegative(),
  industrialLevel: z.number().positive(),
  consecutiveDeficitTurns: z.number().nonnegative(),
  government: GovernmentStateSchema,
  resources: ResourcesSchema.default({}),
  militaryPayroll: MilitaryPayrollRatesSchema.optional(),
  military: MilitaryStackSchema,
  recruitmentQueue: z.array(RecruitmentOrderSchema),
  geography: GeographySchema,
  relations: z.record(z.string(), RelationProfileSchema),
  activeModifiers: z.array(ActiveModifierSchema),
  globalReputation: z.number().min(-100).max(100),
  doctrines: DoctrinesStateSchema,
  proxyInfluenceBudget: z.record(z.string(), z.number().nonnegative()),
  regionsDemographics: z.array(RegionDemographicsSchema).optional(),
  provinceIds: z.array(z.number()).default([]),
});

export type ActiveModifier = z.infer<typeof ActiveModifierSchema>;
export type IsolatedPocket = z.infer<typeof IsolatedPocketSchema>;
export type Geography = z.infer<typeof GeographySchema>;
export type Resources = z.infer<typeof ResourcesSchema>;
export type Nation = z.infer<typeof NationSchema>;
export type { RegionDemographics };
