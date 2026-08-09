import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { GameStorageAdapter } from "@/infrastructure/storage/game-storage.adapter";
import { ActionEngine } from "@/engine/actions/action-engine";
import { TurnProgressionOrchestrator } from "@/engine/orchestrator/turn-progression.orchestrator";
import { SeededRandom } from "@/domain/shared/domain-utilities";
import { GlobalAiInitializer } from "@/infrastructure/map-preprocessing/global-ai-initializer";
import { CountryRegistry, ALL_COUNTRY_PROFILES } from "@/domain/data/countries";
import { FinalMapManifest } from "@/infrastructure/map-preprocessing/final/final-manifest-builder";

interface GameStoreState {
  gameState: GameState | null;
  loading: boolean;
  error: string | null;
  activeGameId: string;

  setGameState: (state: GameState | null) => void;
  loadGame: (gameId: string) => Promise<boolean>;
  createCampaign: (
    nationId: string,
    governmentType: string,
    gameId: string,
    manifest?: FinalMapManifest | null,
  ) => Promise<boolean>;
  dispatchAction: (
    action: GameAction,
    onSuccessMessage?: string,
  ) => Promise<{ success: boolean; message: string }>;
  advanceNextTurn: () => Promise<GameState | null>;
}

const storageAdapter = new GameStorageAdapter();
const aiInitializer = new GlobalAiInitializer();
const orchestrator = new TurnProgressionOrchestrator();

export const useGameStore = create<GameStoreState>()(
  immer((set, get) => ({
    gameState: null,
    loading: false,
    error: null,
    activeGameId: "default_game",

    setGameState: (state) =>
      set((draft) => {
        draft.gameState = state;
      }),

    loadGame: async (gameId) => {
      set((draft) => {
        draft.loading = true;
        draft.error = null;
        draft.activeGameId = gameId;
      });

      try {
        const state = await storageAdapter.loadGameState(gameId);
        if (state) {
          set((draft) => {
            draft.gameState = state;
            draft.loading = false;
          });
          return true;
        }

        set((draft) => {
          draft.error = "اطلاعات پرونده بازی یافت نشد.";
          draft.loading = false;
        });
        return false;
      } catch {
        set((draft) => {
          draft.error = "خطا در بارگذاری اطلاعات از حافظه محلی.";
          draft.loading = false;
        });
        return false;
      }
    },

    createCampaign: async (nationId, governmentType, gameId, manifest) => {
      set((draft) => {
        draft.loading = true;
        draft.error = null;
        draft.activeGameId = gameId;
      });

      try {
        const normalizedHumanId = CountryRegistry.resolveCanonicalId(nationId);
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

        const initResult = aiInitializer.initializeAllNations(
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
          marketPrices: { oil: 25000000 },
          provinces: initResult.provinces,
          nations: initResult.nations,
          turnLogs: [],
        };

        await storageAdapter.saveGameState(gameId, initialState);

        set((draft) => {
          draft.gameState = initialState;
          draft.loading = false;
        });
        return true;
      } catch {
        set((draft) => {
          draft.error = "خطا در ساخت کمپین جدید.";
          draft.loading = false;
        });
        return false;
      }
    },

    dispatchAction: async (action, onSuccessMessage) => {
      const { activeGameId, gameState } = get();
      if (!gameState) {
        return {
          success: false,
          message: "اطلاعات پرونده بازی یافت نشد.",
        };
      }

      const result = ActionEngine.execute(gameState, action);
      if (result.success && result.newState) {
        set((draft) => {
          draft.gameState = result.newState ?? null;
        });
        void storageAdapter.saveGameState(activeGameId, result.newState);

        return {
          success: true,
          message: onSuccessMessage || result.message,
        };
      }

      return {
        success: false,
        message: result.message || "امکان انجام این دستور وجود ندارد.",
      };
    },

    advanceNextTurn: async () => {
      const { activeGameId, gameState } = get();
      if (!gameState) {
        return null;
      }
      try {
        const prng = new SeededRandom(
          gameState.seed || Math.floor(Math.random() * 1000000),
        );
        const nextState = orchestrator.advanceTurn(gameState, prng);
        set((draft) => {
          draft.gameState = nextState;
        });
        void storageAdapter.saveGameState(activeGameId, nextState);
        return nextState;
      } catch {
        return null;
      }
    },
  })),
);
