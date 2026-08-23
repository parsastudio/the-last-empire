import { z } from "zod";

export const ProvinceSchema = z.object({
  provinceId: z.number().positive(),
  nameFa: z.string(),
  countryNumericId: z.number().nonnegative(),
  ownerNationId: z.string(),
  pixelCount: z.number().nonnegative(),
  hasSeaAccess: z.boolean(),
  landNeighbors: z.array(z.number()),
  maritimeNeighborsTier1: z.array(z.number()).default([]),
  maritimeNeighborsTier2: z.array(z.number()).default([]),
  centerCoordinates: z.object({
    x: z.number(),
    y: z.number(),
  }),
  fortLevel: z.number().nonnegative().default(0),
  infrastructureLevel: z.number().positive().default(1),
  population: z.number().nonnegative().default(0),
  perCapitaProductivity: z.number().nonnegative().default(5000),
  maxPopulationCapacity: z.number().nonnegative().default(100000),
});

export type Province = z.infer<typeof ProvinceSchema>;
