import { z } from "zod";

export const DiplomaticStanceSchema = z.enum([
  "PEACE",
  "ALLIANCE",
  "NON_AGGRESSION_PACT",
]);

export const DiplomaticProposalTypeSchema = z.enum([
  "PEACE_TREATY",
  "NON_AGGRESSION_PACT",
  "FULL_ALLIANCE",
  "IMPROVE_RELATIONS",
]);

export const RelationProfileSchema = z.object({
  targetNationId: z.string(),
  stance: DiplomaticStanceSchema,
  opinion: z.number().min(-100).max(100),
  coolOffTurnsRemaining: z.number().nonnegative(),
  coolOffTargetStance: DiplomaticStanceSchema.optional(),
});

export type DiplomaticStance = z.infer<typeof DiplomaticStanceSchema>;
export type DiplomaticProposalType = z.infer<
  typeof DiplomaticProposalTypeSchema
>;
export type RelationProfile = z.infer<typeof RelationProfileSchema>;
