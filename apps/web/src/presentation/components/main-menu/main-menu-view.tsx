"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { AmbientTacticalGrid } from "@/presentation/components/main-menu/ambient-tactical-grid";
import { CommandConsole } from "@/presentation/components/main-menu/command-console";
import { BriefingPanel } from "@/presentation/components/main-menu/briefing-panel";
import { StatusTicker } from "@/presentation/components/main-menu/status-ticker";
import { LoadCampaignModal } from "@/presentation/components/main-menu/load-campaign-modal";
import { LanguageSwitcher } from "@/presentation/components/common/language-switcher";
import { usePwaInstall } from "@/presentation/hooks/common/use-pwa-install";
import { Globe2, Download, ShieldCheck } from "lucide-react";

function GithubIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

export function MainMenuView() {
  const t = useTranslations("menu");
  const router = useRouter();
  const [isLoadGameModalOpen, setIsLoadGameModalOpen] = useState(false);
  const { isInstallable, isInstalled, promptInstall } = usePwaInstall();

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
    <div className="w-full h-[100dvh] bg-background overflow-hidden relative flex flex-col justify-between items-center select-none">
      <AmbientTacticalGrid />

      <header
        style={{
          paddingTop: "max(0.75rem, env(safe-area-inset-top))",
          paddingLeft: "max(1rem, env(safe-area-inset-left))",
          paddingRight: "max(1rem, env(safe-area-inset-right))",
        }}
        className="w-full max-w-7xl mx-auto px-4 sm:px-8 pb-1 sm:pb-2 z-30 flex items-center justify-between shrink-0"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-inner">
            <Globe2 size={16} />
          </div>
          <span className="text-xs font-black tracking-widest font-mono text-muted-foreground uppercase">
            WAR ROOM // DECK
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isInstallable && (
            <button
              type="button"
              onClick={promptInstall}
              className="p-1.5 md:p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/40 text-emerald-400 shadow-inner font-mono text-[10px] md:text-xs font-black animate-pulse"
              title={t("installApp")}
            >
              <Download size={14} className="shrink-0" />
              <span>{t("installApp")}</span>
            </button>
          )}

          {isInstalled && (
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border bg-secondary/60 border-border/70 text-muted-foreground font-mono text-[10px]">
              <ShieldCheck size={13} className="text-gdp" />
              <span>{t("installedBadge")}</span>
            </div>
          )}

          <a
            href="https://github.com/parsastudio/the-last-empire"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("github")}
            title={t("github")}
            className="p-1.5 md:p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 bg-secondary/80 border-border/70 text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-primary/40 shadow-inner font-mono text-[10px] md:text-xs font-bold"
          >
            <GithubIcon className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl px-4 sm:px-8 z-10 overflow-y-auto overscroll-contain touch-pan-y min-h-0 scrollbar-thin scrollbar-thumb-border/40">
        <div className="w-full min-h-full flex flex-col items-center justify-start lg:justify-center gap-3 sm:gap-5 py-2 sm:py-6">
          <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3 w-full max-w-3xl shrink-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/90 border border-border/80 rounded-full text-[9px] font-mono text-muted-foreground uppercase tracking-widest backdrop-blur-xl shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{t("version")}</span>
            </div>

            <div className="relative px-6 sm:px-14 md:px-16 py-1.5 sm:py-3 my-0.5">
              <div className="absolute top-0 start-0 w-3.5 h-3.5 border-t-2 border-s-2 border-emerald-400" />
              <div className="absolute top-0 end-0 w-3.5 h-3.5 border-t-2 border-e-2 border-emerald-400" />
              <div className="absolute bottom-0 start-0 w-3.5 h-3.5 border-b-2 border-s-2 border-emerald-400" />
              <div className="absolute bottom-0 end-0 w-3.5 h-3.5 border-b-2 border-e-2 border-emerald-400" />

              <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black tracking-wider text-foreground drop-shadow-[0_8px_30px_rgba(0,0,0,0.9)] leading-tight font-sans text-center">
                {t("title")}
              </h1>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed font-medium px-2 text-center">
              {t("hero.prefix")}
              <span className="text-rose-400 font-bold">
                {t("hero.military")}
              </span>
              {t("hero.mid")}
              <span className="text-amber-400 font-bold">
                {t("hero.economic")}
              </span>
              {t("hero.or")}
              <span className="text-primary font-bold">
                {t("hero.diplomacy")}
              </span>
              {t("hero.suffix")}
            </p>
          </div>

          <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-6 items-center max-w-4xl pt-1">
            <div className="md:col-span-6 w-full">
              <CommandConsole
                onNewCampaign={handleNewCampaign}
                onLoadCampaign={handleLoadCampaign}
              />
            </div>

            <div className="md:col-span-6 w-full hidden sm:block">
              <BriefingPanel />
            </div>
          </div>
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
