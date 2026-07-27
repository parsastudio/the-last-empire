"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AmbientTacticalGrid } from "@/presentation/components/main-menu/ambient-tactical-grid";
import { CommandConsole } from "@/presentation/components/main-menu/command-console";
import { BriefingPanel } from "@/presentation/components/main-menu/briefing-panel";
import { StatusTicker } from "@/presentation/components/main-menu/status-ticker";
import { NationSelectorModal } from "@/presentation/components/main-menu/nation-selector-modal";

export default function MainMenuPage() {
  const router = useRouter();
  const [hasSavedCampaign, setHasSavedCampaign] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("test6_human_nation_id");
    if (saved) {
      setHasSavedCampaign(true);
    }
  }, []);

  const handleNewCampaign = () => {
    setIsModalOpen(true);
  };

  const handleLoadCampaign = () => {
    router.push("/play");
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

  return (
    <div
      className="w-screen h-screen bg-background overflow-hidden relative flex flex-col justify-between items-center select-none"
      dir="rtl"
    >
      <AmbientTacticalGrid />

      <main className="flex-1 flex flex-col items-center justify-center gap-12 w-full max-w-4xl px-6 z-10 py-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary border border-border/80 rounded-full text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
            <span>نسخه آزمایشی راهبردی | Ver 1.4</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground transition-all duration-500 hover:tracking-wide">
            آخرین امپراتوری
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            شبیه‌ساز فوق‌پیشرفته ژئوپلیتیک، جنگ ناهمگام و دیپلماسی راهبردی جهانی
          </p>
        </div>

        <div className="w-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
          <CommandConsole
            hasSavedCampaign={hasSavedCampaign}
            onNewCampaign={handleNewCampaign}
            onLoadCampaign={handleLoadCampaign}
          />
          <BriefingPanel />
        </div>
      </main>

      <StatusTicker />

      <NationSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleSelectNation}
      />
    </div>
  );
}
