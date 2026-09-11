"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Smartphone, Maximize2, RotateCcw } from "lucide-react";

interface LockableScreenOrientation {
  lock?: (orientation: "landscape") => Promise<void>;
}

export function OrientationGuard() {
  const t = useTranslations("hud.orientation");
  const [canFullscreen, setCanFullscreen] = useState(false);

  useEffect(() => {
    if (typeof document !== "undefined" && document.fullscreenEnabled) {
      setCanFullscreen(true);
    }
  }, []);

  const handleRequestFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }

      if ("orientation" in screen) {
        const orientationObj =
          screen.orientation as unknown as LockableScreenOrientation;
        if (typeof orientationObj.lock === "function") {
          await orientationObj.lock("landscape").catch(() => {});
        }
      }
    } catch {}
  };

  return (
    <aside
      className="fixed inset-0 z-[9999] bg-background/98 backdrop-blur-3xl text-foreground flex-col items-center justify-center p-6 text-center select-none hidden portrait:max-lg:flex dir-rtl font-sans"
      dir="rtl"
    >
      <div className="relative flex items-center justify-center w-20 h-20 mb-6">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/80 border border-border/80 shadow-inner">
          <Smartphone size={32} className="text-primary animate-pulse" />
        </div>
        <div className="absolute -bottom-1 -right-1 p-1 rounded-lg bg-card border border-border text-gdp shadow-sm">
          <RotateCcw size={14} className="animate-spin duration-1000" />
        </div>
      </div>

      <h2 className="text-base font-black text-foreground mb-2">
        {t("title")}
      </h2>

      <p className="text-xs text-muted-foreground max-w-xs leading-relaxed mb-6">
        {t("desc")}
      </p>

      {canFullscreen && (
        <button
          type="button"
          onClick={handleRequestFullscreen}
          className="py-2.5 px-4 bg-secondary/90 hover:bg-secondary border border-border/80 rounded-xl text-xs font-bold text-foreground transition-all cursor-pointer flex items-center gap-2 shadow-sm"
        >
          <Maximize2 size={14} className="text-primary" />
          <span>{t("fullscreen")}</span>
        </button>
      )}
    </aside>
  );
}
