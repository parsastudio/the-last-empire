import { GameState } from "@/domain/game/game-state.schema";
import { TurnPipeline } from "@/engine/turn-pipeline";
import { NationLivenessManager } from "@/engine/politics/nation-liveness-manager";
import { VictoryChecker } from "@/engine/politics/victory-checker";
import { SeededRandom } from "@/domain/shared/domain-utilities";
import { ActionEngine } from "@/engine/actions/action-engine";
import { AIActionBuilder } from "@/engine/ai/ai-action-builder";
import { GeopoliticalMatrixCache } from "@/engine/ai/geopolitical-matrix-cache";
import { CoalitionManager } from "@/engine/politics/coalition-manager";

export class TurnProgressionOrchestrator {
  private pipeline = new TurnPipeline();
  private livenessManager = new NationLivenessManager();
  private victoryChecker = new VictoryChecker();

  public advanceTurn(state: GameState, prng: SeededRandom): GameState {
    const lockedDiplomacyTargets = new Set<string>();

    let workingState: GameState = {
      ...state,
      provinces: { ...state.provinces },
      nations: { ...state.nations },
      turnLogs: [...state.turnLogs],
      pendingProposals: [...state.pendingProposals],
    };

    let activeMatrixCache = GeopoliticalMatrixCache.build(
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

    const victoryStatus = this.victoryChecker.checkVictory(workingState);

    if (victoryStatus.isGameOver) {
      workingState = {
        ...workingState,
        isGameOver: true,
        winnerNationId: victoryStatus.winnerNationId,
        gameOverReason: victoryStatus.reason,
      };
    }

    const cappedLogs = workingState.turnLogs.slice(-300);

    return {
      ...workingState,
      turnLogs: cappedLogs,
      currentTurn: workingState.currentTurn + 1,
      seed: prng.getSeed(),
    };
  }
}
