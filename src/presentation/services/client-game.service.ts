import { GameState } from "@/domain/game/game-state.schema";
import { GameEngine } from "@/engine/game-engine";
import { ClientStorageService } from "@/infrastructure/storage/client-storage.service";
import { GlobalAiInitializer } from "@/infrastructure/map-preprocessing/global-ai-initializer";
import { NationIdResolver } from "@/domain/shared/domain-utilities";
import { FinalMapManifest } from "@/infrastructure/map-preprocessing/final/final-manifest-builder";
import { ALL_COUNTRY_PROFILES } from "@/domain/data/countries";
import { AsyncSaveQueueService } from "@/infrastructure/storage/async-save-queue.service";

export class ClientGameService {
  private storageService = new ClientStorageService();
  private aiInitializer = new GlobalAiInitializer();
  private saveQueue = AsyncSaveQueueService.getInstance();

  public async loadGameState(
    gameId: string,
  ): Promise<{ success: boolean; data?: GameState; error?: string }> {
    try {
      const state = await this.storageService.loadGameState(gameId);
      if (!state) {
        return { success: false, error: "اطلاعات پرونده بازی یافت نشد." };
      }
      return { success: true, data: state };
    } catch {
      return {
        success: false,
        error: "خطا در بارگذاری اطلاعات از حافظه محلی.",
      };
    }
  }

  public async advanceTurn(
    gameId: string,
    currentState: GameState,
  ): Promise<{ success: boolean; data?: GameState; error?: string }> {
    try {
      const engine = new GameEngine(currentState);
      const nextState = engine.nextTurn();
      this.saveQueue.enqueueSave(gameId, nextState, false);
      return { success: true, data: nextState };
    } catch {
      return { success: false, error: "خطا در پیشبرد نوبت بازی." };
    }
  }

  public async createCampaign(
    nationId: string,
    governmentType: string,
    gameId: string,
    manifest?: FinalMapManifest | null,
  ): Promise<{ success: boolean; data?: GameState; error?: string }> {
    try {
      const normalizedHumanId = NationIdResolver.resolveCanonicalId(nationId);

      let detectedNations: string[] = [];
      if (manifest && manifest.nations) {
        detectedNations = manifest.nations.map((n) => n.id);
      } else {
        detectedNations = ALL_COUNTRY_PROFILES.map(
          (p) => `NATION_${p.code.toUpperCase()}`,
        );
      }

      if (!detectedNations.includes(normalizedHumanId)) {
        detectedNations.push(normalizedHumanId);
      }

      const populatedNations = this.aiInitializer.initializeAllNations(
        detectedNations,
        normalizedHumanId,
        governmentType,
        manifest,
      );

      const initialState: GameState = {
        gameId,
        currentTurn: 1,
        seed: Math.floor(Math.random() * 1000000),
        isGameOver: false,
        humanNationId: normalizedHumanId,
        globalThreatLevel: 0,
        marketPrices: { oil: 25000000, steel: 25000000 },
        nations: populatedNations,
        turnLogs: [],
      };

      this.saveQueue.enqueueSave(gameId, initialState, true);
      return { success: true, data: initialState };
    } catch {
      return { success: false, error: "خطا در ساخت کمپین جدید." };
    }
  }
}
