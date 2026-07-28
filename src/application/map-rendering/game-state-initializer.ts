import { GridState } from "@/engine/combat/state/grid-state";
import { StateSynchronizerFacade } from "@/engine/combat/state/state-synchronizer-facade";
import { GameState } from "@/domain/game/game-state.schema";
import { GridNationDetector } from "./grid-nation-detector";
import { GlobalAiInitializer } from "./global-ai-initializer";
import { findCountryProfileByCode } from "@/domain/map/countries";

export function normalizeNationId(rawId: string): string {
  if (rawId.startsWith("NATION_")) return rawId;
  const profile = findCountryProfileByCode(rawId);
  if (profile) return `NATION_${profile.id}`;
  return rawId;
}

export class GameStateInitializer {
  private detector = new GridNationDetector();
  private aiInitializer = new GlobalAiInitializer();
  private synchronizer = new StateSynchronizerFacade();

  public initializeSimulationForNation(
    nationId: string,
    gridState: GridState,
  ): GameState {
    const normalizedHumanId = normalizeNationId(nationId);
    const cells = gridState.getAllCells();
    const detectedNations = this.detector.detectUniqueNations(cells);

    if (!detectedNations.includes(normalizedHumanId)) {
      detectedNations.push(normalizedHumanId);
    }

    const populatedNations = this.aiInitializer.initializeAllNations(
      detectedNations,
      normalizedHumanId,
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
      provinces: {},
      turnLogs: [],
      eventFlags: {},
    };

    return this.synchronizer.synchronizeAll(baseState, gridState);
  }
}
