import { z } from "zod";
import { EconomicDoctrineStanceSchema } from "@/domain/politics/economic-doctrine.schema";

export const SetEconomicDoctrineActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  type: z.literal("SET_ECONOMIC_DOCTRINE"),
  stance: EconomicDoctrineStanceSchema,
});

export const BuildFactoryActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  type: z.literal("BUILD_FACTORY"),
  quantity: z.number().int().positive().default(1),
  provinceId: z.number().positive().optional(),
});

export const EquipDomesticMachineryActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  type: z.literal("EQUIP_DOMESTIC_MACHINERY"),
  quantity: z.number().positive().optional(),
});

export const InvestIndustrialResearchActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  type: z.literal("INVEST_INDUSTRIAL_RESEARCH"),
});

export const BuyIndustrialEquipmentActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  type: z.literal("BUY_INDUSTRIAL_EQUIPMENT"),
  sellerNationId: z.string(),
  quantity: z.number().positive(),
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

export type SetEconomicDoctrineAction = z.infer<
  typeof SetEconomicDoctrineActionSchema
>;
export type BuildFactoryAction = z.infer<typeof BuildFactoryActionSchema>;
export type EquipDomesticMachineryAction = z.infer<
  typeof EquipDomesticMachineryActionSchema
>;
export type InvestIndustrialResearchAction = z.infer<
  typeof InvestIndustrialResearchActionSchema
>;
export type BuyIndustrialEquipmentAction = z.infer<
  typeof BuyIndustrialEquipmentActionSchema
>;
export type RepayDebtAction = z.infer<typeof RepayDebtActionSchema>;
export type RequestLoanAction = z.infer<typeof RequestLoanActionSchema>;
