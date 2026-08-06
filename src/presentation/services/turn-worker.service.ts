import { GameState } from "@/domain/game/game-state.schema";
import { TurnProgressionOrchestrator } from "@/engine/orchestrator/turn-progression.orchestrator";
import { SeededRandom } from "@/domain/shared/domain-utilities";

export class TurnWorkerService {
  private static worker: Worker | null = null;
  private static fallbackOrchestrator = new TurnProgressionOrchestrator();

  private static getWorker(): Worker | null {
    if (typeof window === "undefined") return null;
    if (!this.worker && typeof Worker !== "undefined") {
      try {
        this.worker = new Worker(
          new URL(
            "@/presentation/workers/turn-processor.worker.ts",
            import.meta.url,
          ),
        );
      } catch {
        this.worker = null;
      }
    }
    return this.worker;
  }

  public static async processTurn(state: GameState): Promise<GameState> {
    const worker = this.getWorker();
    const seed = state.seed || Math.floor(Math.random() * 1000000);

    if (!worker) {
      const prng = new SeededRandom(seed);
      return this.fallbackOrchestrator.advanceTurn(state, prng);
    }

    return new Promise<GameState>((resolve) => {
      const handleMessage = (
        event: MessageEvent<{ success: boolean; nextState?: GameState }>,
      ) => {
        cleanup();
        if (event.data.success && event.data.nextState) {
          resolve(event.data.nextState);
        } else {
          const prng = new SeededRandom(seed);
          resolve(this.fallbackOrchestrator.advanceTurn(state, prng));
        }
      };

      const handleError = () => {
        cleanup();
        const prng = new SeededRandom(seed);
        resolve(this.fallbackOrchestrator.advanceTurn(state, prng));
      };

      const cleanup = () => {
        worker.removeEventListener("message", handleMessage);
        worker.removeEventListener("error", handleError);
      };

      worker.addEventListener("message", handleMessage);
      worker.addEventListener("error", handleError);

      worker.postMessage({ state, seed });
    });
  }
}
