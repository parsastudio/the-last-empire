import { z } from "zod";
import { GovernmentTypeSchema } from "@/modules/politics/schemas/politics.schema";
import { UnitTypeSchema } from "@/modules/military/schemas/military.schema";
import { DiplomaticProposalTypeSchema } from "@/modules/diplomacy/schemas/diplomacy.schema";

export const SetTaxRateActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  signature: z.string().optional(),
  type: z.literal("SET_TAX_RATE"),
  newRate: z.number().min(0).max(100),
});

export const ChangeGovernmentActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  signature: z.string().optional(),
  type: z.literal("CHANGE_GOVERNMENT"),
  newGovernment: GovernmentTypeSchema,
});

export const RecruitUnitActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  signature: z.string().optional(),
  type: z.literal("RECRUIT_UNIT"),
  unitType: UnitTypeSchema,
  quantity: z.number().positive(),
});

export const DeclareWarActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  signature: z.string().optional(),
  type: z.literal("DECLARE_WAR"),
  targetNationId: z.string(),
});

export const AttackActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  signature: z.string().optional(),
  type: z.literal("ATTACK"),
  targetNationId: z.string(),
  infantry: z.number().nonnegative(),
  airForce: z.number().nonnegative(),
  droneMissile: z.number().nonnegative(),
});

export const DiplomaticProposalActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  signature: z.string().optional(),
  type: z.literal("DIPLOMATIC_PROPOSAL"),
  targetNationId: z.string(),
  proposalType: DiplomaticProposalTypeSchema,
  tributeAmount: z.number().nonnegative().optional(),
});

export const TradeResourcesActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  signature: z.string().optional(),
  type: z.literal("TRADE_RESOURCES"),
  resourceType: z.enum(["oil", "steel"]),
  isBuy: z.boolean(),
  amount: z.number().positive(),
});

export const UpgradeIndustrialLevelActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  signature: z.string().optional(),
  type: z.literal("UPGRADE_INDUSTRIAL_LEVEL"),
});

export const InvestInfrastructureActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  signature: z.string().optional(),
  type: z.literal("INVEST_INFRASTRUCTURE"),
});

export const FundProxyInfluenceActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  signature: z.string().optional(),
  type: z.literal("FUND_PROXY_INFLUENCE"),
  targetNationId: z.string(),
  budget: z.number().positive(),
});

export const UnlockDoctrineActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  signature: z.string().optional(),
  type: z.literal("UNLOCK_DOCTRINE"),
  doctrineId: z.string(),
});

export const RepayDebtActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  signature: z.string().optional(),
  type: z.literal("REPAY_DEBT"),
  amount: z.number().positive(),
});

export const ActivateAbilityActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  signature: z.string().optional(),
  type: z.literal("ACTIVATE_ABILITY"),
  abilityType: z.enum([
    "DIPLOMATIC_SUMMIT",
    "MARTIAL_LAW",
    "INDUSTRIAL_MOBILIZATION",
    "ROYAL_DECREE",
    "WAR_ALERT",
  ]),
  targetNationId: z.string().optional(),
});

export const GameActionSchema = z.discriminatedUnion("type", [
  SetTaxRateActionSchema,
  ChangeGovernmentActionSchema,
  RecruitUnitActionSchema,
  DeclareWarActionSchema,
  AttackActionSchema,
  DiplomaticProposalActionSchema,
  TradeResourcesActionSchema,
  UpgradeIndustrialLevelActionSchema,
  InvestInfrastructureActionSchema,
  FundProxyInfluenceActionSchema,
  UnlockDoctrineActionSchema,
  RepayDebtActionSchema,
  ActivateAbilityActionSchema,
]);

export const ActionResultSchema = z.object({
  success: z.boolean(),
  actionId: z.string(),
  message: z.string(),
  error: z.string().optional(),
});

export type SetTaxRateAction = z.infer<typeof SetTaxRateActionSchema>;
export type ChangeGovernmentAction = z.infer<
  typeof ChangeGovernmentActionSchema
>;
export type RecruitUnitAction = z.infer<typeof RecruitUnitActionSchema>;
export type DeclareWarAction = z.infer<typeof DeclareWarActionSchema>;
export type AttackAction = z.infer<typeof AttackActionSchema>;
export type DiplomaticProposalAction = z.infer<
  typeof DiplomaticProposalActionSchema
>;
export type TradeResourcesAction = z.infer<typeof TradeResourcesActionSchema>;
export type UpgradeIndustrialLevelAction = z.infer<
  typeof UpgradeIndustrialLevelActionSchema
>;
export type InvestInfrastructureAction = z.infer<
  typeof InvestInfrastructureActionSchema
>;
export type FundProxyInfluenceAction = z.infer<
  typeof FundProxyInfluenceActionSchema
>;
export type UnlockDoctrineAction = z.infer<typeof UnlockDoctrineActionSchema>;
export type RepayDebtAction = z.infer<typeof RepayDebtActionSchema>;
export type ActivateAbilityAction = z.infer<typeof ActivateAbilityActionSchema>;
export type GameAction = z.infer<typeof GameActionSchema>;
export type ActionResult = z.infer<typeof ActionResultSchema>;
