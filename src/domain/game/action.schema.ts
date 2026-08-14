import { z } from "zod";
import { UnitTypeSchema } from "@/domain/military/military.schema";
import { DiplomaticProposalTypeSchema } from "@/domain/diplomacy/diplomacy.schema";
import { GameStateSchema } from "@/domain/game/game-state.schema";
import { EspionageTierSchema } from "@/domain/espionage/espionage.schema";

export const SetTaxRateActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  type: z.literal("SET_TAX_RATE"),
  newRate: z.number().min(0).max(50),
});

export const SetTariffRateActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  type: z.literal("SET_TARIFF_RATE"),
  newRate: z.number().min(0).max(100),
});

export const RecruitUnitActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  type: z.literal("RECRUIT_UNIT"),
  unitType: UnitTypeSchema,
  quantity: z.number().positive(),
});

export const BuyArmsMarketActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  type: z.literal("BUY_ARMS_MARKET"),
  sellerNationId: z.string(),
  unitType: UnitTypeSchema,
  quantity: z.number().positive(),
});

export const DiplomaticProposalActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  type: z.literal("DIPLOMATIC_PROPOSAL"),
  targetNationId: z.string(),
  proposalType: DiplomaticProposalTypeSchema,
});

export const UpgradeIndustrialLevelActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  type: z.literal("UPGRADE_INDUSTRIAL_LEVEL"),
});

export const InvestInfrastructureActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  type: z.literal("INVEST_INFRASTRUCTURE"),
});

export const ExecuteEspionageActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  type: z.literal("EXECUTE_ESPIONAGE_OPERATION"),
  targetNationId: z.string(),
  tier: EspionageTierSchema,
});

export const UnlockDoctrineActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  type: z.literal("UNLOCK_DOCTRINE"),
  doctrineId: z.string(),
});

export const RepayDebtActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  type: z.literal("REPAY_DEBT"),
  amount: z.number().positive(),
});

export const RequestLoanActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  type: z.literal("REQUEST_LOAN"),
  amount: z.number().positive(),
});

export const CancelRecruitmentActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  type: z.literal("CANCEL_RECRUITMENT"),
  orderId: z.string(),
});

export const InvestResearchActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  type: z.literal("INVEST_RESEARCH"),
});

export const InitiateBattleActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  type: z.literal("INITIATE_BATTLE"),
  targetNationId: z.string(),
  targetProvinceId: z.number().positive().optional(),
  dronesToLaunch: z.number().nonnegative(),
  infantryToDeploy: z.number().positive().optional(),
  armorToDeploy: z.number().nonnegative().optional(),
  airForceToDeploy: z.number().nonnegative().optional(),
  attackType: z.enum(["LAND", "NAVAL"]).optional(),
});

export const GameActionSchema = z.discriminatedUnion("type", [
  SetTaxRateActionSchema,
  SetTariffRateActionSchema,
  RecruitUnitActionSchema,
  BuyArmsMarketActionSchema,
  DiplomaticProposalActionSchema,
  UpgradeIndustrialLevelActionSchema,
  InvestInfrastructureActionSchema,
  ExecuteEspionageActionSchema,
  UnlockDoctrineActionSchema,
  RepayDebtActionSchema,
  RequestLoanActionSchema,
  CancelRecruitmentActionSchema,
  InvestResearchActionSchema,
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
export type BuyArmsMarketAction = z.infer<typeof BuyArmsMarketActionSchema>;
export type DiplomaticProposalAction = z.infer<
  typeof DiplomaticProposalActionSchema
>;
export type UpgradeIndustrialLevelAction = z.infer<
  typeof UpgradeIndustrialLevelActionSchema
>;
export type InvestInfrastructureAction = z.infer<
  typeof InvestInfrastructureActionSchema
>;
export type ExecuteEspionageAction = z.infer<
  typeof ExecuteEspionageActionSchema
>;
export type UnlockDoctrineAction = z.infer<typeof UnlockDoctrineActionSchema>;
export type RepayDebtAction = z.infer<typeof RepayDebtActionSchema>;
export type RequestLoanAction = z.infer<typeof RequestLoanActionSchema>;
export type CancelRecruitmentAction = z.infer<
  typeof CancelRecruitmentActionSchema
>;
export type InvestResearchAction = z.infer<typeof InvestResearchActionSchema>;
export type InitiateBattleAction = z.infer<typeof InitiateBattleActionSchema>;
export type GameAction = z.infer<typeof GameActionSchema>;
export type ActionResult = z.infer<typeof ActionResultSchema>;
