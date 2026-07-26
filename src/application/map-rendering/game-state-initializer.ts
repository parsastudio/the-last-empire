import { GridState } from "@/engine/combat/state/grid-state";
import { StateSynchronizerFacade } from "@/engine/combat/state/state-synchronizer-facade";
import { GameState } from "@/domain/game/game-state.schema";
import { GridNationDetector } from "./grid-nation-detector";
import { GlobalAiInitializer } from "./global-ai-initializer";

export class GameStateInitializer {
  private detector = new GridNationDetector();
  private aiInitializer = new GlobalAiInitializer();
  private synchronizer = new StateSynchronizerFacade();

  public initializeSimulationForNation(
    nationId: string,
    gridState: GridState,
  ): GameState {
    const cells = gridState.getAllCells();
    const detectedNations = this.detector.detectUniqueNations(cells);

    if (!detectedNations.includes(nationId)) {
      detectedNations.push(nationId);
    }

    const populatedNations = this.aiInitializer.initializeAllNations(
      detectedNations,
      nationId,
    );

    const baseState: GameState = {
      gameId: `test6_game_${Date.now()}`,
      currentTurn: 1,
      seed: 554422,
      isGameOver: false,
      humanNationId: nationId,
      globalThreatLevel: 0,
      marketPrices: { oil: 100, steel: 100 },
      nations: populatedNations,
      provinces: {},
      turnLogs: [],
      eventFlags: {},
    };

    return this.synchronizer.synchronizeAll(baseState, gridState);
  }
}
