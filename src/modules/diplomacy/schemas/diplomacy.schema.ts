import { z } from "zod";

export const DiplomaticStanceSchema = z.enum([
  "PEACE",
  "WAR",
  "ALLIANCE",
  "NON_AGGRESSION_PACT",
  "DEFENSIVE_PACT",
  "EMBARGO",
  "COALITION",
]);

export const DiplomaticProposalTypeSchema = z.enum([
  "PEACE_TREATY",
  "NON_AGGRESSION_PACT",
  "DEFENSIVE_PACT",
  "FULL_ALLIANCE",
  "MILITARY_ACCESS",
  "IMPROVE_RELATIONS",
  "DEMAND_TRIBUTE",
  "LIFT_EMBARGO",
]);

export const RelationProfileSchema = z.object({
  targetNationId: z.string(),
  stance: DiplomaticStanceSchema,
  opinion: z.number().min(-100).max(100),
  tributePerTurn: z.number().nonnegative(),
  militaryAccess: z.boolean(),
  embargoActive: z.boolean(),
  treatyTurnsRemaining: z.number().nonnegative(),
  spyNetworkStrength: z.number().min(0).max(100),
  intelLevel: z.number().min(0).max(3),
  trust: z.number().min(-100).max(100),
  tension: z.number().min(0).max(100),
});

export type DiplomaticStance = z.infer<typeof DiplomaticStanceSchema>;
export type DiplomaticProposalType = z.infer<
  typeof DiplomaticProposalTypeSchema
>;
export type RelationProfile = z.infer<typeof RelationProfileSchema>;
