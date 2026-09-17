import React from "react";
import { Nation, NationTurnActivity } from "@geopolitics/domain";
import { useNationalProjects } from "./projects/hooks/use-national-projects";
import { ProjectQuotaHeader } from "./projects/components/project-quota-header";
import { ProjectCard } from "./projects/components/project-card";
import { NationalProjectEffectApplierUtility } from "@geopolitics/domain";

interface WideProjectsViewProps {
  nation: Nation;
  turnActivity?: NationTurnActivity;
}

export function WideProjectsView({
  nation,
  turnActivity,
}: WideProjectsViewProps) {
  const {
    projects,
    boostedThisTurn,
    progressSteps,
    remainingQuota,
    isSubmitting,
    handleBoostProject,
  } = useNationalProjects(nation, turnActivity);

  return (
    <div className="space-y-5 text-start font-sans animate-fade-smooth pb-6">
      <ProjectQuotaHeader
        treasury={nation.treasury}
        boostedCountThisTurn={boostedThisTurn.length}
        maxBoostsPerTurn={
          NationalProjectEffectApplierUtility.MAX_BOOSTS_PER_TURN
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {projects.map((project) => {
          const currentSteps = progressSteps[project.id] || 0;
          const isBoostedThisTurn = boostedThisTurn.includes(project.id);
          const canAfford = nation.treasury >= project.costPerStep;

          return (
            <ProjectCard
              key={project.id}
              project={project}
              currentSteps={currentSteps}
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
  );
}
