import { z } from "zod";

export const DiplomaticStanceSchema = z.enum([
  "WAR",
  "NORMAL_DIPLOMACY",
  "NON_AGGRESSION_PACT",
  "ALLIANCE",
]);

export const DiplomaticProposalTypeSchema = z.enum([
  "PEACE_TREATY",
  "NON_AGGRESSION_PACT",
  "FULL_ALLIANCE",
  "DECLARE_WAR",
  "SEND_FOREIGN_AID",
]);

export const RelationProfileSchema = z.object({
  targetNationId: z.string(),
  stance: DiplomaticStanceSchema,
  opinion: z.number().min(-100).max(100),
  grudge: z.number().min(0).max(100).default(0),
});

export const PendingDiplomaticProposalSchema = z.object({
  id: z.string(),
  turn: z.number().nonnegative(),
  senderNationId: z.string(),
  receiverNationId: z.string(),
  proposalType: DiplomaticProposalTypeSchema,
  expiresTurn: z.number().nonnegative(),
});

export type DiplomaticStance = z.infer<typeof DiplomaticStanceSchema>;
export type DiplomaticProposalType = z.infer<
  typeof DiplomaticProposalTypeSchema
>;
export type RelationProfile = z.infer<typeof RelationProfileSchema>;
export type PendingDiplomaticProposal = z.infer<
  typeof PendingDiplomaticProposalSchema
>;
