import { z } from "zod";
import { GameStateSchema } from "@/domain/game/game-state.schema";
import {
  SetEconomicDoctrineActionSchema,
  BuildFactoryActionSchema,
  EquipDomesticMachineryActionSchema,
  InvestIndustrialResearchActionSchema,
  BuyIndustrialEquipmentActionSchema,
  BuyProvinceActionSchema,
  RepayDebtActionSchema,
  RequestLoanActionSchema,
  SetEconomicDoctrineAction,
  BuildFactoryAction,
  EquipDomesticMachineryAction,
  InvestIndustrialResearchAction,
  BuyIndustrialEquipmentAction,
  BuyProvinceAction,
  RepayDebtAction,
  RequestLoanAction,
} from "@/domain/game/actions/schemas/economy-action.schema";
import {
  RecruitUnitActionSchema,
  BuyArmsMarketActionSchema,
  BuyNavalFleetActionSchema,
  InitiateBattleActionSchema,
  RecruitUnitAction,
  BuyArmsMarketAction,
  BuyNavalFleetAction,
  InitiateBattleAction,
} from "@/domain/game/actions/schemas/military-action.schema";
import {
  DiplomaticProposalActionSchema,
  RespondDiplomaticProposalActionSchema,
  SignPeaceSettlementActionSchema,
  DiplomaticProposalAction,
  RespondDiplomaticProposalAction,
  SignPeaceSettlementAction,
} from "@/domain/game/actions/schemas/diplomacy-action.schema";
import {
  ExecuteEspionageActionSchema,
  ExecuteEspionageAction,
} from "@/domain/game/actions/schemas/espionage-action.schema";
import {
  InvestResearchActionSchema,
  InvestResearchAction,
} from "@/domain/game/actions/schemas/politics-action.schema";
import {
  ResolveDilemmaActionSchema,
  ResolveDilemmaAction,
} from "@/domain/game/actions/schemas/dilemma-action.schema";

export * from "@/domain/game/actions/schemas/economy-action.schema";
export * from "@/domain/game/actions/schemas/military-action.schema";
export * from "@/domain/game/actions/schemas/diplomacy-action.schema";
export * from "@/domain/game/actions/schemas/espionage-action.schema";
export * from "@/domain/game/actions/schemas/politics-action.schema";
export * from "@/domain/game/actions/schemas/dilemma-action.schema";

export const GameActionSchema = z.discriminatedUnion("type", [
  SetEconomicDoctrineActionSchema,
  BuildFactoryActionSchema,
  EquipDomesticMachineryActionSchema,
  InvestIndustrialResearchActionSchema,
  BuyIndustrialEquipmentActionSchema,
  RecruitUnitActionSchema,
  BuyArmsMarketActionSchema,
  BuyNavalFleetActionSchema,
  BuyProvinceActionSchema,
  DiplomaticProposalActionSchema,
  RespondDiplomaticProposalActionSchema,
  SignPeaceSettlementActionSchema,
  ExecuteEspionageActionSchema,
  RepayDebtActionSchema,
  RequestLoanActionSchema,
  InvestResearchActionSchema,
  InitiateBattleActionSchema,
  ResolveDilemmaActionSchema,
]);

export const ActionResultSchema = z.object({
  success: z.boolean(),
  actionId: z.string(),
  message: z.string(),
  error: z.string().optional(),
  newState: GameStateSchema.optional(),
  resultData: z.unknown().optional(),
});

export type GameAction = z.infer<typeof GameActionSchema>;
export type ActionResult = z.infer<typeof ActionResultSchema>;
