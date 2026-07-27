"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AmbientTacticalGrid } from "@/presentation/components/main-menu/ambient-tactical-grid";
import { CommandConsole } from "@/presentation/components/main-menu/command-console";
import { BriefingPanel } from "@/presentation/components/main-menu/briefing-panel";
import { StatusTicker } from "@/presentation/components/main-menu/status-ticker";
import { NationSelectorModal } from "@/presentation/components/main-menu/nation-selector-modal";
import { LoadCampaignModal } from "@/presentation/components/main-menu/load-campaign-modal";

export default function MainMenuPage() {
  const router = useRouter();
  const [isNewGameModalOpen, setIsNewGameModalOpen] = useState(false);
  const [isLoadGameModalOpen, setIsLoadGameModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const handleNewCampaign = () => {
    setIsNewGameModalOpen(true);
  };

  const handleLoadCampaign = () => {
    setIsLoadGameModalOpen(true);
  };

  const handleTriggerAlert = (message: string) => {
    setAlertMessage(message);
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const handleSelectNation = async (nationId: string) => {
    try {
      const res = await fetch("/api/game/select-country", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nationId }),
      });
      if (res.ok) {
        router.push("/play");
      }
    } catch {
      alert("خطا در ایجاد کمپین جدید");
    }
  };

  const handleSelectSave = () => {
    router.push("/play");
  };

  return (
    <div
      className="w-screen h-screen bg-background overflow-hidden relative flex flex-col justify-between items-center select-none"
      dir="rtl"
    >
      <AmbientTacticalGrid />

      {alertMessage && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-card border border-border px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold text-military flex items-center gap-2 z-50 animate-fade-in">
          <span>{alertMessage}</span>
        </div>
      )}

      <main className="flex-1 flex flex-col items-center justify-center gap-12 w-full max-w-4xl px-6 z-10 py-12">
        <div className="text-center space-y-5 relative">
          <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full scale-150 pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary border border-border/80 rounded-full text-[9px] font-mono text-muted-foreground uppercase tracking-widest relative z-10">
            <span>پروتکل نهایی حاکمیت | Ver 1.4</span>
          </div>

          <div className="relative inline-block z-10">
            <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full scale-125 opacity-40 animate-pulse" />
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-slate-950 via-slate-800 to-slate-950 drop-shadow-[0_2px_10px_rgba(0,0,0,0.08)] py-1.5 px-4">
              آخرین امپراتوری
            </h1>
          </div>

          <p className="text-xs md:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed relative z-10">
            شبیه‌ساز فوق‌پیشرفته ژئوپلیتیک، جنگ ناهمگام و دیپلماسی راهبردی جهانی
          </p>
        </div>

        <div className="w-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 relative z-10">
          <CommandConsole
            onNewCampaign={handleNewCampaign}
            onLoadCampaign={handleLoadCampaign}
            onTriggerAlert={handleTriggerAlert}
          />
          <BriefingPanel />
        </div>
      </main>

      <StatusTicker />

      <NationSelectorModal
        isOpen={isNewGameModalOpen}
        onClose={() => setIsNewGameModalOpen(false)}
        onSelect={handleSelectNation}
      />

      <LoadCampaignModal
        isOpen={isLoadGameModalOpen}
        onClose={() => setIsLoadGameModalOpen(false)}
        onSelectSave={handleSelectSave}
      />
    </div>
  );
}
