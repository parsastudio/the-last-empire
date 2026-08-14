import { z } from "zod";

export const DiplomaticStanceSchema = z.enum([
  "WAR",
  "SEVERED_RELATIONS",
  "NORMAL_DIPLOMACY",
  "NON_AGGRESSION_PACT",
  "ALLIANCE",
]);

export const DiplomaticProposalTypeSchema = z.enum([
  "PEACE_TREATY",
  "NON_AGGRESSION_PACT",
  "FULL_ALLIANCE",
  "SEVER_TRADE_RELATIONS",
  "DECLARE_WAR",
  "SEND_FOREIGN_AID",
]);

export const RelationProfileSchema = z.object({
  targetNationId: z.string(),
  stance: DiplomaticStanceSchema,
  opinion: z.number().min(-100).max(100),
  coolOffTurnsRemaining: z.number().nonnegative(),
  isTradeEmbargoed: z.boolean().optional(),
});

export type DiplomaticStance = z.infer<typeof DiplomaticStanceSchema>;
export type DiplomaticProposalType = z.infer<
  typeof DiplomaticProposalTypeSchema
>;
export type RelationProfile = z.infer<typeof RelationProfileSchema>;
