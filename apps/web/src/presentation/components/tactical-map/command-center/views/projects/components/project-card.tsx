import React from "react";
import {
  Coins,
  CheckCircle2,
  Lock,
  Plus,
  Shield,
  Factory,
  Globe2,
  ChevronLeft,
  Check,
} from "lucide-react";
import {
  NationalProjectConfig,
  PersianNumberFormatter,
} from "@geopolitics/domain";

interface ProjectCardProps {
  project: NationalProjectConfig;
  currentSteps: number;
  isCompleted: boolean;
  isBoostedThisTurn: boolean;
  canAfford: boolean;
  hasAvailableQuota: boolean;
  isSubmitting: boolean;
  onBoost: (project: NationalProjectConfig) => void;
}

export function ProjectCard({
  project,
  currentSteps,
  isCompleted,
  isBoostedThisTurn,
  canAfford,
  hasAvailableQuota,
  isSubmitting,
  onBoost,
}: ProjectCardProps) {
  const getCategoryIcon = () => {
    switch (project.category) {
      case "MILITARY":
        return Shield;
      case "ECONOMIC":
        return Coins;
      case "INDUSTRY_TECH":
        return Factory;
      case "GEOPOLITICAL":
      default:
        return Globe2;
    }
  };

  const Icon = getCategoryIcon();
  const clampedSteps = Math.min(
    project.totalStepsRequired,
    Math.max(0, currentSteps),
  );
  const progressPercent = Math.round(
    (clampedSteps / project.totalStepsRequired) * 100,
  );

  const isButtonDisabled =
    isCompleted ||
    isBoostedThisTurn ||
    !canAfford ||
    !hasAvailableQuota ||
    isSubmitting;

  return (
    <div
      className={`relative p-5 rounded-3xl border transition-all duration-300 flex flex-col justify-between space-y-4 font-sans dir-rtl text-right shadow-lg backdrop-blur-xl ${
        isCompleted
          ? "bg-emerald-950/20 border-emerald-500/40 ring-1 ring-emerald-500/20"
          : isBoostedThisTurn
            ? "bg-primary/10 border-primary/40 shadow-primary/10"
            : "bg-card/90 border-border/80 hover:border-primary/40 hover:bg-secondary/40"
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-sm shrink-0 ${
                isCompleted
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                  : isBoostedThisTurn
                    ? "bg-primary/20 text-primary border-primary/40"
                    : "bg-secondary/80 text-foreground border-border/70"
              }`}
            >
              <Icon size={18} />
            </div>
            <div>
              <h4 className="text-xs font-black text-foreground">
                {project.nameFa}
              </h4>
              <span className="text-[10px] text-muted-foreground font-sans block">
                {project.taglineFa}
              </span>
            </div>
          </div>

          <span
            className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-lg border ${
              project.tier === "SHORT_TERM"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : project.tier === "MID_TERM"
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/30"
            }`}
          >
            {project.tier === "SHORT_TERM"
              ? "کوتاه‌مدت"
              : project.tier === "MID_TERM"
                ? "میان‌مدت"
                : "ابرپروژه بلندمدت"}
          </span>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed font-sans bg-background/50 p-3 rounded-2xl border border-border/40">
          {project.descriptionFa}
        </p>
      </div>

      <div className="space-y-3 pt-2 border-t border-border/40">
        <div className="space-y-1.5 font-mono">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] text-muted-foreground font-sans">
              پیشرفت گام‌ها:
            </span>
            <span className="font-bold text-foreground text-[11px]">
              گام {PersianNumberFormatter.toPersianDigits(clampedSteps)} از{" "}
              {PersianNumberFormatter.toPersianDigits(
                project.totalStepsRequired,
              )}{" "}
              ({PersianNumberFormatter.toPersianDigits(progressPercent)}٪)
            </span>
          </div>

          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden border border-border/40">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCompleted
                  ? "bg-emerald-400"
                  : isBoostedThisTurn
                    ? "bg-primary shadow-sm shadow-primary/40"
                    : "bg-gdp"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {isCompleted ? (
          <div className="w-full py-3 bg-emerald-950/30 border border-emerald-500/40 text-emerald-400 rounded-2xl text-xs font-black flex items-center justify-center gap-2 select-none shadow-inner font-sans">
            <CheckCircle2 size={15} />
            <span>پروژه با موفقیت تکمیل و امتیاز فعال است</span>
          </div>
        ) : isBoostedThisTurn ? (
          <div className="w-full py-3 bg-primary/15 border border-primary/30 text-primary rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 select-none font-sans">
            <Check size={14} strokeWidth={3} />
            <span>بودجه گام جاری تزریق شد (۱/۱)</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onBoost(project)}
            disabled={isButtonDisabled}
            className="w-full py-3 px-4 bg-primary hover:bg-primary/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded-2xl text-xs font-black transition-all cursor-pointer shadow-md shadow-primary/20 flex items-center justify-between gap-2 border border-primary/40 disabled:border-border/60"
          >
            <div className="flex items-center gap-1.5">
              {!hasAvailableQuota ? (
                <Lock size={14} />
              ) : (
                <Plus size={14} strokeWidth={3} />
              )}
              <span>
                {!hasAvailableQuota
                  ? "سقف پژوهش نوبت جاری تکمیل است"
                  : !canAfford
                    ? "موجودی خزانه ناکافی است"
                    : "تزریق بودجه به گام بعدی"}
              </span>
            </div>

            {hasAvailableQuota && canAfford && (
              <span className="font-mono text-[11px] bg-black/25 px-2.5 py-0.5 rounded-lg">
                {PersianNumberFormatter.formatCurrency(
                  project.costPerStep,
                  true,
                )}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
