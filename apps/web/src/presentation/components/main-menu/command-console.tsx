import React from "react";
import { useTranslations } from "next-intl";
import { Play, FolderOpen, ArrowRight, Sparkles } from "lucide-react";
import { TacticalSound } from "@/presentation/utils/tactical-sound";

interface CommandConsoleProps {
  onNewCampaign: () => void;
  onLoadCampaign: () => void;
}

export function CommandConsole({
  onNewCampaign,
  onLoadCampaign,
}: CommandConsoleProps) {
  const t = useTranslations("menu.console");

  const handleNew = () => {
    TacticalSound.playUiClick();
    onNewCampaign();
  };

  const handleLoad = () => {
    TacticalSound.playUiClick();
    onLoadCampaign();
  };

  return (
    <div className="flex flex-col gap-3 w-full font-sans">
      <button
        type="button"
        onClick={handleNew}
        className="group relative w-full p-4 md:p-4.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-3xl font-black transition-all duration-300 border border-emerald-400/40 shadow-2xl shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-between text-start overflow-hidden ring-1 ring-emerald-300/40"
      >
        <div className="absolute top-0 start-0 end-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/30 flex items-center justify-center text-white shrink-0 shadow-inner group-hover:scale-105 transition-transform">
            <Play size={18} fill="currentColor" className="animate-pulse" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs md:text-sm font-black tracking-tight">
                {t("newCampaign")}
              </span>
              <Sparkles
                size={12}
                className="text-amber-300 animate-spin duration-700"
              />
            </div>
            <p className="text-[10px] text-emerald-100/80 font-normal">
              {t("newCampaignSub")}
            </p>
          </div>
        </div>

        <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform">
          <ArrowRight size={14} className="rtl:rotate-180" />
        </div>
      </button>

      <button
        type="button"
        onClick={handleLoad}
        className="group w-full p-4 md:p-4.5 bg-secondary/80 hover:bg-secondary border border-border/80 hover:border-primary/40 text-foreground rounded-3xl font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-between text-start backdrop-blur-2xl ring-1 ring-white/5"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary shrink-0 shadow-inner group-hover:scale-105 transition-transform">
            <FolderOpen size={18} />
          </div>
          <div className="space-y-0.5">
            <span className="text-xs md:text-sm font-bold text-foreground block">
              {t("loadCampaign")}
            </span>
            <p className="text-[10px] text-muted-foreground font-normal">
              {t("loadCampaignSub")}
            </p>
          </div>
        </div>

        <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center shrink-0 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform text-muted-foreground group-hover:text-foreground">
          <ArrowRight size={14} className="rtl:rotate-180" />
        </div>
      </button>
    </div>
  );
}
