import {
  TurnLogEntry,
  TurnLogScope,
  TurnLogFilterUtility,
} from "@geopolitics/domain";
import { db, SavedTurnLogRecord } from "@/infrastructure/storage/game-database";

export interface QueryTurnLogsOptions {
  gameId: string;
  turn?: number | "ALL";
  scope?: TurnLogScope;
  searchQuery?: string;
  page?: number;
  pageSize?: number;
  humanNationId?: string;
}

export interface PaginatedTurnLogsResult {
  logs: TurnLogEntry[];
  totalCount: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface TurnLogStatsSummary {
  combatCount: number;
  diplomacyCount: number;
  espionageCount: number;
  criticalCount: number;
}

export class TurnLogRepository {
  public static async appendLogs(
    gameId: string,
    logs: TurnLogEntry[],
  ): Promise<void> {
    if (!logs || logs.length === 0) return;

    const now = Date.now();
    const records: SavedTurnLogRecord[] = logs.map((log) => ({
      id: `${gameId}_${log.id}`,
      gameId,
      turn: log.turn,
      scope: log.scope || "NATIONAL",
      category: log.category || "DOMESTIC",
      timestamp: log.timestamp || now,
      log,
    }));

    await db.turnLogs.bulkPut(records);
  }

  public static async getAvailableTurns(gameId: string): Promise<number[]> {
    const records = await db.turnLogs.where("gameId").equals(gameId).toArray();

    const set = new Set<number>();
    for (const r of records) {
      set.add(r.turn);
    }

    return Array.from(set).sort((a, b) => b - a);
  }

  public static async getPaginatedLogs(
    options: QueryTurnLogsOptions,
  ): Promise<PaginatedTurnLogsResult> {
    const {
      gameId,
      turn = "ALL",
      scope = "NATIONAL",
      searchQuery = "",
      page = 1,
      pageSize = 50,
      humanNationId,
    } = options;

    const records = await db.turnLogs.where("gameId").equals(gameId).toArray();

    const rawLogs = records.map((r) => r.log);
    const filteredLogs = TurnLogFilterUtility.filterLogs(
      rawLogs,
      scope,
      humanNationId,
      turn,
      searchQuery,
    );

    filteredLogs.sort((a, b) => {
      if (b.turn !== a.turn) return b.turn - a.turn;
      return (b.timestamp || 0) - (a.timestamp || 0);
    });

    const totalCount = filteredLogs.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const startIndex = (page - 1) * pageSize;
    const pagedLogs = filteredLogs.slice(startIndex, startIndex + pageSize);

    return {
      logs: pagedLogs,
      totalCount,
      page,
      totalPages,
      hasNextPage: page < totalPages,
    };
  }

  public static async getStatsSummary(
    gameId: string,
    turn: number | "ALL" = "ALL",
    humanNationId?: string,
    scope: TurnLogScope = "NATIONAL",
  ): Promise<TurnLogStatsSummary> {
    const records = await db.turnLogs.where("gameId").equals(gameId).toArray();

    const filtered = records
      .map((r) => r.log)
      .filter((log) => {
        if (turn !== "ALL" && log.turn !== turn) {
          return false;
        }
        return TurnLogFilterUtility.matchesScope(log, scope, humanNationId);
      });

    let combatCount = 0;
    let diplomacyCount = 0;
    let espionageCount = 0;
    let criticalCount = 0;

    for (let i = 0; i < filtered.length; i++) {
      const log = filtered[i]!;
      if (
        log.category === "GLOBAL_WAR" ||
        log.category === "MILITARY" ||
        log.eventCode === "BATTLE_TACTICAL_REPORT" ||
        log.eventCode === "BATTLE_GLOBAL_NEWS" ||
        log.eventCode === "WAR_DECLARED"
      ) {
        combatCount++;
      }
      if (
        log.category === "DIPLOMACY" ||
        log.category === "GLOBAL_DIPLOMACY" ||
        log.eventCode === "TREATY_ACCEPTED" ||
        log.eventCode === "TREATY_REJECTED" ||
        log.eventCode === "DIPLOMATIC_PROPOSAL_SENT" ||
        log.eventCode === "DEFENSE_PACT_REFUSAL_COMPENSATION"
      ) {
        diplomacyCount++;
      }
      if (
        log.category === "ESPIONAGE" ||
        log.eventCode === "ESPIONAGE_OPERATION"
      ) {
        espionageCount++;
      }
      if (
        log.level === "CRITICAL" ||
        log.level === "COMBAT" ||
        log.eventCode === "NATION_ANNEXED" ||
        log.eventCode === "NATION_COLLAPSED" ||
        log.eventCode === "COALITION_FORMED"
      ) {
        criticalCount++;
      }
    }

    return {
      combatCount,
      diplomacyCount,
      espionageCount,
      criticalCount,
    };
  }

  public static async clearLogsForGame(gameId: string): Promise<void> {
    await db.turnLogs.where("gameId").equals(gameId).delete();
  }
}
