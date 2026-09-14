import { GameState, TurnLogEntry } from "@/domain/game/game-state.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { TurnLogBuilder } from "@/domain/shared/domain-utilities";
import {
  ExportSalesBuyerItem,
  GameStateMetricsUtility,
} from "@geopolitics/domain";

export interface ExportAggregationResult {
  state: GameState;
  generatedSummaryLogs: TurnLogEntry[];
}

export class TurnExportSalesAggregator {
  private static buildSummaryLog(
    spendingMap: Map<string, number>,
    turn: number,
    humanNationId: string,
    eventCode: "ARMS_EXPORT_SUMMARY" | "MACHINERY_EXPORT_SUMMARY",
  ): TurnLogEntry | null {
    if (spendingMap.size === 0) return null;

    const buyersList: ExportSalesBuyerItem[] = Array.from(spendingMap.entries())
      .map(([nationId, amount]) => ({ nationId, amount }))
      .sort((a, b) => b.amount - a.amount);

    const totalProfit = buyersList.reduce((sum, item) => sum + item.amount, 0);

    return TurnLogBuilder.createNationalLog(
      turn,
      humanNationId,
      "DOMESTIC",
      "INFO",
      eventCode,
      {
        totalProfit,
        buyersCount: buyersList.length,
        buyersJson: JSON.stringify(buyersList),
      },
    );
  }

  public static aggregate(
    state: GameState,
    candidateLogs?: TurnLogEntry[],
  ): ExportAggregationResult {
    const turn = state.currentTurn;
    const sourceLogs = candidateLogs ?? state.turnLogs;
    const armsBuyerSpendingMap = new Map<string, number>();
    const machineryBuyerSpendingMap = new Map<string, number>();
    const nonExportLogs: TurnLogEntry[] = [];

    for (let i = 0; i < sourceLogs.length; i++) {
      const log = sourceLogs[i]!;
      const isThisTurn = log.turn === turn;
      const isSellerTrade =
        log.eventCode === "ARMS_TRADE" &&
        log.params?.["role"] === "SELLER" &&
        GameStateMetricsUtility.isHumanNation(
          state.humanNationId,
          log.sourceNationId,
        );

      if (isThisTurn && isSellerTrade && log.targetNationId) {
        const buyerId = CountryRegistry.resolveCanonicalId(log.targetNationId);
        const amount = Number(log.params["amount"] || 0);
        const tradeType = String(log.params["tradeType"] || "ARMS");

        const targetMap =
          tradeType === "MACHINERY"
            ? machineryBuyerSpendingMap
            : armsBuyerSpendingMap;

        const currentSum = targetMap.get(buyerId) || 0;
        targetMap.set(buyerId, currentSum + amount);
      } else {
        nonExportLogs.push(log);
      }
    }

    const summaryLogs: TurnLogEntry[] = [];

    const armsLog = this.buildSummaryLog(
      armsBuyerSpendingMap,
      turn,
      state.humanNationId,
      "ARMS_EXPORT_SUMMARY",
    );
    if (armsLog) summaryLogs.push(armsLog);

    const machineryLog = this.buildSummaryLog(
      machineryBuyerSpendingMap,
      turn,
      state.humanNationId,
      "MACHINERY_EXPORT_SUMMARY",
    );
    if (machineryLog) summaryLogs.push(machineryLog);

    return {
      state: {
        ...state,
        turnLogs: [...nonExportLogs, ...summaryLogs],
      },
      generatedSummaryLogs: summaryLogs,
    };
  }
}
