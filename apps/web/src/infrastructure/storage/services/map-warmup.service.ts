import { ClientFinalStateLoader } from "@/infrastructure/storage/client-final-state-loader";
import { BitPackedGridState } from "@geopolitics/game-engine";

export type WarmupState = "IDLE" | "WARMING" | "READY" | "ERROR";

export class MapWarmupService {
  private static currentState: WarmupState = "IDLE";
  private static warmupPromise: Promise<boolean> | null = null;
  private static listeners = new Set<(state: WarmupState) => void>();

  public static getState(): WarmupState {
    return this.currentState;
  }

  public static isReady(): boolean {
    return this.currentState === "READY";
  }

  public static subscribe(listener: (state: WarmupState) => void): () => void {
    this.listeners.add(listener);
    listener(this.currentState);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static notify(state: WarmupState): void {
    this.currentState = state;
    for (const listener of this.listeners) {
      listener(state);
    }
  }

  public static async warmup(mapId = "map1"): Promise<boolean> {
    if (this.currentState === "READY") {
      return true;
    }

    if (this.warmupPromise) {
      return this.warmupPromise;
    }

    this.notify("WARMING");

    this.warmupPromise = (async () => {
      try {
        const manifestPromise =
          ClientFinalStateLoader.ensureManifestLoaded(mapId);
        const terrainPromise = ClientFinalStateLoader.loadTerrainRawData(mapId);
        const liveStatePromise =
          ClientFinalStateLoader.loadLiveStateBuffer(mapId);

        const [manifest, terrain, liveState] = await Promise.all([
          manifestPromise,
          terrainPromise,
          liveStatePromise,
        ]);

        if (manifest && terrain && liveState) {
          const gridState = BitPackedGridState.getInstance();
          gridState.getBuffer().getRawBuffer().set(liveState.getRawBuffer());
          gridState.markLoaded();
          gridState.markDirty();

          this.notify("READY");
          return true;
        }

        this.notify("ERROR");
        return false;
      } catch {
        this.notify("ERROR");
        return false;
      } finally {
        this.warmupPromise = null;
      }
    })();

    return this.warmupPromise;
  }

  public static scheduleIdleWarmup(mapId = "map1"): void {
    if (typeof window === "undefined" || this.currentState === "READY") {
      return;
    }

    const run = () => {
      void this.warmup(mapId);
    };

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(run, { timeout: 3000 });
    } else {
      setTimeout(run, 500);
    }
  }
}
