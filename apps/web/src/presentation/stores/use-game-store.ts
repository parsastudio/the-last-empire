import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  GameState,
  GameAction,
  SeededRandom,
  FinalMapManifest,
} from "@geopolitics/domain";
import {
  ActionEngine,
  TurnProgressionOrchestrator,
} from "@geopolitics/game-engine";
import { CampaignInitializationService } from "@/presentation/stores/services/campaign-initialization-service";
import { GamePersistenceService } from "@/presentation/stores/services/game-persistence-service";

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
        const updatedState = await GamePersistenceService.loadGameState(gameId);
        if (updatedState) {
          set((draft) => {
            draft.gameState = updatedState;
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
        const initialState =
          await CampaignInitializationService.createInitialGameState(
            nationId,
            governmentType,
            gameId,
            manifest,
          );

        await GamePersistenceService.saveGameState(gameId, initialState);

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
        void GamePersistenceService.saveGameState(
          activeGameId,
          result.newState,
        );

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
      const totalStart = performance.now();
      const { activeGameId, gameState } = get();
      if (!gameState) {
        return null;
      }
      try {
        console.group(
          `[TURN_ADVANCE] نوبت ${gameState.currentTurn} ➔ ${gameState.currentTurn + 1}`,
        );
        const prng = new SeededRandom(
          gameState.seed || Math.floor(Math.random() * 1000000),
        );

        const orchStart = performance.now();
        const nextState = orchestrator.advanceTurn(gameState, prng);
        const orchDuration = (performance.now() - orchStart).toFixed(2);
        console.log(
          `[STORE_PERF] محاسبه موتور بازی (Orchestrator): ${orchDuration}ms`,
        );

        const stateUpdateStart = performance.now();
        set((draft) => {
          draft.gameState = nextState;
        });
        const stateUpdateDuration = (
          performance.now() - stateUpdateStart
        ).toFixed(2);
        console.log(
          `[STORE_PERF] به‌روزرسانی استیت Zustand: ${stateUpdateDuration}ms`,
        );

        const persistStart = performance.now();
        void GamePersistenceService.saveGameState(activeGameId, nextState);
        const persistDuration = (performance.now() - persistStart).toFixed(2);
        console.log(
          `[STORE_PERF] اعزام دستور ذخیره‌سازی در IndexedDB: ${persistDuration}ms`,
        );

        const totalDuration = (performance.now() - totalStart).toFixed(2);
        console.log(
          `[STORE_PERF] زمان کل پردازش کلاینتی نوبت: ${totalDuration}ms`,
        );
        console.groupEnd();
        return nextState;
      } catch (err) {
        console.error(`[TURN_ADVANCE_ERROR] خطا در پیشروی نوبت:`, err);
        console.groupEnd();
        return null;
      }
    },
  })),
);
