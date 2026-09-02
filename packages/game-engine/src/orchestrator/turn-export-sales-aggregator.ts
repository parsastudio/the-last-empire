import { GameState, TurnLogEntry } from "@/domain/game/game-state.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { TurnLogBuilder } from "@/domain/shared/domain-utilities";

export class TurnExportSalesAggregator {
  public static aggregate(state: GameState): GameState {
    const canonicalHuman = CountryRegistry.resolveCanonicalId(
      state.humanNationId,
    );
    const turn = state.currentTurn;

    const buyerSpendingMap = new Map<string, number>();
    const nonExportLogs: TurnLogEntry[] = [];

    for (let i = 0; i < state.turnLogs.length; i++) {
      const log = state.turnLogs[i]!;
      const isThisTurn = log.turn === turn;
      const isSellerTrade =
        log.eventCode === "ARMS_TRADE" &&
        log.params?.["role"] === "SELLER" &&
        log.params?.["tradeType"] !== "MACHINERY" &&
        CountryRegistry.resolveCanonicalId(log.sourceNationId) ===
          canonicalHuman;

      if (isThisTurn && isSellerTrade && log.targetNationId) {
        const buyerId = CountryRegistry.resolveCanonicalId(log.targetNationId);
        const amount = Number(log.params["amount"] || 0);
        const currentSum = buyerSpendingMap.get(buyerId) || 0;
        buyerSpendingMap.set(buyerId, currentSum + amount);
      } else {
        nonExportLogs.push(log);
      }
    }

    if (buyerSpendingMap.size === 0) {
      return {
        ...state,
        turnLogs: nonExportLogs,
      };
    }

    const buyersList = Array.from(buyerSpendingMap.entries())
      .map(([nationId, amount]) => ({
        nationId,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);

    const totalProfit = buyersList.reduce((sum, item) => sum + item.amount, 0);
    const buyersCount = buyersList.length;

    const summaryLog = TurnLogBuilder.createNationalLog(
      turn,
      state.humanNationId,
      "DOMESTIC",
      "INFO",
      "ARMS_EXPORT_SUMMARY",
      {
        totalProfit,
        buyersCount,
        buyersJson: JSON.stringify(buyersList),
      },
    );

    return {
      ...state,
      turnLogs: [...nonExportLogs, summaryLog],
    };
  }
}
