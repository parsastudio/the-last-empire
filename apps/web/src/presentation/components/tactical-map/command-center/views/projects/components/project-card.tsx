import React from "react";
import {
  CheckCircle2,
  Lock,
  Plus,
  Shield,
  Factory,
  Globe2,
  Coins,
  Check,
  ChevronDown,
} from "lucide-react";
import {
  NationalProjectConfig,
  PersianNumberFormatter,
} from "@geopolitics/domain";
import { ProjectBreakthroughCardOverlay } from "./project-breakthrough-card-overlay";

interface ProjectCardProps {
  project: NationalProjectConfig;
  currentSteps: number;
  isCompleted: boolean;
  isBoostedThisTurn: boolean;
  isExpanded: boolean;
  isBreakthrough?: boolean;
  canAfford: boolean;
  hasAvailableQuota: boolean;
  isSubmitting: boolean;
  onToggleExpand: () => void;
  onBoost: (project: NationalProjectConfig) => void;
  onDismissBreakthrough?: () => void;
}

export function ProjectCard({
  project,
  currentSteps,
  isCompleted,
  isBoostedThisTurn,
  isExpanded,
  isBreakthrough = false,
  canAfford,
  hasAvailableQuota,
  isSubmitting,
  onToggleExpand,
  onBoost,
  onDismissBreakthrough,
}: ProjectCardProps) {
  if (isBreakthrough && onDismissBreakthrough) {
    return (
      <ProjectBreakthroughCardOverlay
        projectName={project.nameFa}
        onDismiss={onDismissBreakthrough}
      />
    );
  }

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
      className={`rounded-3xl border transition-all duration-300 font-sans dir-rtl text-right overflow-hidden shadow-md ${
        isCompleted
          ? "bg-emerald-950/20 border-emerald-500/40 ring-1 ring-emerald-500/20"
          : isBoostedThisTurn
            ? "bg-primary/10 border-primary/50 shadow-primary/10 ring-1 ring-primary/20"
            : "bg-card/90 border-border/80 hover:border-primary/40 hover:bg-secondary/40 hover:shadow-xl"
      }`}
    >
      <div
        onClick={onToggleExpand}
        className="p-4 md:p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
      >
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0 shadow-sm ${
              isCompleted
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                : isBoostedThisTurn
                  ? "bg-primary/20 text-primary border-primary/40"
                  : "bg-secondary text-foreground border-border/70"
            }`}
          >
            <Icon size={19} />
          </div>

          <div className="flex items-center gap-2.5 truncate">
            <span className="text-sm md:text-base font-black text-foreground tracking-tight truncate">
              {project.nameFa}
            </span>

            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border bg-secondary/80 text-gdp border-gdp/30 shrink-0">
              {PersianNumberFormatter.formatCurrency(project.costPerStep, true)}{" "}
              / گام
            </span>

            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border shrink-0 ${
                project.tier === "SHORT_TERM"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : project.tier === "MID_TERM"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/30"
              }`}
            >
              {project.tier === "SHORT_TERM"
                ? "۱۰ گام"
                : project.tier === "MID_TERM"
                  ? "۲۰ گام"
                  : "۳۰ گام"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3.5 shrink-0">
          <div className="hidden md:flex flex-col items-end gap-1.5 w-36 font-mono">
            <span className="text-xs text-muted-foreground font-bold">
              گام {PersianNumberFormatter.toPersianDigits(clampedSteps)} از{" "}
              {PersianNumberFormatter.toPersianDigits(
                project.totalStepsRequired,
              )}
            </span>
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden border border-border/40">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isCompleted
                    ? "bg-emerald-400"
                    : isBoostedThisTurn
                      ? "bg-primary"
                      : "bg-gdp"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            {isCompleted ? (
              <div className="px-3.5 py-2 bg-emerald-950/40 text-emerald-400 border border-emerald-500/40 rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 size={15} />
                <span>فعال و مستقر</span>
              </div>
            ) : isBoostedThisTurn ? (
              <div className="px-3.5 py-2 bg-primary/20 text-primary border border-primary/30 rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-sm">
                <Check size={15} strokeWidth={3} />
                <span>انجام شد</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onBoost(project)}
                disabled={isButtonDisabled}
                className="py-2.5 px-4 bg-primary hover:bg-primary/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded-2xl text-xs font-black transition-all cursor-pointer shadow-md shadow-primary/20 flex items-center gap-1.5 border border-primary/40 disabled:border-border/60"
              >
                {!hasAvailableQuota ? (
                  <Lock size={13} />
                ) : (
                  <Plus size={14} strokeWidth={3} />
                )}
                <span>تزریق بودجه</span>
              </button>
            )}
          </div>

          <div className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronDown
              size={18}
              className={`transition-transform duration-300 ${
                isExpanded ? "rotate-180 text-primary" : ""
              }`}
            />
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-5 pb-5 pt-3 border-t border-border/50 bg-background/50 space-y-3 animate-fade-smooth text-xs">
          <div className="space-y-1.5 bg-secondary/40 p-4 rounded-2xl border border-border/60 shadow-inner">
            <span className="text-[11px] font-mono font-bold text-primary block">
              {project.taglineFa}
            </span>
            <p className="text-xs md:text-sm text-foreground/90 leading-relaxed font-sans font-medium">
              {project.descriptionFa}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
