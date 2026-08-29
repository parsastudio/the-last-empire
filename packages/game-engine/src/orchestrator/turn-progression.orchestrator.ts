import { GameState, TurnLogEntry } from "@/domain/game/game-state.schema";
import { TurnPipeline } from "@/engine/turn-pipeline";
import { NationLivenessManager } from "@/engine/politics/nation-liveness-manager";
import { VictoryChecker } from "@/engine/politics/victory-checker";
import { SeededRandom, TurnLogBuilder } from "@/domain/shared/domain-utilities";
import { ActionEngine } from "@/engine/actions/action-engine";
import { AIActionBuilder } from "@/engine/ai/ai-action-builder";
import { GeopoliticalMatrixCache } from "@/engine/ai/geopolitical-matrix-cache";
import { CoalitionManager } from "@/engine/politics/coalition-manager";
import { TurnStateLogger } from "@/engine/diagnostics/turn-state-logger";
import { AiWarResolutionSweep } from "@/engine/ai/ai-war-resolution-sweep";
import { CountryRegistry } from "@/domain/data/countries";

export class TurnProgressionOrchestrator {
  private pipeline = new TurnPipeline();
  private livenessManager = new NationLivenessManager();
  private victoryChecker = new VictoryChecker();

  public advanceTurn(state: GameState, prng: SeededRandom): GameState {
    const lockedDiplomacyTargets = new Set<string>();
    const nextTurn = state.currentTurn + 1;

    let workingState: GameState = {
      ...state,
      currentTurn: nextTurn,
      provinces: { ...state.provinces },
      nations: { ...state.nations },
      turnLogs: [...state.turnLogs],
      pendingProposals: [...state.pendingProposals],
    };

    let activeMatrixCache = GeopoliticalMatrixCache.build(
      workingState.nations,
      workingState.provinces,
    );

    workingState = this.pipeline.processTurn(
      workingState,
      activeMatrixCache.getRankMap(),
      activeMatrixCache.getProvincesByOwnerMap(),
      activeMatrixCache,
    );

    workingState = this.livenessManager.updateLiveness(workingState);

    activeMatrixCache = GeopoliticalMatrixCache.build(
      workingState.nations,
      workingState.provinces,
    );

    workingState = CoalitionManager.evaluateCoalitionState(
      workingState,
      activeMatrixCache.getRankMap(),
      activeMatrixCache.getProvincesByOwnerMap(),
    );

    const shuffledNationIds = Object.keys(workingState.nations);
    for (let i = shuffledNationIds.length - 1; i > 0; i--) {
      const j = Math.floor(prng.nextFloat() * (i + 1));
      const temp = shuffledNationIds[i]!;
      shuffledNationIds[i] = shuffledNationIds[j]!;
      shuffledNationIds[j] = temp;
    }

    for (let i = 0; i < shuffledNationIds.length; i++) {
      const id = shuffledNationIds[i]!;
      const currentNation = workingState.nations[id];

      if (!currentNation || !currentNation.isAlive || !currentNation.isAi) {
        continue;
      }

      const aiActions = AIActionBuilder.buildNationActions(
        currentNation,
        workingState.nations,
        workingState.provinces,
        lockedDiplomacyTargets,
        activeMatrixCache,
        workingState.globalCoalition,
      );

      if (aiActions.length > 0) {
        const { newState: executedState, executedCount } =
          ActionEngine.executeBatch(
            workingState,
            aiActions,
            lockedDiplomacyTargets,
          );

        if (executedCount > 0) {
          workingState = executedState;
          const hasStructuralChange = aiActions.some(
            (action) =>
              action.type === "INITIATE_BATTLE" ||
              action.type === "EXECUTE_ESPIONAGE_OPERATION",
          );

          if (hasStructuralChange) {
            activeMatrixCache = GeopoliticalMatrixCache.build(
              workingState.nations,
              workingState.provinces,
            );
          }
        }
      }
    }

    workingState = this.aggregateExportSales(workingState);
    workingState = AiWarResolutionSweep.resolveAiWars(workingState);
    workingState = this.livenessManager.updateLiveness(workingState);

    const victoryStatus = this.victoryChecker.checkVictory(workingState);

    if (victoryStatus.isGameOver && !workingState.isGameOver) {
      let winnerId = victoryStatus.winnerNationId;
      if (!winnerId && victoryStatus.reason !== "HUMAN_PLAYER_DEFEATED") {
        winnerId = workingState.humanNationId;
      }

      const victoryLog = TurnLogBuilder.createVictoryLog(
        workingState.currentTurn,
        winnerId || workingState.humanNationId,
        victoryStatus.reason || "WORLD_DOMINANCE",
      );

      workingState = {
        ...workingState,
        isGameOver: true,
        winnerNationId: winnerId,
        gameOverReason: victoryStatus.reason,
        turnLogs: [...workingState.turnLogs, victoryLog],
      };
    }

    const cappedLogs = workingState.turnLogs.slice(-300);

    const finalState: GameState = {
      ...workingState,
      turnLogs: cappedLogs,
      seed: prng.getSeed(),
    };

    TurnStateLogger.logTurnState(finalState);

    return finalState;
  }

  private aggregateExportSales(state: GameState): GameState {
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
