import React from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("projects");

  const projectName = t(`${project.id}.name`);
  const projectTagline = t(`${project.id}.tagline`);
  const projectDescription = t(`${project.id}.description`);

  if (isBreakthrough && onDismissBreakthrough) {
    return (
      <ProjectBreakthroughCardOverlay
        projectName={projectName}
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

  const isButtonDisabled =
    isCompleted ||
    isBoostedThisTurn ||
    !canAfford ||
    !hasAvailableQuota ||
    isSubmitting;

  return (
    <div
      className={`rounded-3xl border transition-all duration-300 font-sans dir-rtl text-right overflow-hidden shadow-md backdrop-blur-xl relative ${
        isCompleted
          ? "bg-emerald-950/20 border-emerald-500/40 ring-1 ring-emerald-500/20 shadow-emerald-950/30"
          : isBoostedThisTurn
            ? "bg-primary/10 border-primary/50 shadow-primary/10 ring-1 ring-primary/20"
            : "bg-card/90 border-border/80 hover:border-primary/40 hover:bg-secondary/40 hover:shadow-xl ring-1 ring-white/5"
      }`}
    >
      <div
        onClick={onToggleExpand}
        className="p-4 md:p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
      >
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0 shadow-md ${
              isCompleted
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-emerald-500/10"
                : isBoostedThisTurn
                  ? "bg-primary/20 text-primary border-primary/40 shadow-primary/10"
                  : "bg-secondary text-foreground border-border/70"
            }`}
          >
            <Icon size={19} />
          </div>

          <div className="flex items-center gap-2.5 truncate">
            <span className="text-sm md:text-base font-black text-foreground tracking-tight truncate">
              {projectName}
            </span>

            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-lg border bg-secondary/80 text-gdp border-gdp/30 shrink-0 shadow-inner">
              {PersianNumberFormatter.formatCurrency(project.costPerStep, true)}{" "}
              / {t("stepCost")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3.5 shrink-0">
          <div className="hidden md:flex flex-col items-end gap-1.5 w-40 font-mono">
            <span className="text-xs text-muted-foreground font-bold">
              {t("stepCounter", {
                current: PersianNumberFormatter.toPersianDigits(clampedSteps),
                total: PersianNumberFormatter.toPersianDigits(
                  project.totalStepsRequired,
                ),
              })}
            </span>

            <div className="w-full flex items-center gap-0.5 bg-secondary/80 p-0.5 rounded-full border border-border/50 shadow-inner">
              {Array.from({ length: project.totalStepsRequired }).map(
                (_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                      idx < clampedSteps
                        ? isCompleted
                          ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"
                          : isBoostedThisTurn
                            ? "bg-primary shadow-[0_0_6px_rgba(59,130,246,0.8)]"
                            : "bg-gdp shadow-[0_0_6px_rgba(16,185,129,0.8)]"
                        : "bg-background/60"
                    }`}
                  />
                ),
              )}
            </div>
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            {isCompleted ? (
              <div className="px-3.5 py-2 bg-emerald-950/40 text-emerald-400 border border-emerald-500/40 rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 size={15} />
                <span>{t("activeAndDeployed")}</span>
              </div>
            ) : isBoostedThisTurn ? (
              <div className="px-3.5 py-2 bg-primary/20 text-primary border border-primary/30 rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-sm">
                <Check size={15} strokeWidth={3} />
                <span>{t("completed")}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onBoost(project)}
                disabled={isButtonDisabled}
                className="py-2.5 px-4 bg-primary hover:bg-primary/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded-2xl text-xs font-black transition-all cursor-pointer shadow-md shadow-primary/20 flex items-center gap-1.5 border border-primary/40 disabled:border-border/60 hover:scale-[1.02] active:scale-[0.98]"
              >
                {!hasAvailableQuota ? (
                  <Lock size={13} />
                ) : (
                  <Plus size={14} strokeWidth={3} />
                )}
                <span>{t("injectBudget")}</span>
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
              {projectTagline}
            </span>
            <p className="text-xs md:text-sm text-foreground/90 leading-relaxed font-sans font-medium">
              {projectDescription}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
