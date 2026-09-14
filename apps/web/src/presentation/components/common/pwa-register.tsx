"use client";

import { useEffect } from "react";
import { MapWarmupService } from "@/infrastructure/storage/services/map-warmup.service";

export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      });
    }

    MapWarmupService.scheduleIdleWarmup("map1");
  }, []);

  return null;
}
