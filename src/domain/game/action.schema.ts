import { z } from "zod";
import { UnitTypeSchema } from "@/domain/military/military.schema";
import { DiplomaticProposalTypeSchema } from "@/domain/diplomacy/diplomacy.schema";
import { GameStateSchema } from "./game-state.schema";
import { CoordinateSchema } from "@/domain/map/coordinate.schema";

export const SetTaxRateActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  signature: z.string().optional(),
  type: z.literal("SET_TAX_RATE"),
  newRate: z.number().min(0).max(50),
});

export const SetTariffRateActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  signature: z.string().optional(),
  type: z.literal("SET_TARIFF_RATE"),
  newRate: z.number().min(0).max(100),
});

export const RecruitUnitActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  signature: z.string().optional(),
  type: z.literal("RECRUIT_UNIT"),
  unitType: UnitTypeSchema,
  quantity: z.number().positive(),
});

export const DiplomaticProposalActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  signature: z.string().optional(),
  type: z.literal("DIPLOMATIC_PROPOSAL"),
  targetNationId: z.string(),
  proposalType: DiplomaticProposalTypeSchema,
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

export const DisbandUnitActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  signature: z.string().optional(),
  type: z.literal("DISBAND_UNIT"),
  unitType: UnitTypeSchema,
  quantity: z.number().positive(),
});

export const RequestLoanActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  signature: z.string().optional(),
  type: z.literal("REQUEST_LOAN"),
  amount: z.number().positive(),
});

export const CancelRecruitmentActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  signature: z.string().optional(),
  type: z.literal("CANCEL_RECRUITMENT"),
  orderId: z.string(),
});

export const InvestResearchActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  signature: z.string().optional(),
  type: z.literal("INVEST_RESEARCH"),
});

export const AntiCorruptionDriveActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  signature: z.string().optional(),
  type: z.literal("ANTI_CORRUPTION_DRIVE"),
  amount: z.number().positive(),
});

export const InvestDiplomacyActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  signature: z.string().optional(),
  type: z.literal("INVEST_DIPLOMACY"),
  amount: z.number().positive(),
});

export const InitiateBattleActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  signature: z.string().optional(),
  type: z.literal("INITIATE_BATTLE"),
  targetNationId: z.string(),
  dronesToLaunch: z.number().nonnegative(),
});

export const GameActionSchema = z.discriminatedUnion("type", [
  SetTaxRateActionSchema,
  SetTariffRateActionSchema,
  RecruitUnitActionSchema,
  DiplomaticProposalActionSchema,
  TradeResourcesActionSchema,
  UpgradeIndustrialLevelActionSchema,
  InvestInfrastructureActionSchema,
  FundProxyInfluenceActionSchema,
  UnlockDoctrineActionSchema,
  RepayDebtActionSchema,
  ActivateAbilityActionSchema,
  DisbandUnitActionSchema,
  RequestLoanActionSchema,
  CancelRecruitmentActionSchema,
  InvestResearchActionSchema,
  AntiCorruptionDriveActionSchema,
  InvestDiplomacyActionSchema,
  InitiateBattleActionSchema,
]);

export const ActionResultSchema = z.object({
  success: z.boolean(),
  actionId: z.string(),
  message: z.string(),
  error: z.string().optional(),
  newState: GameStateSchema.optional(),
});

export type SetTaxRateAction = z.infer<typeof SetTaxRateActionSchema>;
export type SetTariffRateAction = z.infer<typeof SetTariffRateActionSchema>;
export type RecruitUnitAction = z.infer<typeof RecruitUnitActionSchema>;
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
export type DisbandUnitAction = z.infer<typeof DisbandUnitActionSchema>;
export type RequestLoanAction = z.infer<typeof RequestLoanActionSchema>;
export type CancelRecruitmentAction = z.infer<
  typeof CancelRecruitmentActionSchema
>;
export type InvestResearchAction = z.infer<typeof InvestResearchActionSchema>;
export type AntiCorruptionDriveAction = z.infer<
  typeof AntiCorruptionDriveActionSchema
>;
export type InvestDiplomacyAction = z.infer<typeof InvestDiplomacyActionSchema>;
export type InitiateBattleAction = z.infer<typeof InitiateBattleActionSchema>;
export type GameAction = z.infer<typeof GameActionSchema>;
export type ActionResult = z.infer<typeof ActionResultSchema>;
export { CoordinateSchema };
