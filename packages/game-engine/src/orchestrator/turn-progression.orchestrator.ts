import { GameState } from "@/domain/game/game-state.schema";
import { TurnPipeline } from "@/engine/turn-pipeline";
import { NationLivenessManager } from "@/engine/politics/nation-liveness-manager";
import { VictoryChecker } from "@/engine/politics/victory-checker";
import { SeededRandom } from "@/domain/shared/domain-utilities";
import { ActionEngine } from "@/engine/actions/action-engine";
import { AIActionBuilder } from "@/engine/ai/ai-action-builder";
import { GeopoliticalMatrixCache } from "@/engine/ai/geopolitical-matrix-cache";

export class TurnProgressionOrchestrator {
  private pipeline = new TurnPipeline();
  private livenessManager = new NationLivenessManager();
  private victoryChecker = new VictoryChecker();

  public advanceTurn(state: GameState, prng: SeededRandom): GameState {
    const orchStart = performance.now();
    const lockedDiplomacyTargets = new Set<string>();
    const sortedNationIds = Object.keys(state.nations).sort();

    let workingState: GameState = {
      ...state,
      provinces: { ...state.provinces },
      nations: { ...state.nations },
      turnLogs: [...state.turnLogs],
      pendingProposals: [...state.pendingProposals],
    };

    console.group(
      `[ORCHESTRATOR] ارکستراسیون پیشروی نوبت ${state.currentTurn} ➔ ${state.currentTurn + 1}`,
    );

    const initIndexStart = performance.now();
    const matrixCache = GeopoliticalMatrixCache.build(
      workingState.nations,
      workingState.provinces,
    );
    const provincesByOwnerMap = matrixCache.getProvincesByOwnerMap();
    const rankMap = matrixCache.getRankMap();
    const initIndexDuration = (performance.now() - initIndexStart).toFixed(2);
    console.log(
      `[ORCH_STEP] ۱. ایندکس‌گذاری ماتریس ژئوپلیتیک تک‌پاس (${provincesByOwnerMap.size} کشور): ${initIndexDuration}ms`,
    );

    const aiPlanStart = performance.now();
    let totalExecutedActions = 0;

    for (let i = 0; i < sortedNationIds.length; i++) {
      const id = sortedNationIds[i]!;
      const currentNation = workingState.nations[id];

      if (!currentNation || !currentNation.isAlive || !currentNation.isAi) {
        continue;
      }

      const aiActions = AIActionBuilder.buildNationActions(
        currentNation,
        workingState.nations,
        workingState.provinces,
        lockedDiplomacyTargets,
        rankMap,
        provincesByOwnerMap,
        matrixCache,
      );

      if (aiActions.length > 0) {
        const { newState: executedState, executedCount } =
          ActionEngine.executeBatch(
            workingState,
            aiActions,
            lockedDiplomacyTargets,
          );
        workingState = executedState;
        totalExecutedActions += executedCount;
      }
    }

    const aiPlanDuration = (performance.now() - aiPlanStart).toFixed(2);
    console.log(
      `[ORCH_STEP] ۲ و ۳. برنامه‌ریزی و اجرای اتمیک متوالی هوش مصنوعی (${totalExecutedActions} اکشن موفق): ${aiPlanDuration}ms`,
    );

    const pipelineStart = performance.now();
    workingState = this.pipeline.processTurn(
      workingState,
      rankMap,
      provincesByOwnerMap,
      matrixCache,
    );
    const pipelineDuration = (performance.now() - pipelineStart).toFixed(2);
    console.log(
      `[ORCH_STEP] ۴. اجرای خط لوله نوبتی (TurnPipeline): ${pipelineDuration}ms`,
    );

    const livenessStart = performance.now();
    workingState = this.livenessManager.updateLiveness(workingState);
    const livenessDuration = (performance.now() - livenessStart).toFixed(2);
    console.log(
      `[ORCH_STEP] ۵. بررسی وضعیت بقا و سقوط کشورها (Liveness): ${livenessDuration}ms`,
    );

    const victoryStart = performance.now();
    const victoryStatus = this.victoryChecker.checkVictory(workingState);
    const victoryDuration = (performance.now() - victoryStart).toFixed(2);
    console.log(
      `[ORCH_STEP] ۶. ارزیابی شروط پیروزی جهانی (VictoryChecker): ${victoryDuration}ms`,
    );

    if (victoryStatus.isGameOver) {
      workingState = {
        ...workingState,
        isGameOver: true,
        winnerNationId: victoryStatus.winnerNationId,
        gameOverReason: victoryStatus.reason,
      };
    }

    const orchTotalDuration = (performance.now() - orchStart).toFixed(2);
    console.log(`[ORCH_TOTAL] مجموع کل ارکستراسیون: ${orchTotalDuration}ms`);
    console.groupEnd();

    return {
      ...workingState,
      currentTurn: workingState.currentTurn + 1,
      seed: prng.getSeed(),
    };
  }
}
