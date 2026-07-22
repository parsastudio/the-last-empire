import { z } from "zod";
import { GovernmentTypeSchema } from "@/modules/politics/schemas/politics.schema";
import { UnitTypeSchema } from "@/modules/military/schemas/military.schema";
import { DiplomaticProposalTypeSchema } from "@/modules/diplomacy/schemas/diplomacy.schema";

export const SetTaxRateActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  type: z.literal("SET_TAX_RATE"),
  newRate: z.number().min(0).max(100),
});

export const ChangeGovernmentActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  type: z.literal("CHANGE_GOVERNMENT"),
  newGovernment: GovernmentTypeSchema,
});

export const RecruitUnitActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  type: z.literal("RECRUIT_UNIT"),
  unitType: UnitTypeSchema,
  quantity: z.number().positive(),
});

export const DeclareWarActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  type: z.literal("DECLARE_WAR"),
  targetNationId: z.string(),
});

export const AttackActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  type: z.literal("ATTACK"),
  targetNationId: z.string(),
  infantry: z.number().nonnegative(),
  airForce: z.number().nonnegative(),
  navy: z.number().nonnegative(),
  droneMissile: z.number().nonnegative(),
});

export const DiplomaticProposalActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  type: z.literal("DIPLOMATIC_PROPOSAL"),
  targetNationId: z.string(),
  proposalType: DiplomaticProposalTypeSchema,
  tributeAmount: z.number().nonnegative().optional(),
});

export const TradeResourcesActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  type: z.literal("TRADE_RESOURCES"),
  resourceType: z.enum(["oil", "steel"]),
  isBuy: z.boolean(),
  amount: z.number().positive(),
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
]);

export const ActionResultSchema = z.object({
  success: z.boolean(),
  actionId: z.string(),
  message: z.string(),
  error: z.string().optional(),
});
