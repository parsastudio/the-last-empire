import { GameState, SeededRandom } from "@geopolitics/domain";
import { TurnProgressionOrchestrator } from "@/engine/orchestrator/turn-progression.orchestrator";

export interface BenchmarkMetrics {
  totalTurnsSimulated: number;
  totalDurationMs: number;
  avgDurationPerTurnMs: number;
  maxTurnDurationMs: number;
  minTurnDurationMs: number;
  peakTurnNumber: number;
  initialAliveNations: number;
  finalAliveNations: number;
  isGameOver: boolean;
  winnerNationId?: string;
}

export class StressBenchmarkRunner {
  public static runTurnStressTest(
    initialState: GameState,
    turnsToSimulate = 50,
    seed = 123456,
  ): { finalState: GameState; metrics: BenchmarkMetrics } {
    const orchestrator = new TurnProgressionOrchestrator();
    const prng = new SeededRandom(seed);

    let currentState: GameState = {
      ...initialState,
      turnLogs: [],
      pendingProposals: [],
    };

    const initialAliveCount = Object.values(currentState.nations).filter(
      (n) => n.isAlive,
    ).length;

    let totalDuration = 0;
    let maxDuration = 0;
    let minDuration = Number.MAX_SAFE_INTEGER;
    let peakTurnNumber = currentState.currentTurn;
    let turnsRun = 0;

    for (let i = 0; i < turnsToSimulate; i++) {
      if (currentState.isGameOver) {
        break;
      }

      const start = performance.now();
      const { newState } = orchestrator.advanceTurnWithLogs(currentState, prng);
      const duration = performance.now() - start;

      totalDuration += duration;
      turnsRun++;

      if (duration > maxDuration) {
        maxDuration = duration;
        peakTurnNumber = newState.currentTurn;
      }
      if (duration < minDuration) {
        minDuration = duration;
      }

      currentState = newState;
    }

    const finalAliveCount = Object.values(currentState.nations).filter(
      (n) => n.isAlive,
    ).length;

    const metrics: BenchmarkMetrics = {
      totalTurnsSimulated: turnsRun,
      totalDurationMs: Number(totalDuration.toFixed(2)),
      avgDurationPerTurnMs:
        turnsRun > 0 ? Number((totalDuration / turnsRun).toFixed(2)) : 0,
      maxTurnDurationMs: Number(maxDuration.toFixed(2)),
      minTurnDurationMs:
        minDuration === Number.MAX_SAFE_INTEGER
          ? 0
          : Number(minDuration.toFixed(2)),
      peakTurnNumber,
      initialAliveNations: initialAliveCount,
      finalAliveNations: finalAliveCount,
      isGameOver: currentState.isGameOver,
      winnerNationId: currentState.winnerNationId,
    };

    return {
      finalState: currentState,
      metrics,
    };
  }
}
