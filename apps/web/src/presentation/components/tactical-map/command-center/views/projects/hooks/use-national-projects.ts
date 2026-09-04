import { useState, useMemo, useCallback } from "react";
import {
  Nation,
  NATIONAL_PROJECTS_CATALOG,
  NationalProjectConfig,
  NationalProjectEffectApplierUtility,
  ProjectScopeTier,
} from "@geopolitics/domain";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
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

export function useNationalProjects(nation: Nation) {
  const [selectedTierFilter, setSelectedTierFilter] = useState<
    ProjectScopeTier | "ALL"
  >("ALL");
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(
    null,
  );
  const [breakthroughProject, setBreakthroughProject] =
    useState<NationalProjectConfig | null>(null);

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

  const remainingQuota = Math.max(
    0,
    NationalProjectEffectApplierUtility.MAX_BOOSTS_PER_TURN -
      boostedThisTurn.length,
  );

  const filteredProjects = useMemo(() => {
    return NATIONAL_PROJECTS_CATALOG.filter((project) => {
      if (selectedTierFilter === "ALL") return true;
      return project.tier === selectedTierFilter;
    });
  }, [selectedTierFilter]);

  const toggleExpand = useCallback((projectId: string) => {
    setExpandedProjectId((prev) => (prev === projectId ? null : projectId));
  }, []);

  const closeBreakthroughModal = useCallback(() => {
    setBreakthroughProject(null);
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
          setBreakthroughProject(project);
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
    breakthroughProject,
    closeBreakthroughModal,
    handleBoostProject,
  };
}
