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
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";
import { ProvincePixelCalculator } from "@/engine/map/province-pixel-calculator";

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
        let state = await storageAdapter.loadGameState(gameId);

        if (state) {
          const hasProvinces =
            state.provinces && Object.keys(state.provinces).length > 0;

          if (!hasProvinces) {
            try {
              const res = await fetch("/maps/map1/temp/final/manifest.json", {
                cache: "no-store",
              });
              if (res.ok) {
                const manifest: FinalMapManifest = await res.json();
                const initResult = aiInitializer.initializeFromManifest(
                  manifest,
                  state.humanNationId,
                );
                state = {
                  ...state,
                  provinces: initResult.provinces,
                  nations: { ...initResult.nations, ...state.nations },
                };
                await storageAdapter.saveGameState(gameId, state);
              }
            } catch {}
          }

          const buffer = BitPackedGridState.getInstance().getBuffer();
          state = {
            ...state,
            provinces: ProvincePixelCalculator.syncProvincesMapPixelCounts(
              buffer,
              state.provinces,
            ),
          };

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
        let activeManifest: FinalMapManifest | null = manifest ?? null;

        try {
          const res = await fetch("/maps/map1/temp/final/manifest.json", {
            cache: "no-store",
          });
          if (res.ok) {
            activeManifest = await res.json();
          }
        } catch {}

        let detectedNations: string[] = [];

        if (activeManifest && activeManifest.nations) {
          detectedNations = activeManifest.nations.map((n) => n.id);
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
          activeManifest,
        );

        const buffer = BitPackedGridState.getInstance().getBuffer();
        const syncedProvinces =
          ProvincePixelCalculator.syncProvincesMapPixelCounts(
            buffer,
            initResult.provinces,
          );

        const initialState: GameState = {
          gameId,
          currentTurn: 1,
          seed: Math.floor(Math.random() * 1000000),
          isGameOver: false,
          humanNationId: normalizedHumanId,
          globalThreatLevel: 0,
          provinces: syncedProvinces,
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
