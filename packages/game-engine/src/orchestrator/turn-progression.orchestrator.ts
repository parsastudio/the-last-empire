import { GameState } from "@/domain/game/game-state.schema";
import { TurnPipeline } from "@/engine/turn-pipeline";
import { NationLivenessManager } from "@/engine/politics/nation-liveness-manager";
import { VictoryChecker } from "@/engine/politics/victory-checker";
import { SeededRandom } from "@/domain/shared/domain-utilities";
import { ActionEngine } from "@/engine/actions/action-engine";
import { AIActionBuilder } from "@/engine/ai/ai-action-builder";
import { DiplomacyLockManager } from "@/domain/diplomacy/nation-relation-resolver.utility";
import { NationGettersUtility } from "@geopolitics/domain";

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

    const rankStart = performance.now();
    const rankMap = NationGettersUtility.calculateRankMap(
      nextState.nations,
      nextState.provinces,
    );
    const rankDuration = (performance.now() - rankStart).toFixed(2);
    console.log(
      `[ORCH_STEP] ۱. محاسبه رتبه جهانی (RankMap): ${rankDuration}ms`,
    );

    const aiPlanStart = performance.now();
    let totalActionsGenerated = 0;
    const pendingAiActions: {
      nationId: string;
      actions: ReturnType<typeof AIActionBuilder.buildNationActions>;
    }[] = [];

    for (const id of sortedNationIds) {
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
      );

      totalActionsGenerated += aiActions.length;
      pendingAiActions.push({ nationId: id, actions: aiActions });
    }
    const aiPlanDuration = (performance.now() - aiPlanStart).toFixed(2);
    console.log(
      `[ORCH_STEP] ۲. برنامه‌ریزی هوش مصنوعی برای تمام کشورها (${totalActionsGenerated} اکشن): ${aiPlanDuration}ms`,
    );

    const aiExecStart = performance.now();
    let executedCount = 0;

    for (const item of pendingAiActions) {
      for (const action of item.actions) {
        const result = ActionEngine.execute(nextState, action);

        if (result.success && result.newState) {
          nextState = result.newState;
          executedCount++;

          if (
            action.type === "DIPLOMATIC_PROPOSAL" &&
            "targetNationId" in action &&
            action.targetNationId
          ) {
            lockedDiplomacyTargets.add(
              DiplomacyLockManager.createKey(
                action.nationId,
                action.targetNationId,
              ),
            );
            lockedDiplomacyTargets.add(
              DiplomacyLockManager.createKey(
                action.targetNationId,
                action.nationId,
              ),
            );
          }
        }
      }
    }
    const aiExecDuration = (performance.now() - aiExecStart).toFixed(2);
    console.log(
      `[ORCH_STEP] ۳. اجرای اکشن‌های هوش مصنوعی (${executedCount} اکشن موفق): ${aiExecDuration}ms`,
    );

    const pipelineStart = performance.now();
    nextState = this.pipeline.processTurn(nextState, rankMap);
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
