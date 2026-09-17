"use client";

import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Factory,
  Cpu,
  Package,
  Swords,
  Plus,
  CheckCircle2,
  Lock,
  Sparkles,
} from "lucide-react";
import {
  NationalProjectConfig,
  NationalProjectEffectApplierUtility,
} from "@geopolitics/domain";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

interface ProjectCardProps {
  project: NationalProjectConfig;
  currentSteps: number;
  isBoostedThisTurn: boolean;
  canAfford: boolean;
  hasAvailableQuota: boolean;
  isSubmitting: boolean;
  onBoost: (project: NationalProjectConfig) => void;
}

export function ProjectCard({
  project,
  currentSteps,
  isBoostedThisTurn,
  canAfford,
  hasAvailableQuota,
  isSubmitting,
  onBoost,
}: ProjectCardProps) {
  const t = useTranslations("projects");
  const { toDigits, formatCurrency } = useLocaleFormatter();

  const currentLevel =
    NationalProjectEffectApplierUtility.getProjectLevel(currentSteps);
  const nextMilestone =
    NationalProjectEffectApplierUtility.getNextMilestoneStep(currentSteps);
  const isCompleted = currentSteps >= project.totalStepsRequired;

  const getVisual = () => {
    switch (project.category) {
      case "INDUSTRY":
        return {
          icon: Factory,
          color: "text-emerald-400",
          border: "border-emerald-500/40",
          bg: "bg-emerald-500/15",
          ring: "ring-emerald-500/20",
          progressColor: "bg-emerald-400",
          glow: "via-emerald-500/30",
        };
      case "RESEARCH":
        return {
          icon: Cpu,
          color: "text-primary",
          border: "border-primary/40",
          bg: "bg-primary/15",
          ring: "ring-primary/20",
          progressColor: "bg-primary",
          glow: "via-primary/30",
        };
      case "LOGISTICS":
        return {
          icon: Package,
          color: "text-amber-400",
          border: "border-amber-500/40",
          bg: "bg-amber-500/15",
          ring: "ring-amber-500/20",
          progressColor: "bg-amber-400",
          glow: "via-amber-500/30",
        };
      case "MILITARY":
      default:
        return {
          icon: Swords,
          color: "text-rose-400",
          border: "border-rose-500/40",
          bg: "bg-rose-500/15",
          ring: "ring-rose-500/20",
          progressColor: "bg-rose-500",
          glow: "via-rose-500/30",
        };
    }
  };

  const visual = useMemo(() => getVisual(), [project.category]);
  const Icon = visual.icon;

  const nextBonusText = useMemo(() => {
    if (nextMilestone === 10) {
      return t(`${project.id}.milestone1`);
    }
    if (nextMilestone === 20) {
      return t(`${project.id}.milestone2`);
    }
    if (nextMilestone === 30) {
      return t(`${project.id}.milestone3`);
    }
    return t("maxLevelReached");
  }, [nextMilestone, project.id, t]);

  const isButtonDisabled =
    isCompleted ||
    isBoostedThisTurn ||
    !canAfford ||
    !hasAvailableQuota ||
    isSubmitting;

  return (
    <div
      className={`rounded-3xl border ${visual.border} bg-card/95 p-4 sm:p-4.5 md:p-5 flex flex-col justify-between space-y-3.5 shadow-xl backdrop-blur-2xl transition-all duration-300 relative overflow-hidden ring-1 ${visual.ring}`}
    >
      <div
        className={`absolute top-0 start-0 end-0 h-1 bg-gradient-to-r from-transparent ${visual.glow} to-transparent`}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-inner shrink-0 ${visual.bg} ${visual.border} ${visual.color}`}
            >
              <Icon size={20} className="animate-pulse" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs sm:text-sm font-black text-foreground tracking-tight">
                {t(`${project.id}.name`)}
              </h4>
              <span
                className={`text-[10px] sm:text-[11px] font-bold ${visual.color} block`}
              >
                {t(`${project.id}.tagline`)}
              </span>
            </div>
          </div>

          <span
            className={`px-2.5 py-0.5 rounded-xl text-[10px] sm:text-xs font-black font-mono border shrink-0 ${
              currentLevel > 0
                ? `${visual.bg} ${visual.border} ${visual.color} shadow-sm`
                : "bg-secondary text-muted-foreground border-border/70"
            }`}
          >
            {currentLevel > 0
              ? t("levelBadge", { level: toDigits(currentLevel) })
              : t("inactiveLevel")}
          </span>
        </div>

        <div className="space-y-2 pt-0.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[10px] sm:text-[11px] text-muted-foreground font-sans font-medium">
              {nextMilestone
                ? t("nextMilestone", {
                    step: toDigits(nextMilestone),
                    bonus: nextBonusText,
                  })
                : t("maxLevelReached")}
            </span>
            <span className="font-bold text-foreground text-[11px] sm:text-xs">
              {t("stepCounter", {
                current: toDigits(currentSteps),
                total: toDigits(project.totalStepsRequired),
              })}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { level: 1, step: 10, bonus: t(`${project.id}.milestone1`) },
              { level: 2, step: 20, bonus: t(`${project.id}.milestone2`) },
              { level: 3, step: 30, bonus: t(`${project.id}.milestone3`) },
            ].map((m) => {
              const isUnlocked = currentSteps >= m.step;
              const isCurrentTarget = nextMilestone === m.step && !isUnlocked;
              return (
                <div
                  key={m.level}
                  className={`p-2 rounded-xl border text-center font-mono space-y-0.5 transition-all ${
                    isUnlocked
                      ? `${visual.bg} ${visual.border} ${visual.color} shadow-sm`
                      : isCurrentTarget
                        ? "bg-secondary/80 border-primary/40 text-foreground ring-1 ring-primary/20"
                        : "bg-secondary/30 border-border/40 text-muted-foreground opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 text-[10px] font-bold">
                    {isUnlocked && <Sparkles size={10} />}
                    <span>{t("milestoneTag", { step: toDigits(m.step) })}</span>
                  </div>
                  <span className="text-[9px] font-sans font-bold block truncate">
                    {m.bonus}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="w-full bg-secondary/80 h-2 rounded-full overflow-hidden border border-border/50 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${visual.progressColor} shadow-sm`}
              style={{
                width: `${Math.min(
                  100,
                  (currentSteps / project.totalStepsRequired) * 100,
                )}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-3">
        <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground">
          {formatCurrency(project.costPerStep, true)} / {t("stepCost")}
        </span>

        {isCompleted ? (
          <div className="py-2 px-3.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-2xl text-[11px] sm:text-xs font-black flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 size={13} />
            <span>{t("maxedOut")}</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onBoost(project)}
            disabled={isButtonDisabled}
            className={`py-2 px-3.5 text-white rounded-2xl text-[11px] sm:text-xs font-black transition-all cursor-pointer shadow-md flex items-center gap-1.5 border hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none ${
              visual.bg
            } ${visual.border} bg-opacity-80 hover:bg-opacity-100`}
          >
            {!hasAvailableQuota ? (
              <Lock size={12} />
            ) : (
              <Plus size={13} strokeWidth={3} />
            )}
            <span>{t("injectBudget")}</span>
          </button>
        )}
      </div>
    </div>
  );
}
