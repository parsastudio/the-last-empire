"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Nation,
  GameState,
  ActionFactory,
  CountryRegistry,
  BattleFullReportData,
} from "@geopolitics/domain";
import { AttackDeploymentOptimizer } from "@geopolitics/game-engine";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { useUiStore } from "@/presentation/stores/use-ui-store";
import { useToast } from "@/presentation/context/toast-context";
import { TacticalEffects } from "@/presentation/utils/tactical-effects";
import { DirectAttackSelector } from "@/presentation/selectors/direct-attack.selector";
import { TacticalSound } from "@/presentation/utils/tactical-sound";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

interface UseDirectAttackFormProps {
  targetNationId: string | null;
  targetProvinceId: number | null;
  humanNation: Nation | null;
  gameState: GameState | null;
  isOpen: boolean;
  onClose: () => void;
}

export function useDirectAttackForm({
  targetNationId,
  targetProvinceId,
  humanNation,
  gameState,
  isOpen,
  onClose,
}: UseDirectAttackFormProps) {
  const tAlerts = useTranslations("attack.alerts");
  const tAttack = useTranslations("attack");
  const { formatCountryName, formatProvinceName } = useLocaleFormatter();
  const { dispatchAction, isSubmitting } = useGameActions();
  const { showToast } = useToast();
  const openModal = useUiStore((state) => state.openModal);

  const [infantryToDeploy, setInfantryToDeploy] = useState<number>(1);
  const [armorToDeploy, setArmorToDeploy] = useState<number>(0);
  const [airForceToDeploy, setAirForceToDeploy] = useState<number>(0);
  const [dronesToLaunch, setDronesToLaunch] = useState<number>(0);
  const [isExecutingRecon, setIsExecutingRecon] = useState<boolean>(false);

  const canonicalTargetId = useMemo(() => {
    return targetNationId
      ? CountryRegistry.resolveCanonicalId(targetNationId)
      : null;
  }, [targetNationId]);

  const targetNation = useMemo(() => {
    if (!gameState || !canonicalTargetId) return null;
    return gameState.nations[canonicalTargetId] || null;
  }, [gameState, canonicalTargetId]);

  const hasAlreadyAttackedThisTurn = useMemo(() => {
    if (!humanNation || !canonicalTargetId || !gameState) return false;
    const attackedList =
      gameState.turnActivity?.[humanNation.id]?.attackedTargetIds ?? [];
    return attackedList.includes(canonicalTargetId);
  }, [humanNation, canonicalTargetId, gameState]);

  const targetGuarantorNation = useMemo(() => {
    if (
      !gameState ||
      !targetNation?.securityGuarantorId ||
      !targetNation.isEmergencyProtectorate
    ) {
      return null;
    }
    const guarantorCanonical = CountryRegistry.resolveCanonicalId(
      targetNation.securityGuarantorId,
    );
    return gameState.nations[guarantorCanonical] || null;
  }, [gameState, targetNation]);

  const reach = useMemo(() => {
    return DirectAttackSelector.selectReach(
      humanNation,
      targetProvinceId,
      gameState,
    );
  }, [humanNation, targetProvinceId, gameState]);

  const targetRegionName = useMemo(() => {
    if (targetProvinceId) {
      return formatProvinceName(targetProvinceId);
    }
    const defenderName = formatCountryName(targetNation);
    return targetNation
      ? tAttack("regions.mainlandOf", { name: defenderName })
      : "";
  }, [
    targetProvinceId,
    targetNation,
    formatProvinceName,
    formatCountryName,
    tAttack,
  ]);

  useEffect(() => {
    if (isOpen && humanNation) {
      const availInf = humanNation.military.infantry || 0;
      const availArm = humanNation.military.armor || 0;
      const availAir = humanNation.military.airForce || 0;
      const availDrone = humanNation.military.droneMissile || 0;

      setInfantryToDeploy(
        Math.max(1, Math.min(availInf, Math.ceil(availInf * 0.75))),
      );
      setArmorToDeploy(Math.min(availArm, Math.ceil(availArm * 0.75)));
      setAirForceToDeploy(Math.min(availAir, Math.ceil(availAir * 0.75)));
      setDronesToLaunch(Math.min(availDrone, Math.ceil(availDrone * 0.75)));
    }
  }, [isOpen, canonicalTargetId, targetProvinceId, humanNation]);

  const penalty = useMemo(() => {
    return DirectAttackSelector.selectPenalty(humanNation, targetNation);
  }, [humanNation, targetNation]);

  const guarantorIds = useMemo(() => {
    return DirectAttackSelector.selectGuarantors(
      humanNation,
      targetNation,
      gameState,
      penalty.isWarStance,
    );
  }, [humanNation, targetNation, gameState, penalty.isWarStance]);

  const activeGuarantorNames = useMemo(
    () => guarantorIds.activeGuarantorIds.map((id) => formatCountryName(id)),
    [guarantorIds.activeGuarantorIds, formatCountryName],
  );

  const mutualGuarantorNames = useMemo(
    () => guarantorIds.mutualGuarantorIds.map((id) => formatCountryName(id)),
    [guarantorIds.mutualGuarantorIds, formatCountryName],
  );

  const partnerGuarantorNames = useMemo(
    () => guarantorIds.partnerGuarantorIds.map((id) => formatCountryName(id)),
    [guarantorIds.partnerGuarantorIds, formatCountryName],
  );

  const logistics = useMemo(() => {
    return DirectAttackSelector.selectLogistics(
      humanNation,
      infantryToDeploy,
      armorToDeploy,
      airForceToDeploy,
      dronesToLaunch,
      reach.attackType,
    );
  }, [
    humanNation,
    infantryToDeploy,
    armorToDeploy,
    airForceToDeploy,
    dronesToLaunch,
    reach.attackType,
  ]);

  const recon = useMemo(() => {
    return DirectAttackSelector.selectRecon(
      humanNation,
      targetNation,
      gameState?.provinces,
      humanNation && gameState
        ? gameState.turnActivity?.[humanNation.id]
        : undefined,
    );
  }, [humanNation, targetNation, gameState]);

  const forecast = useMemo(() => {
    return DirectAttackSelector.selectForecast(
      humanNation,
      targetNation,
      targetGuarantorNation,
      dronesToLaunch,
      infantryToDeploy,
      armorToDeploy,
      airForceToDeploy,
      gameState?.provinces,
    );
  }, [
    humanNation,
    targetNation,
    targetGuarantorNation,
    dronesToLaunch,
    infantryToDeploy,
    armorToDeploy,
    airForceToDeploy,
    gameState?.provinces,
  ]);

  const handleExecuteQuickRecon = useCallback(async () => {
    if (
      !humanNation ||
      !targetNation ||
      isExecutingRecon ||
      !recon.canAffordRecon
    ) {
      return;
    }
    try {
      setIsExecutingRecon(true);
      const action = ActionFactory.executeEspionage(
        humanNation.id,
        targetNation.id,
        1,
      );
      await dispatchAction(action);
    } finally {
      setIsExecutingRecon(false);
    }
  }, [
    humanNation,
    targetNation,
    isExecutingRecon,
    recon.canAffordRecon,
    dispatchAction,
  ]);

  const handleAutoOptimizeDeploy = useCallback(() => {
    if (!humanNation || !targetNation) return;

    TacticalSound.playUiClick();
    const result = AttackDeploymentOptimizer.calculateOptimalDeployment(
      humanNation,
      targetNation,
      gameState?.provinces,
      targetGuarantorNation,
      reach.attackType,
      logistics.navalFleetCount,
    );

    setDronesToLaunch(result.drones);
    setAirForceToDeploy(result.airForce);
    setArmorToDeploy(result.armor);
    setInfantryToDeploy(result.infantry);

    if (!result.isPossible) {
      showToast(
        tAlerts("impossibleVictoryTitle"),
        tAlerts("impossibleVictoryDesc"),
        "warning",
      );
    }
  }, [
    humanNation,
    targetNation,
    gameState?.provinces,
    targetGuarantorNation,
    reach.attackType,
    logistics.navalFleetCount,
    showToast,
    tAlerts,
  ]);

  const handleExecuteAttack = useCallback(async () => {
    if (
      !humanNation ||
      !targetNation ||
      isSubmitting ||
      hasAlreadyAttackedThisTurn ||
      !logistics.hasNavalCapacity
    ) {
      return;
    }

    const action = ActionFactory.initiateBattle(
      humanNation.id,
      targetNation.id,
      dronesToLaunch,
      infantryToDeploy,
      armorToDeploy,
      airForceToDeploy,
      targetProvinceId || undefined,
      reach.attackType,
    );

    const res = await dispatchAction(action);

    if (res.success) {
      onClose();
      if (res.resultData) {
        const report = res.resultData as BattleFullReportData;
        openModal({
          type: "BATTLE_DEBRIEF",
          reportData: report,
        });

        if (report.isAttackerVictory) {
          TacticalEffects.fireVictoryConfetti(160);
        }
      }
    }
  }, [
    humanNation,
    targetNation,
    isSubmitting,
    hasAlreadyAttackedThisTurn,
    logistics.hasNavalCapacity,
    dronesToLaunch,
    infantryToDeploy,
    armorToDeploy,
    airForceToDeploy,
    targetProvinceId,
    reach.attackType,
    dispatchAction,
    onClose,
    openModal,
  ]);

  return {
    targetNation,
    targetProvinceId: reach.targetProvinceId,
    isLandNeighbor: reach.isLandNeighbor,
    isNavalValid: reach.isNavalValid,
    attackType: reach.attackType,
    targetRegionName,
    currentStance: penalty.currentStance,
    isWarStance: penalty.isWarStance,
    reputationPenalty: penalty.reputationPenalty,
    activeGuarantorNames,
    mutualGuarantorNames,
    partnerGuarantorNames,
    navalFleetCount: logistics.navalFleetCount,
    hasNavalCapacity: logistics.hasNavalCapacity,
    totalLogisticsCost: logistics.totalLogisticsCost,
    canAfford: logistics.canAfford,
    hasSelectedInfantry: logistics.hasSelectedInfantry,
    isReconActive: recon.isReconActive,
    reconCost: recon.reconCost,
    canAffordRecon: recon.canAffordRecon,
    isExecutingRecon,
    hasAlreadyAttackedThisTurn,
    forecast,
    infantryToDeploy,
    setInfantryToDeploy,
    armorToDeploy,
    setArmorToDeploy,
    airForceToDeploy,
    setAirForceToDeploy,
    dronesToLaunch,
    setDronesToLaunch,
    isSubmitting,
    handleExecuteQuickRecon,
    handleAutoOptimizeDeploy,
    handleExecuteAttack,
  };
}
