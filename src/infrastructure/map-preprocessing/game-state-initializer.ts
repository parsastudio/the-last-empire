import fs from "fs";
import path from "path";
import { GridState } from "@/engine/combat/state/grid-state";
import { StateSynchronizerFacade } from "@/engine/combat/state/state-synchronizer-facade";
import { GameState } from "@/domain/game/game-state.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";
import { GlobalAiInitializer } from "./global-ai-initializer";
import { NationIdResolver } from "@/domain/shared/nation-id-resolver";
import { MapManifest } from "./generator/map-manifest-builder";
import { MapPathResolver } from "./map-path-resolver";

export function normalizeNationId(nationId: string): string {
  return NationIdResolver.resolveCanonicalId(nationId);
}

export class GridNationDetector {
  public detectUniqueNations(cells: GridCell[]): string[] {
    const nations = new Set<string>();
    for (const cell of cells) {
      const owner = cell.ownerId;
      if (owner && owner !== "WATER") {
        nations.add(owner);
      }
    }
    return Array.from(nations).sort();
  }
}

export class ManifestFileLoader {
  public loadManifest(mapId = "map1"): MapManifest | null {
    try {
      const targetDir = MapPathResolver.getMapServerDir(mapId);
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
      marketPrices: { oil: 25000000, steel: 25000000 },
      nations: populatedNations,
      turnLogs: [],
    };

    return this.synchronizer.synchronizeAll(baseState, gridState);
  }
}
