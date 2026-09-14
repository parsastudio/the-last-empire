"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { MapWarmupService } from "@/infrastructure/storage/services/map-warmup.service";

export function PwaRegister() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      });
    }

    MapWarmupService.scheduleIdleWarmup("map1");

    const prefetchRoutes = () => {
      try {
        router.prefetch("/select-nation");
        router.prefetch("/play/default");

        void fetch("/fa/select-nation");
        void fetch("/fa/play/default");
        void fetch("/en/select-nation");
        void fetch("/en/play/default");
      } catch {}
    };

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(prefetchRoutes, { timeout: 2500 });
    } else {
      setTimeout(prefetchRoutes, 1000);
    }
  }, [router]);

  return null;
}
