import { TurnProgressionOrchestrator } from "@/engine/orchestrator/turn-progression.orchestrator";
import { GameState } from "@/domain/game/game-state.schema";
import { SeededRandom } from "@/domain/shared/domain-utilities";

const orchestrator = new TurnProgressionOrchestrator();

self.onmessage = (event: MessageEvent<{ state: GameState; seed: number }>) => {
  const { state, seed } = event.data;
  const prng = new SeededRandom(seed);
  const nextState = orchestrator.advanceTurn(state, prng);
  self.postMessage({ success: true, nextState });
};
