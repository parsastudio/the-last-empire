import {
  GameState,
  CountryRegistry,
  FinalMapManifest,
  FinalManifestNation,
  ClientMapPathResolver,
  GameDifficulty,
} from "@geopolitics/domain";
import { GlobalAiInitializer } from "@geopolitics/game-engine";

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
      const manifestUrl = ClientMapPathResolver.getMapStrategicClientUrl(
        "map1",
        "manifest.json",
      );
      const res = await fetch(manifestUrl, {
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error(
          "امکان خواندن مانیفست استراتژیک اولیه نقشه از سرور وجود ندارد.",
        );
      }
      activeManifest = await res.json();
    }

    if (
      !activeManifest ||
      !Array.isArray(activeManifest.nations) ||
      activeManifest.nations.length === 0
    ) {
      throw new Error(
        "مانیفست استراتژیک نقشه نامعتبر است یا هیچ کشوری در آن تعریف نشده است.",
      );
    }

    CountryRegistry.initializeFromManifest(activeManifest);

    const detectedNations = activeManifest.nations.map(
      (n: FinalManifestNation) =>
        CountryRegistry.resolveCanonicalId(n.code || n.id),
    );

    if (!detectedNations.includes(normalizedHumanId)) {
      throw new Error(
        `کشور انتخاب‌شده (${nationId}) در مانیفست استراتژیک وجود ندارد.`,
      );
    }

    const initResult = this.aiInitializer.initializeAllNations(
      detectedNations,
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
