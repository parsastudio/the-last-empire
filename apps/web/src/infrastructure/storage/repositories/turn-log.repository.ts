import { TurnLogEntry, TurnLogScope } from "@geopolitics/domain";
import { db, SavedTurnLogRecord } from "@/infrastructure/storage/game-database";

export interface QueryTurnLogsOptions {
  gameId: string;
  turn?: number | "ALL";
  scope?: TurnLogScope;
  searchQuery?: string;
  page?: number;
  pageSize?: number;
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
      pageSize = 25,
    } = options;

    let collection = db.turnLogs.where("gameId").equals(gameId);

    if (scope && turn !== "ALL") {
      collection = db.turnLogs
        .where("[gameId+scope+turn]")
        .equals([gameId, scope, turn]);
    } else if (turn !== "ALL") {
      collection = db.turnLogs.where("[gameId+turn]").equals([gameId, turn]);
    } else if (scope) {
      collection = db.turnLogs.where("[gameId+scope]").equals([gameId, scope]);
    }

    let records = await collection.sortBy("timestamp");
    records = records.reverse();

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      records = records.filter((r) => {
        const msg = r.log.message || "";
        const event = r.log.eventCode || "";
        return msg.toLowerCase().includes(q) || event.toLowerCase().includes(q);
      });
    }

    const totalCount = records.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const startIndex = (page - 1) * pageSize;
    const pagedRecords = records.slice(startIndex, startIndex + pageSize);

    return {
      logs: pagedRecords.map((r) => r.log),
      totalCount,
      page,
      totalPages,
      hasNextPage: page < totalPages,
    };
  }

  public static async getStatsSummary(
    gameId: string,
    turn: number | "ALL" = "ALL",
  ): Promise<TurnLogStatsSummary> {
    let records: SavedTurnLogRecord[];

    if (turn !== "ALL") {
      records = await db.turnLogs
        .where("[gameId+turn]")
        .equals([gameId, turn])
        .toArray();
    } else {
      records = await db.turnLogs.where("gameId").equals(gameId).toArray();
    }

    let combatCount = 0;
    let diplomacyCount = 0;
    let espionageCount = 0;
    let criticalCount = 0;

    for (let i = 0; i < records.length; i++) {
      const log = records[i]!.log;
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
