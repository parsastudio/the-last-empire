import { z } from "zod";
import { AiDoctrineTypeSchema } from "@/domain/nation/nation-doctrine.schema";
import { GovernmentTypeSchema } from "@/domain/politics/politics.schema";

export const FinalManifestProvinceSchema = z.object({
  provinceId: z.number().positive(),
  nameFa: z.string().min(1),
  countryId: z.string().min(1),
  originalCountryId: z.string().optional(),
  pixelCount: z.number().nonnegative(),
  hasSeaAccess: z.boolean(),
  landNeighbors: z.array(z.number()),
  maritimeNeighborsTier1: z.array(z.number()).default([]),
  maritimeNeighborsTier2: z.array(z.number()).default([]),
  centerCoordinates: z.object({
    x: z.number(),
    y: z.number(),
  }),
  population: z.number().nonnegative(),
  maxSlots: z.number().nonnegative(),
  factoriesCount: z.number().nonnegative(),
});

export const FinalManifestNationSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  flagCode: z.string().min(1),
  nameFa: z.string().min(1),
  nameEn: z.string().min(1),
  gdp: z.number().positive(),
  population: z.number().positive(),
  territoryPixelCount: z.number().nonnegative(),
  provinceIds: z.array(z.number()),
  hasSeaAccess: z.boolean(),
  startingTreasury: z.number().nonnegative(),
  initialRank: z.number().positive(),
  defaultGovernment: GovernmentTypeSchema,
  startingInfantry: z.number().nonnegative(),
  startingArmor: z.number().nonnegative().optional().default(0),
  startingAirDefense: z.number().nonnegative().optional().default(0),
  startingAirForce: z.number().nonnegative(),
  startingDroneMissile: z.number().nonnegative(),
  startingTechLevel: z.number().positive(),
  industrialLevel: z.number().positive(),
  equipmentTechLevel: z.number().positive().optional(),
  startingStability: z.number().min(0).max(100),
  aiDoctrine: AiDoctrineTypeSchema.optional(),
});

export const FinalMapManifestSchema = z.object({
  mapId: z.string().min(1),
  totalProvincesCount: z.number().positive(),
  totalNationsCount: z.number().positive(),
  width: z.number().positive(),
  height: z.number().positive(),
  provinces: z.array(FinalManifestProvinceSchema),
  nations: z.array(FinalManifestNationSchema),
});

export type FinalManifestProvince = z.infer<typeof FinalManifestProvinceSchema>;
export type FinalManifestNation = z.infer<typeof FinalManifestNationSchema>;
export type FinalMapManifest = z.infer<typeof FinalMapManifestSchema>;

export class ManifestValidator {
  public static validate(manifest: unknown): FinalMapManifest {
    const result = FinalMapManifestSchema.safeParse(manifest);
    if (!result.success) {
      throw new Error(
        `خطای اعتبارسنجی پرونده مانیفست نقشه: ${result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(" | ")}`,
      );
    }
    return result.data;
  }
}
