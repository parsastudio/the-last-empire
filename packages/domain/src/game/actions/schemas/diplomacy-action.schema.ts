import { z } from "zod";
import { DiplomaticProposalTypeSchema } from "@/domain/diplomacy/diplomacy.schema";

export const DiplomaticProposalActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  type: z.literal("DIPLOMATIC_PROPOSAL"),
  targetNationId: z.string(),
  proposalType: DiplomaticProposalTypeSchema,
});

export const RespondDiplomaticProposalActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  type: z.literal("RESPOND_DIPLOMATIC_PROPOSAL"),
  proposalId: z.string(),
  accept: z.boolean(),
});

export const SignPeaceSettlementActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  targetNationId: z.string(),
  type: z.literal("SIGN_PEACE_SETTLEMENT"),
  proposalId: z.string().optional(),
});

export type DiplomaticProposalAction = z.infer<
  typeof DiplomaticProposalActionSchema
>;
export type RespondDiplomaticProposalAction = z.infer<
  typeof RespondDiplomaticProposalActionSchema
>;
export type SignPeaceSettlementAction = z.infer<
  typeof SignPeaceSettlementActionSchema
>;
