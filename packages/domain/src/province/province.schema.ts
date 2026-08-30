import { z } from "zod";

export const ProvinceSchema = z.object({
  provinceId: z.number().positive(),
  nameFa: z.string(),
  ownerNationId: z.string(),
  originalNationId: z.string().optional(),
  pixelCount: z.number().nonnegative(),
  hasSeaAccess: z.boolean(),
  landNeighbors: z.array(z.number()),
  maritimeNeighborsTier1: z.array(z.number()).default([]),
  maritimeNeighborsTier2: z.array(z.number()).default([]),
  centerCoordinates: z.object({
    x: z.number(),
    y: z.number(),
  }),
  population: z.number().nonnegative().default(1000000),
  maxSlots: z.number().nonnegative().default(1),
  factoriesCount: z.number().nonnegative().default(1),
});

export type Province = z.infer<typeof ProvinceSchema>;
