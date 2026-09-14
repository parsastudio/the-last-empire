import {
  TurnLogEntry,
  TurnLogScope,
  CountryRegistry,
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
  private static getFilteredCollection(
    gameId: string,
    turn: number | "ALL" = "ALL",
    scope?: TurnLogScope,
  ) {
    if (scope && turn !== "ALL") {
      return db.turnLogs
        .where("[gameId+scope+turn]")
        .equals([gameId, scope, turn]);
    }
    if (turn !== "ALL") {
      return db.turnLogs.where("[gameId+turn]").equals([gameId, turn]);
    }
    if (scope) {
      return db.turnLogs.where("[gameId+scope]").equals([gameId, scope]);
    }
    return db.turnLogs.where("gameId").equals(gameId);
  }

  private static filterRecordsByScopeAndNational(
    records: SavedTurnLogRecord[],
    scope?: TurnLogScope,
    humanNationId?: string,
  ): SavedTurnLogRecord[] {
    const withoutDilemmas = records.filter(
      (r) => r.log.eventCode !== "DILEMMA_RESOLVED",
    );

    if (scope === "NATIONAL" && humanNationId) {
      const canonicalHuman = CountryRegistry.resolveCanonicalId(humanNationId);
      return withoutDilemmas.filter((r) => {
        const src = CountryRegistry.resolveCanonicalId(r.log.sourceNationId);
        const trg = r.log.targetNationId
          ? CountryRegistry.resolveCanonicalId(r.log.targetNationId)
          : null;
        return src === canonicalHuman || trg === canonicalHuman;
      });
    }

    return withoutDilemmas;
  }

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
      humanNationId,
    } = options;

    const collection = this.getFilteredCollection(gameId, turn, scope);
    let records = await collection.sortBy("timestamp");
    records = records.reverse();

    records = this.filterRecordsByScopeAndNational(
      records,
      scope,
      humanNationId,
    );

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      records = records.filter((r) => {
        const event = r.log.eventCode?.toLowerCase() || "";
        const source = r.log.sourceNationId?.toLowerCase() || "";
        const target = r.log.targetNationId?.toLowerCase() || "";
        const msg = r.log.message?.toLowerCase() || "";
        const paramMatches = Object.values(r.log.params || {}).some((v) =>
          String(v).toLowerCase().includes(q),
        );
        return (
          event.includes(q) ||
          source.includes(q) ||
          target.includes(q) ||
          msg.includes(q) ||
          paramMatches
        );
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
    humanNationId?: string,
    scope: TurnLogScope = "NATIONAL",
  ): Promise<TurnLogStatsSummary> {
    const collection = this.getFilteredCollection(gameId, turn, scope);
    let records = await collection.toArray();

    records = this.filterRecordsByScopeAndNational(
      records,
      scope,
      humanNationId,
    );

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
