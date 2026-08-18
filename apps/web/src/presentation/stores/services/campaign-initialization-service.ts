import { GameState } from "@/domain/game/game-state.schema";
import { CountryRegistry, ALL_COUNTRY_PROFILES } from "@/domain/data/countries";
import {
  FinalMapManifest,
  FinalManifestNation,
} from "@/infrastructure/map-preprocessing/pipeline/05-export/strategic-manifest-builder";
import { GlobalAiInitializer } from "@/infrastructure/map-preprocessing/global-ai-initializer";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";
import { ProvincePixelCalculator } from "@/engine/map/province-pixel-calculator";

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
        const res = await fetch("/maps/map1/temp/final/manifest.json", {
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

    const buffer = BitPackedGridState.getInstance().getBuffer();
    const syncedProvinces = ProvincePixelCalculator.syncProvincesMapPixelCounts(
      buffer,
      initResult.provinces,
    );

    return {
      gameId,
      currentTurn: 1,
      seed: Math.floor(Math.random() * 1000000),
      isGameOver: false,
      humanNationId: normalizedHumanId,
      provinces: syncedProvinces,
      nations: initResult.nations,
      pendingProposals: [],
      turnLogs: [],
    };
  }
}
