import { ClientFinalStateLoader } from "@/infrastructure/storage/client-final-state-loader";
import { BitPackedGridState } from "@geopolitics/game-engine";

export class MapWarmupService {
  private static warmupPromise: Promise<boolean> | null = null;

  public static async warmup(mapId = "map1"): Promise<boolean> {
    if (this.warmupPromise) {
      return this.warmupPromise;
    }

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
          return true;
        }

        return false;
      } catch {
        return false;
      } finally {
        this.warmupPromise = null;
      }
    })();

    return this.warmupPromise;
  }
}
