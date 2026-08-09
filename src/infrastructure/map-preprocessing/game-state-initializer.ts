import "server-only";
import fs from "fs";
import path from "path";
import { GameState } from "@/domain/game/game-state.schema";
import { GlobalAiInitializer } from "@/infrastructure/map-preprocessing/global-ai-initializer";
import { CountryRegistry } from "@/domain/data/countries";
import {
  FinalMapManifest as MapManifest,
  FinalManifestNation,
} from "@/infrastructure/map-preprocessing/final/final-manifest-builder";
import { MapPathResolver } from "@/infrastructure/map-preprocessing/map-path-resolver";

export class ManifestFileLoader {
  public loadManifest(mapId = "map1"): MapManifest | null {
    try {
      const targetDir = MapPathResolver.getMapFinalServerDir(mapId);
      const manifestPath = path.join(targetDir, "manifest.json");

      if (fs.existsSync(manifestPath)) {
        const raw = fs.readFileSync(manifestPath, "utf-8");
        return JSON.parse(raw) as MapManifest;
      }
    } catch {}
    return null;
  }
}

export class GameStateInitializer {
  private aiInitializer = new GlobalAiInitializer();
  private manifestLoader = new ManifestFileLoader();

  public initializeSimulationForNation(
    nationId: string,
    governmentType?: string,
  ): GameState {
    const normalizedHumanId = CountryRegistry.resolveCanonicalId(nationId);
    const manifest = this.manifestLoader.loadManifest("map1");

    const detectedNations = manifest
      ? manifest.nations.map((n: FinalManifestNation) => n.id)
      : [normalizedHumanId];

    if (!detectedNations.includes(normalizedHumanId)) {
      detectedNations.push(normalizedHumanId);
    }

    const { nations, provinces } = this.aiInitializer.initializeAllNations(
      detectedNations,
      normalizedHumanId,
      governmentType,
      manifest,
    );

    return {
      gameId: `game_${normalizedHumanId}_${Date.now()}`,
      currentTurn: 1,
      seed: 554422,
      isGameOver: false,
      humanNationId: normalizedHumanId,
      globalThreatLevel: 0,
      marketPrices: { oil: 25000000 },
      provinces,
      nations,
      turnLogs: [],
    };
  }
}
