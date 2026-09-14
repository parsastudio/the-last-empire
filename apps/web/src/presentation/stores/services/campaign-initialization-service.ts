import {
  GameState,
  CountryRegistry,
  FinalMapManifest,
  FinalManifestNation,
  GameDifficulty,
  MapTopologyRegistry,
} from "@geopolitics/domain";
import { GlobalAiInitializer } from "@geopolitics/game-engine";
import { ClientFinalStateLoader } from "@/infrastructure/storage/client-final-state-loader";

export class CampaignInitializationService {
  private static aiInitializer = new GlobalAiInitializer();

  public static async createInitialGameState(
    nationId: string,
    governmentType: string,
    gameId: string,
    manifest?: FinalMapManifest | null,
    difficulty: GameDifficulty = "NORMAL",
  ): Promise<GameState> {
    const normalizedHumanId = CountryRegistry.resolveCanonicalId(nationId);
    let activeManifest: FinalMapManifest | null = manifest ?? null;

    if (!activeManifest) {
      activeManifest =
        await ClientFinalStateLoader.ensureManifestLoaded("map1");
    }

    if (
      !activeManifest ||
      !Array.isArray(activeManifest.nations) ||
      activeManifest.nations.length === 0
    ) {
      throw new Error(
        "Map manifest is invalid or contains no sovereign nations.",
      );
    }

    CountryRegistry.initializeFromManifest(activeManifest);
    MapTopologyRegistry.initializeFromManifest(activeManifest);

    const detectedNations = activeManifest.nations.map(
      (n: FinalManifestNation) =>
        CountryRegistry.resolveCanonicalId(n.code || n.id),
    );

    if (!detectedNations.includes(normalizedHumanId)) {
      throw new Error(
        `Selected nation (${nationId}) does not exist in strategic manifest.`,
      );
    }

    const initResult = this.aiInitializer.initializeAllNations(
      normalizedHumanId,
      governmentType,
      activeManifest,
    );

    return {
      gameId,
      currentTurn: 1,
      seed: Math.floor(Math.random() * 1000000),
      isGameOver: false,
      difficulty,
      humanNationId: normalizedHumanId,
      provinces: initResult.provinces,
      nations: initResult.nations,
      pendingProposals: [],
      turnLogs: [],
      turnActivity: {},
      activeDilemma: null,
      scheduledDilemmaTurn: null,
    };
  }
}
