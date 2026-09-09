import { z } from "zod";
import {
  NationSchema,
  NationTurnActivitySchema,
} from "@/domain/nation/nation.schema";
import { ProvinceSchema } from "@/domain/province/province.schema";
import { PendingDiplomaticProposalSchema } from "@/domain/diplomacy/diplomacy.schema";
import { DilemmaEventSchema } from "@/domain/events/dilemma.schema";
import { GameDifficultySchema } from "@/domain/game/difficulty.schema";

export const TurnLogLevelSchema = z.enum([
  "INFO",
  "WARNING",
  "CRITICAL",
  "COMBAT",
]);

export const TurnLogScopeSchema = z.enum(["NATIONAL", "GLOBAL"]);

export const TurnLogCategorySchema = z.enum([
  "DOMESTIC",
  "MILITARY",
  "DIPLOMACY",
  "ESPIONAGE",
  "GLOBAL_WAR",
  "GLOBAL_DIPLOMACY",
  "GLOBAL_ANNEXATION",
]);

export const TurnLogEventCodeSchema = z.enum([
  "WAR_DECLARED",
  "DIPLOMATIC_PROPOSAL_SENT",
  "TREATY_ACCEPTED",
  "TREATY_REJECTED",
  "TREATY_CANCELLED",
  "SECURITY_GUARANTEE_SIGNED",
  "SECURITY_GUARANTEE_CANCELLED",
  "DEFENSE_PACT_NEUTRALITY",
  "DEFENSE_PACT_REFUSAL_COMPENSATION",
  "EMERGENCY_PROTECTORATE_SIGNED",
  "EMERGENCY_PROTECTORATE_CANCELLED",
  "GUARANTOR_CASUALTY_COST_INCURRED",
  "FOREIGN_AID_SENT",
  "BATTLE_TACTICAL_REPORT",
  "BATTLE_GLOBAL_NEWS",
  "NATION_ANNEXED",
  "NATION_COLLAPSED",
  "NATION_BANKRUPTCY",
  "ESPIONAGE_OPERATION",
  "ARMS_TRADE",
  "ARMS_EXPORT_SUMMARY",
  "MACHINERY_EXPORT_SUMMARY",
  "COALITION_FORMED",
  "COALITION_MEMBER_FALLEN",
  "VICTORY_ACHIEVED",
  "DILEMMA_RESOLVED",
  "GENERIC_EVENT",
]);

export const TurnLogParamValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
]);

export const TurnLogEntrySchema = z.object({
  id: z.string(),
  turn: z.number().nonnegative(),
  timestamp: z.number().positive(),
  eventCode: TurnLogEventCodeSchema.default("GENERIC_EVENT"),
  sourceNationId: z.string(),
  targetNationId: z.string().optional(),
  scope: TurnLogScopeSchema.default("NATIONAL"),
  category: TurnLogCategorySchema.default("DOMESTIC"),
  level: TurnLogLevelSchema,
  message: z.string().default(""),
  params: z.record(z.string(), TurnLogParamValueSchema).default({}),
});

export const GlobalCoalitionSchema = z.object({
  targetNationId: z.string(),
  memberNationIds: z.array(z.string()),
  triggeredTurn: z.number().nonnegative(),
});

export const GameStateSchema = z.object({
  gameId: z.string(),
  currentTurn: z.number().nonnegative(),
  seed: z.number(),
  isGameOver: z.boolean(),
  isSandboxMode: z.boolean().default(false).optional(),
  difficulty: GameDifficultySchema.default("NORMAL"),
  winnerNationId: z.string().optional(),
  gameOverReason: z.string().optional(),
  humanNationId: z.string(),
  provinces: z.record(z.string(), ProvinceSchema).default({}),
  nations: z.record(z.string(), NationSchema),
  pendingProposals: z.array(PendingDiplomaticProposalSchema).default([]),
  turnLogs: z.array(TurnLogEntrySchema),
  turnActivity: z.record(z.string(), NationTurnActivitySchema).default({}),
  globalCoalition: GlobalCoalitionSchema.nullable().optional(),
  activeDilemma: DilemmaEventSchema.nullable().optional(),
  scheduledDilemmaTurn: z.number().int().positive().nullable().optional(),
});

export type TurnLogLevel = z.infer<typeof TurnLogLevelSchema>;
export type TurnLogScope = z.infer<typeof TurnLogScopeSchema>;
export type TurnLogCategory = z.infer<typeof TurnLogCategorySchema>;
export type TurnLogEventCode = z.infer<typeof TurnLogEventCodeSchema>;
export type TurnLogParamValue = z.infer<typeof TurnLogParamValueSchema>;
export type TurnLogEntry = z.infer<typeof TurnLogEntrySchema>;
export type GlobalCoalition = z.infer<typeof GlobalCoalitionSchema>;
export type GameState = z.infer<typeof GameStateSchema>;
