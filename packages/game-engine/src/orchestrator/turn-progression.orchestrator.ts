import { GameState } from "@/domain/game/game-state.schema";
import { TurnPipeline } from "@/engine/turn-pipeline";
import { NationLivenessManager } from "@/engine/politics/nation-liveness-manager";
import { VictoryChecker } from "@/engine/politics/victory-checker";
import { SeededRandom } from "@/domain/shared/domain-utilities";
import { ActionEngine } from "@/engine/actions/action-engine";
import { AIActionBuilder } from "@/engine/ai/ai-action-builder";
import { GameAction, NationGettersUtility } from "@geopolitics/domain";

export class TurnProgressionOrchestrator {
  private pipeline = new TurnPipeline();
  private livenessManager = new NationLivenessManager();
  private victoryChecker = new VictoryChecker();

  public advanceTurn(state: GameState, prng: SeededRandom): GameState {
    const orchStart = performance.now();
    let nextState = state;
    const lockedDiplomacyTargets = new Set<string>();
    const sortedNationIds = Object.keys(nextState.nations).sort();

    console.group(
      `[ORCHESTRATOR] ارکستراسیون پیشروی نوبت ${state.currentTurn} ➔ ${state.currentTurn + 1}`,
    );

    const initIndexStart = performance.now();
    const provincesByOwnerMap = NationGettersUtility.buildProvincesByOwnerMap(
      nextState.provinces,
    );
    const rankMap = NationGettersUtility.calculateRankMap(
      nextState.nations,
      nextState.provinces,
      provincesByOwnerMap,
    );
    const initIndexDuration = (performance.now() - initIndexStart).toFixed(2);
    console.log(
      `[ORCH_STEP] ۱. ایندکس‌گذاری مستقیم استان‌ها و رتبه (${provincesByOwnerMap.size} کشور): ${initIndexDuration}ms`,
    );

    const aiPlanStart = performance.now();
    const allAiActions: GameAction[] = [];

    for (let i = 0; i < sortedNationIds.length; i++) {
      const id = sortedNationIds[i]!;
      const nation = nextState.nations[id];
      if (!nation || !nation.isAlive || !nation.isAi) {
        continue;
      }

      const aiActions = AIActionBuilder.buildNationActions(
        nation,
        nextState.nations,
        nextState.provinces,
        lockedDiplomacyTargets,
        rankMap,
        provincesByOwnerMap,
      );

      for (let j = 0; j < aiActions.length; j++) {
        allAiActions.push(aiActions[j]!);
      }
    }
    const aiPlanDuration = (performance.now() - aiPlanStart).toFixed(2);
    console.log(
      `[ORCH_STEP] ۲. برنامه‌ریزی هوش مصنوعی برای تمام کشورها (${allAiActions.length} اکشن): ${aiPlanDuration}ms`,
    );

    const aiExecStart = performance.now();
    const { newState: batchedState, executedCount } = ActionEngine.executeBatch(
      nextState,
      allAiActions,
      lockedDiplomacyTargets,
    );
    nextState = batchedState;
    const aiExecDuration = (performance.now() - aiExecStart).toFixed(2);
    console.log(
      `[ORCH_STEP] ۳. اجرای دسته‌ای اکشن‌های هوش مصنوعی (${executedCount} اکشن موفق): ${aiExecDuration}ms`,
    );

    const pipelineStart = performance.now();
    nextState = this.pipeline.processTurn(
      nextState,
      rankMap,
      provincesByOwnerMap,
    );
    const pipelineDuration = (performance.now() - pipelineStart).toFixed(2);
    console.log(
      `[ORCH_STEP] ۴. اجرای خط لوله نوبتی (TurnPipeline): ${pipelineDuration}ms`,
    );

    const livenessStart = performance.now();
    nextState = this.livenessManager.updateLiveness(nextState);
    const livenessDuration = (performance.now() - livenessStart).toFixed(2);
    console.log(
      `[ORCH_STEP] ۵. بررسی وضعیت بقا و سقوط کشورها (Liveness): ${livenessDuration}ms`,
    );

    const victoryStart = performance.now();
    const victoryStatus = this.victoryChecker.checkVictory(nextState);
    const victoryDuration = (performance.now() - victoryStart).toFixed(2);
    console.log(
      `[ORCH_STEP] ۶. ارزیابی شروط پیروزی جهانی (VictoryChecker): ${victoryDuration}ms`,
    );

    if (victoryStatus.isGameOver) {
      nextState = {
        ...nextState,
        isGameOver: true,
        winnerNationId: victoryStatus.winnerNationId,
        gameOverReason: victoryStatus.reason,
      };
    }

    const orchTotalDuration = (performance.now() - orchStart).toFixed(2);
    console.log(`[ORCH_TOTAL] مجموع کل ارکستراسیون: ${orchTotalDuration}ms`);
    console.groupEnd();

    return {
      ...nextState,
      currentTurn: nextState.currentTurn + 1,
      seed: prng.getSeed(),
    };
  }
}
