import { z } from "zod";
import { FactoryBatchSchema } from "@/domain/economy/factory-batch.schema";

export const ProvinceStaticTopologySchema = z.object({
  provinceId: z.number().positive(),
  provinceIndex: z.number().int().positive().optional().default(1),
  nameFa: z.string().optional(),
  countryId: z.string().optional(),
  originalCountryId: z.string().optional(),
  pixelCount: z.number().nonnegative(),
  hasSeaAccess: z.boolean(),
  landNeighbors: z.array(z.number()).default([]),
  maritimeNeighborsTier1: z.array(z.number()).default([]),
  maritimeNeighborsTier2: z.array(z.number()).default([]),
  centerCoordinates: z.object({
    x: z.number(),
    y: z.number(),
  }),
  population: z.number().nonnegative().default(1000000),
  maxSlots: z.number().nonnegative().default(1),
});

export const ProvinceDynamicStateSchema = z.object({
  provinceId: z.number().positive(),
  ownerNationId: z.string(),
  originalNationId: z.string().optional(),
  factoriesCount: z.number().nonnegative().default(1),
  factoryTiers: z.array(FactoryBatchSchema).default([]),
});

export const ProvinceSchema = ProvinceDynamicStateSchema.merge(
  ProvinceStaticTopologySchema.omit({ provinceId: true }).partial(),
);

export type ProvinceStaticTopology = z.infer<
  typeof ProvinceStaticTopologySchema
>;
export type ProvinceDynamicState = z.infer<typeof ProvinceDynamicStateSchema>;
export type Province = z.infer<typeof ProvinceSchema>;
