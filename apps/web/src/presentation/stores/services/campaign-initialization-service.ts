import {
  GameState,
  CountryRegistry,
  ALL_COUNTRY_PROFILES,
  FinalMapManifest,
  FinalManifestNation,
  ClientMapPathResolver,
} from "@geopolitics/domain";
import { GlobalAiInitializer } from "@geopolitics/map-pipeline";

export class CampaignInitializationService {
  private static aiInitializer = new GlobalAiInitializer();

  public static async createInitialGameState(
    nationId: string,
    governmentType: string,
    gameId: string,
    manifest?: FinalMapManifest | null,
  ): Promise<GameState> {
    const normalizedHumanId = CountryRegistry.resolveCanonicalId(nationId);
    let activeManifest: FinalMapManifest | null = manifest ?? null;

    if (!activeManifest) {
      try {
        const manifestUrl = ClientMapPathResolver.getMapStrategicClientUrl(
          "map1",
          "manifest.json",
        );
        const res = await fetch(manifestUrl, {
          cache: "no-store",
        });
        if (res.ok) {
          activeManifest = await res.json();
        }
      } catch {}
    }

    if (activeManifest) {
      CountryRegistry.initializeFromManifest(activeManifest);
    }

    let detectedNations: string[] = [];

    if (activeManifest && activeManifest.nations) {
      detectedNations = activeManifest.nations.map((n: FinalManifestNation) =>
        CountryRegistry.resolveCanonicalId(n.code || n.id),
      );
    } else {
      detectedNations = ALL_COUNTRY_PROFILES.map((p) => p.code.toUpperCase());
    }

    if (!detectedNations.includes(normalizedHumanId)) {
      detectedNations.push(normalizedHumanId);
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
      humanNationId: normalizedHumanId,
      provinces: initResult.provinces,
      nations: initResult.nations,
      pendingProposals: [],
      turnLogs: [],
    };
  }
}
