import React from "react";
import { Nation } from "@/domain/nation/nation.schema";
import { useNationalProjects } from "./projects/hooks/use-national-projects";
import { ProjectQuotaHeader } from "./projects/components/project-quota-header";
import { ProjectCard } from "./projects/components/project-card";
import { ProjectBreakthroughModal } from "./projects/components/project-breakthrough-modal";
import { Layers } from "lucide-react";
import { NationalProjectEffectApplierUtility } from "@geopolitics/domain";

interface WideProjectsViewProps {
  nation: Nation;
}

export function WideProjectsView({ nation }: WideProjectsViewProps) {
  const {
    selectedTierFilter,
    setSelectedTierFilter,
    expandedProjectId,
    toggleExpand,
    completedIds,
    boostedThisTurn,
    progressSteps,
    remainingQuota,
    filteredProjects,
    isSubmitting,
    breakthroughProject,
    closeBreakthroughModal,
    handleBoostProject,
  } = useNationalProjects(nation);

  return (
    <div className="space-y-5 dir-rtl text-right font-sans animate-fade-smooth pb-6">
      <ProjectQuotaHeader
        treasury={nation.treasury}
        boostedCountThisTurn={boostedThisTurn.length}
        maxBoostsPerTurn={
          NationalProjectEffectApplierUtility.MAX_BOOSTS_PER_TURN
        }
      />

      <div className="space-y-3.5 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-primary" />
            <h3 className="text-sm font-black text-foreground">
              فهرست برنامه‌ها و پژوهش‌های راهبردی کشور
            </h3>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-secondary/60 border border-border/80 rounded-2xl w-fit text-xs">
            {[
              { id: "ALL" as const, label: "همه طرح‌ها" },
              { id: "SHORT_TERM" as const, label: "کوتاه‌مدت" },
              { id: "MID_TERM" as const, label: "میان‌مدت" },
              { id: "LONG_TERM" as const, label: "ابرپروژه‌ها" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedTierFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
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

        <div className="space-y-2.5">
          {filteredProjects.map((project) => {
            const isCompleted = completedIds.includes(project.id);
            const isBoostedThisTurn = boostedThisTurn.includes(project.id);
            const currentSteps = progressSteps[project.id] || 0;
            const canAfford = nation.treasury >= project.costPerStep;
            const isExpanded = expandedProjectId === project.id;

            return (
              <ProjectCard
                key={project.id}
                project={project}
                currentSteps={currentSteps}
                isCompleted={isCompleted}
                isBoostedThisTurn={isBoostedThisTurn}
                isExpanded={isExpanded}
                canAfford={canAfford}
                hasAvailableQuota={remainingQuota > 0}
                isSubmitting={isSubmitting}
                onToggleExpand={() => toggleExpand(project.id)}
                onBoost={handleBoostProject}
              />
            );
          })}
        </div>
      </div>

      <ProjectBreakthroughModal
        isOpen={Boolean(breakthroughProject)}
        project={breakthroughProject}
        onClose={closeBreakthroughModal}
      />
    </div>
  );
}
