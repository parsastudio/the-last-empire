import { GridState } from "@/engine/combat/state/grid-state";
import { StateSynchronizerFacade } from "@/engine/combat/state/state-synchronizer-facade";
import { GameState } from "@/domain/game/game-state.schema";
import { GridNationDetector } from "./grid-nation-detector";
import { GlobalAiInitializer } from "./global-ai-initializer";
import { ManifestFileLoader } from "./manifest-file-loader";
import { NationIdResolver } from "@/domain/shared/nation-id-resolver";

export function normalizeNationId(nationId: string): string {
  return NationIdResolver.resolveCanonicalId(nationId);
}

export class GameStateInitializer {
  private detector = new GridNationDetector();
  private aiInitializer = new GlobalAiInitializer();
  private synchronizer = new StateSynchronizerFacade();
  private manifestLoader = new ManifestFileLoader();

  public initializeSimulationForNation(
    nationId: string,
    gridState: GridState,
    governmentType?: string,
  ): GameState {
    const normalizedHumanId = NationIdResolver.resolveCanonicalId(nationId);
    const cells = gridState.getAllCells();
    const detectedNations = this.detector.detectUniqueNations(cells);

    const manifest = this.manifestLoader.loadManifest("map1");

    if (!detectedNations.includes(normalizedHumanId)) {
      detectedNations.push(normalizedHumanId);
    }

    const populatedNations = this.aiInitializer.initializeAllNations(
      detectedNations,
      normalizedHumanId,
      governmentType,
      manifest,
    );

    const baseState: GameState = {
      gameId: `game_${normalizedHumanId}_${Date.now()}`,
      currentTurn: 1,
      seed: 554422,
      isGameOver: false,
      humanNationId: normalizedHumanId,
      globalThreatLevel: 0,
      marketPrices: { oil: 100, steel: 100 },
      nations: populatedNations,
      turnLogs: [],
      eventFlags: {},
    };

    return this.synchronizer.synchronizeAll(baseState, gridState);
  }
}
