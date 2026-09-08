"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Nation,
  NATIONAL_PROJECTS_CATALOG,
  NationalProjectConfig,
  NationalProjectEffectApplierUtility,
  ProjectScopeTier,
  ActionFactory,
} from "@geopolitics/domain";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { TacticalSound } from "@/presentation/utils/tactical-sound";
import { TacticalEffects } from "@/presentation/utils/tactical-effects";
import { useToast } from "@/presentation/context/toast-context";

interface BoostActionResultData {
  projectId: string;
  projectName: string;
  currentStep: number;
  totalSteps: number;
  isCompleted: boolean;
  isEarlyBreakthrough: boolean;
}

const TIER_SORT_WEIGHT: Record<ProjectScopeTier, number> = {
  SHORT_TERM: 1,
  MID_TERM: 2,
  LONG_TERM: 3,
};

function getProjectSortGroup(
  projectId: string,
  completedIds: string[],
  progressSteps: Record<string, number>,
): number {
  if (completedIds.includes(projectId)) {
    return 2;
  }
  const steps = progressSteps[projectId] || 0;
  if (steps > 0) {
    return 0;
  }
  return 1;
}

function computeOrderedProjects(
  completedIds: string[],
  progressSteps: Record<string, number>,
): NationalProjectConfig[] {
  const indexed = NATIONAL_PROJECTS_CATALOG.map((project, index) => ({
    project,
    index,
  }));

  indexed.sort((a, b) => {
    const groupA = getProjectSortGroup(
      a.project.id,
      completedIds,
      progressSteps,
    );
    const groupB = getProjectSortGroup(
      b.project.id,
      completedIds,
      progressSteps,
    );

    if (groupA !== groupB) {
      return groupA - groupB;
    }

    const tierA = TIER_SORT_WEIGHT[a.project.tier];
    const tierB = TIER_SORT_WEIGHT[b.project.tier];

    if (tierA !== tierB) {
      return tierA - tierB;
    }

    if (groupA === 0) {
      const stepA = progressSteps[a.project.id] || 0;
      const stepB = progressSteps[b.project.id] || 0;
      if (stepB !== stepA) {
        return stepB - stepA;
      }
    }

    return a.index - b.index;
  });

  return indexed.map((item) => item.project);
}

export function useNationalProjects(nation: Nation) {
  const [selectedTierFilter, setSelectedTierFilter] = useState<
    ProjectScopeTier | "ALL"
  >("ALL");
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(
    null,
  );
  const [breakthroughProjectId, setBreakthroughProjectId] = useState<
    string | null
  >(null);

  const { dispatchAction, isSubmitting } = useGameActions();
  const { showToast } = useToast();

  const completedIds = useMemo(
    () => nation.completedProjectIds || [],
    [nation.completedProjectIds],
  );

  const boostedThisTurn = useMemo(
    () => nation.boostedProjectIdsThisTurn || [],
    [nation.boostedProjectIdsThisTurn],
  );

  const progressSteps = useMemo(
    () => nation.projectProgressSteps || {},
    [nation.projectProgressSteps],
  );

  const [orderedProjectsSnapshot] = useState<NationalProjectConfig[]>(() =>
    computeOrderedProjects(
      nation.completedProjectIds || [],
      nation.projectProgressSteps || {},
    ),
  );

  const remainingQuota = Math.max(
    0,
    NationalProjectEffectApplierUtility.MAX_BOOSTS_PER_TURN -
      boostedThisTurn.length,
  );

  const filteredProjects = useMemo(() => {
    return orderedProjectsSnapshot.filter((project) => {
      if (selectedTierFilter === "ALL") return true;
      return project.tier === selectedTierFilter;
    });
  }, [orderedProjectsSnapshot, selectedTierFilter]);

  const toggleExpand = useCallback((projectId: string) => {
    setExpandedProjectId((prev) => (prev === projectId ? null : projectId));
  }, []);

  const dismissBreakthrough = useCallback(() => {
    setBreakthroughProjectId(null);
  }, []);

  const handleBoostProject = useCallback(
    async (project: NationalProjectConfig) => {
      if (
        remainingQuota <= 0 ||
        boostedThisTurn.includes(project.id) ||
        nation.treasury < project.costPerStep ||
        isSubmitting
      ) {
        return;
      }

      TacticalSound.playCoinSound();
      const action = ActionFactory.boostProject(nation.id, project.id);
      const res = await dispatchAction(action);

      if (res.success && res.resultData) {
        const data = res.resultData as BoostActionResultData;
        if (data.isEarlyBreakthrough) {
          TacticalEffects.fireVictoryConfetti(180);
          TacticalSound.playCoinSound();
          setBreakthroughProjectId(project.id);
        } else if (data.isCompleted) {
          TacticalEffects.fireVictoryConfetti(120);
          showToast(
            "تکمیل پروژه راهبردی ملی",
            `پروژه «${project.nameFa}» با موفقیت به پایان رسید و امتیازات آن فعال شد.`,
            "success",
          );
        }
      }
    },
    [
      nation.id,
      nation.treasury,
      remainingQuota,
      boostedThisTurn,
      isSubmitting,
      dispatchAction,
      showToast,
    ],
  );

  return {
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
    breakthroughProjectId,
    dismissBreakthrough,
    handleBoostProject,
  };
}
