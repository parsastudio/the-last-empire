import fs from "fs";
import path from "path";
import { GameState } from "@/domain/game/game-state.schema";
import { GlobalAiInitializer } from "@/infrastructure/map-preprocessing/global-ai-initializer";
import { NationIdResolver } from "@/domain/shared/domain-utilities";
import { MapManifest } from "@/infrastructure/map-preprocessing/generator/map-manifest-builder";
import { MapPathResolver } from "@/infrastructure/map-preprocessing/map-path-resolver";
import { BitPackedStateFacade } from "@/engine/combat/final/bit-packed-state-facade";

export function normalizeNationId(nationId: string): string {
  return NationIdResolver.resolveCanonicalId(nationId);
}

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
  private bitFacade = new BitPackedStateFacade();

  public initializeSimulationForNation(
    nationId: string,
    governmentType?: string,
  ): GameState {
    const normalizedHumanId = NationIdResolver.resolveCanonicalId(nationId);
    const manifest = this.manifestLoader.loadManifest("map1");

    const detectedNations = manifest
      ? manifest.nations.map((n) => n.id)
      : [normalizedHumanId];

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
      marketPrices: { oil: 25000000, steel: 25000000 },
      nations: populatedNations,
      turnLogs: [],
    };

    return this.bitFacade.syncGameState(baseState);
  }
}
