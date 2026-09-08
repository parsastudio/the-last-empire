import { z } from "zod";

export const DiplomaticStanceSchema = z.enum([
  "WAR",
  "NORMAL_DIPLOMACY",
  "NON_AGGRESSION_PACT",
  "STRATEGIC_PARTNERSHIP",
]);

export const DiplomaticProposalTypeSchema = z.enum([
  "PEACE_TREATY",
  "NON_AGGRESSION_PACT",
  "STRATEGIC_PARTNERSHIP",
  "SECURITY_GUARANTEE",
  "EMERGENCY_PROTECTORATE",
  "CANCEL_SECURITY_GUARANTEE",
  "CANCEL_EMERGENCY_PROTECTORATE",
  "DECLARE_WAR",
  "SEND_FOREIGN_AID",
  "CANCEL_TREATY",
]);

export const DiplomaticPostureSchema = z.enum([
  "NATURAL_ALLY",
  "OPPORTUNISTIC_PREDATOR",
  "WARY_BUFFER",
  "NEUTRAL_COEXISTENCE",
]);

export const RelationProfileSchema = z.object({
  targetNationId: z.string(),
  stance: DiplomaticStanceSchema,
  alignment: z.number().min(-100).max(100).default(0),
  tension: z.number().min(0).max(100).default(10),
  warDeclaredTurn: z.number().nonnegative().optional(),
  warInitiatorId: z.string().optional(),
  isIntervener: z.boolean().optional(),
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
export type DiplomaticPosture = z.infer<typeof DiplomaticPostureSchema>;
export type RelationProfile = z.infer<typeof RelationProfileSchema>;
export type PendingDiplomaticProposal = z.infer<
  typeof PendingDiplomaticProposalSchema
>;
