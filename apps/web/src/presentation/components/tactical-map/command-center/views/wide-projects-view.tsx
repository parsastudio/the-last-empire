import React from "react";
import { Nation } from "@/domain/nation/nation.schema";
import { useNationalProjects } from "./projects/hooks/use-national-projects";
import { ProjectQuotaHeader } from "./projects/components/project-quota-header";
import { ProjectCard } from "./projects/components/project-card";
import { Layers } from "lucide-react";
import { NationalProjectEffectApplierUtility } from "@geopolitics/domain";

interface WideProjectsViewProps {
  nation: Nation;
}

export function WideProjectsView({ nation }: WideProjectsViewProps) {
  const {
    selectedTierFilter,
    setSelectedTierFilter,
    completedIds,
    boostedThisTurn,
    progressSteps,
    remainingQuota,
    filteredProjects,
    isSubmitting,
    handleBoostProject,
  } = useNationalProjects(nation);

  return (
    <div className="space-y-6 dir-rtl text-right font-sans animate-fade-smooth pb-6">
      <ProjectQuotaHeader
        treasury={nation.treasury}
        boostedCountThisTurn={boostedThisTurn.length}
        maxBoostsPerTurn={
          NationalProjectEffectApplierUtility.MAX_BOOSTS_PER_TURN
        }
      />

      <div className="space-y-4 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-primary" />
            <h3 className="text-xs font-black text-foreground">
              فهرست جامع برنامه‌های راهبردی و فناوری‌های تمدنی
            </h3>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-secondary/50 border border-border/80 rounded-2xl w-fit">
            {[
              { id: "ALL" as const, label: "همه پروژه‌ها" },
              { id: "SHORT_TERM" as const, label: "کوتاه‌مدت (۱۰ گام)" },
              { id: "MID_TERM" as const, label: "میان‌مدت (۲۰ گام)" },
              { id: "LONG_TERM" as const, label: "ابرپروژه‌ها (۳۰ گام)" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedTierFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedTierFilter === tab.id
                    ? "bg-card text-foreground shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => {
            const isCompleted = completedIds.includes(project.id);
            const isBoostedThisTurn = boostedThisTurn.includes(project.id);
            const currentSteps = progressSteps[project.id] || 0;
            const canAfford = nation.treasury >= project.costPerStep;

            return (
              <ProjectCard
                key={project.id}
                project={project}
                currentSteps={currentSteps}
                isCompleted={isCompleted}
                isBoostedThisTurn={isBoostedThisTurn}
                canAfford={canAfford}
                hasAvailableQuota={remainingQuota > 0}
                isSubmitting={isSubmitting}
                onBoost={handleBoostProject}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
