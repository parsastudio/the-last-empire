"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { MapWarmupService } from "@/infrastructure/storage/services/map-warmup.service";
import { BinaryAssetRepository } from "@/infrastructure/storage/repositories/binary-asset.repository";

export function PwaRegister() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      });
    }

    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().catch(() => {});
    }

    const performSelfHealingAssetSync = async () => {
      try {
        const manifestKey = "map1_manifest_json";
        const terrainKey = "map1_terrain_raw_gz";
        const liveStateKey = "map1_live_state_gz";

        const [hasManifest, hasTerrain, hasLive] = await Promise.all([
          BinaryAssetRepository.getAsset(manifestKey),
          BinaryAssetRepository.getAsset(terrainKey),
          BinaryAssetRepository.getAsset(liveStateKey),
        ]);

        if (!hasManifest || !hasTerrain || !hasLive) {
          await MapWarmupService.warmup("map1");
        }
      } catch {}

      try {
        router.prefetch("/select-nation");
        router.prefetch("/play/default");

        const essentialRoutes = [
          "/fa",
          "/en",
          "/fa/select-nation",
          "/en/select-nation",
          "/fa/play/default",
          "/en/play/default",
        ];

        for (let i = 0; i < essentialRoutes.length; i++) {
          const route = essentialRoutes[i]!;
          void fetch(route);
          void fetch(`${route}?_rsc=offline`, {
            headers: { RSC: "1" },
          });
        }
      } catch {}
    };

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(
        () => {
          void performSelfHealingAssetSync();
        },
        { timeout: 2000 },
      );
    } else {
      setTimeout(() => {
        void performSelfHealingAssetSync();
      }, 1000);
    }
  }, [router]);

  return null;
}
