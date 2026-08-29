import { z } from "zod";

export const PeaceSettlementTypeSchema = z.enum([
  "WHITE_PEACE",
  "INDEMNITY",
  "TERRITORY_CONCESSION",
  "FULL_CAPITULATION",
]);

export const PeaceTermsPackageSchema = z.object({
  sourceNationId: z.string(),
  targetNationId: z.string(),
  settlementType: PeaceSettlementTypeSchema,
  ratio: z.number(),
  sourceTwmi: z.number(),
  targetTwmi: z.number(),
  isAiOffering: z.boolean(),
  moneyAmount: z.number().nonnegative().default(0),
  concededProvinceIds: z.array(z.number()).default([]),
  concededProvincesNames: z.array(z.string()).default([]),
  headline: z.string(),
  description: z.string(),
  canAffordTerms: z.boolean().default(true),
});

export type PeaceSettlementType = z.infer<typeof PeaceSettlementTypeSchema>;
export type PeaceTermsPackage = z.infer<typeof PeaceTermsPackageSchema>;
