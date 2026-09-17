"use client";

import { useMemo, useCallback } from "react";
import {
  Nation,
  NATIONAL_PROJECTS_CATALOG,
  NationalProjectConfig,
  NationalProjectEffectApplierUtility,
  ActionFactory,
  NationTurnActivity,
} from "@geopolitics/domain";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { TacticalEffects } from "@/presentation/utils/tactical-effects";

export function useNationalProjects(
  nation: Nation,
  turnActivity?: NationTurnActivity,
) {
  const { dispatchAction, isSubmitting } = useGameActions();

  const boostedThisTurn = useMemo(
    () => turnActivity?.boostedProjectIds ?? [],
    [turnActivity?.boostedProjectIds],
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

      const action = ActionFactory.boostProject(nation.id, project.id);
      const res = await dispatchAction(action);

      if (res.success && res.resultData) {
        const data = res.resultData as {
          isMilestoneReached?: boolean;
          isCompleted?: boolean;
        };
        if (data.isCompleted) {
          TacticalEffects.fireVictoryConfetti(140);
        } else if (data.isMilestoneReached) {
          TacticalEffects.fireVictoryConfetti(80);
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
    ],
  );

  return {
    projects: NATIONAL_PROJECTS_CATALOG,
    boostedThisTurn,
    progressSteps,
    remainingQuota,
    isSubmitting,
    handleBoostProject,
  };
}
