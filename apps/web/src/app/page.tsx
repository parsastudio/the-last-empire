"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AmbientTacticalGrid } from "@/presentation/components/main-menu/ambient-tactical-grid";
import { CommandConsole } from "@/presentation/components/main-menu/command-console";
import { BriefingPanel } from "@/presentation/components/main-menu/briefing-panel";
import { StatusTicker } from "@/presentation/components/main-menu/status-ticker";
import { LoadCampaignModal } from "@/presentation/components/main-menu/load-campaign-modal";

export default function MainMenuPage() {
  const router = useRouter();
  const [isLoadGameModalOpen, setIsLoadGameModalOpen] = useState(false);

  const handleNewCampaign = () => {
    router.push("/select-nation");
  };

  const handleLoadCampaign = () => {
    setIsLoadGameModalOpen(true);
  };

  const handleSelectSave = (saveId: string) => {
    router.push(`/play/${saveId}`);
  };

  return (
    <div
      className="w-screen h-screen bg-background overflow-hidden relative flex flex-col justify-between items-center select-none"
      dir="rtl"
    >
      <AmbientTacticalGrid />

      <main className="flex-1 flex flex-col items-center justify-center gap-8 w-full max-w-5xl px-6 z-10 py-6">
        <div className="text-center space-y-4 relative">
          <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-150 pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-secondary/80 border border-border rounded-full text-[9px] font-mono text-muted-foreground uppercase tracking-widest relative z-10 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-gdp animate-tactical-pulse" />
            <span>نسخه عملیاتی ۱.۴</span>
          </div>

          <div className="relative inline-block z-10 px-12 md:px-20 pt-10 pb-6 border-y border-border/60 overflow-visible">
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-gdp" />
            <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-gdp" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-gdp" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-gdp" />
            <div className="absolute inset-0 bg-gdp/5 blur-3xl rounded-full scale-125 pointer-events-none opacity-40 animate-pulse" />

            <h1 className="text-4xl md:text-6xl font-black tracking-widest bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-200 to-slate-400 drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] leading-normal overflow-visible px-6 py-2">
              آخرین امپراتوری
            </h1>
          </div>

          <p className="text-xs md:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed relative z-10 font-bold">
            با <span className="text-military font-extrabold">قدرت نظامی</span>،{" "}
            <span className="text-treasury font-extrabold">سلطه اقتصادی</span>{" "}
            یا{" "}
            <span className="text-primary font-extrabold">نفوذ دیپلماتیک</span>،
            جهان را فتح کن!
          </p>
        </div>

        <div className="w-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 relative z-10">
          <CommandConsole
            onNewCampaign={handleNewCampaign}
            onLoadCampaign={handleLoadCampaign}
          />
          <BriefingPanel />
        </div>
      </main>

      <StatusTicker />

      <LoadCampaignModal
        isOpen={isLoadGameModalOpen}
        onClose={() => setIsLoadGameModalOpen(false)}
        onSelectSave={handleSelectSave}
      />
    </div>
  );
}
