import { GameState, TurnLogEntry } from "@/domain/game/game-state.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { TurnLogBuilder } from "@/domain/shared/domain-utilities";

export interface ExportAggregationResult {
  state: GameState;
  generatedSummaryLogs: TurnLogEntry[];
}

export class TurnExportSalesAggregator {
  public static aggregate(
    state: GameState,
    candidateLogs?: TurnLogEntry[],
  ): ExportAggregationResult {
    const canonicalHuman = CountryRegistry.resolveCanonicalId(
      state.humanNationId,
    );
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
        CountryRegistry.resolveCanonicalId(log.sourceNationId) ===
          canonicalHuman;

      if (isThisTurn && isSellerTrade && log.targetNationId) {
        const buyerId = CountryRegistry.resolveCanonicalId(log.targetNationId);
        const amount = Number(log.params["amount"] || 0);
        const tradeType = String(log.params["tradeType"] || "ARMS");

        if (tradeType === "MACHINERY") {
          const currentSum = machineryBuyerSpendingMap.get(buyerId) || 0;
          machineryBuyerSpendingMap.set(buyerId, currentSum + amount);
        } else {
          const currentSum = armsBuyerSpendingMap.get(buyerId) || 0;
          armsBuyerSpendingMap.set(buyerId, currentSum + amount);
        }
      } else {
        nonExportLogs.push(log);
      }
    }

    const summaryLogs: TurnLogEntry[] = [];

    if (armsBuyerSpendingMap.size > 0) {
      const buyersList = Array.from(armsBuyerSpendingMap.entries())
        .map(([nationId, amount]) => ({ nationId, amount }))
        .sort((a, b) => b.amount - a.amount);

      const totalProfit = buyersList.reduce(
        (sum, item) => sum + item.amount,
        0,
      );

      summaryLogs.push(
        TurnLogBuilder.createNationalLog(
          turn,
          state.humanNationId,
          "DOMESTIC",
          "INFO",
          "ARMS_EXPORT_SUMMARY",
          {
            totalProfit,
            buyersCount: buyersList.length,
            buyersJson: JSON.stringify(buyersList),
          },
        ),
      );
    }

    if (machineryBuyerSpendingMap.size > 0) {
      const buyersList = Array.from(machineryBuyerSpendingMap.entries())
        .map(([nationId, amount]) => ({ nationId, amount }))
        .sort((a, b) => b.amount - a.amount);

      const totalProfit = buyersList.reduce(
        (sum, item) => sum + item.amount,
        0,
      );

      summaryLogs.push(
        TurnLogBuilder.createNationalLog(
          turn,
          state.humanNationId,
          "DOMESTIC",
          "INFO",
          "MACHINERY_EXPORT_SUMMARY",
          {
            totalProfit,
            buyersCount: buyersList.length,
            buyersJson: JSON.stringify(buyersList),
          },
        ),
      );
    }

    return {
      state: {
        ...state,
        turnLogs: [...nonExportLogs, ...summaryLogs],
      },
      generatedSummaryLogs: summaryLogs,
    };
  }
}
