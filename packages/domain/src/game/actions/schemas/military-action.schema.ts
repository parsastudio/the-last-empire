import { z } from "zod";
import { UnitTypeSchema } from "@/domain/military/military.schema";

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

export const BuyNavalFleetActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  type: z.literal("BUY_NAVAL_FLEET"),
  quantity: z.number().positive(),
});

export const InitiateBattleActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  type: z.literal("INITIATE_BATTLE"),
  targetNationId: z.string(),
  targetProvinceId: z.number().positive().optional(),
  dronesToLaunch: z.number().nonnegative().optional(),
  infantryToDeploy: z.number().positive().optional(),
  armorToDeploy: z.number().nonnegative().optional(),
  airForceToDeploy: z.number().nonnegative().optional(),
  attackType: z.enum(["LAND", "NAVAL"]).optional(),
});

export type RecruitUnitAction = z.infer<typeof RecruitUnitActionSchema>;
export type BuyArmsMarketAction = z.infer<typeof BuyArmsMarketActionSchema>;
export type BuyNavalFleetAction = z.infer<typeof BuyNavalFleetActionSchema>;
export type InitiateBattleAction = z.infer<typeof InitiateBattleActionSchema>;
