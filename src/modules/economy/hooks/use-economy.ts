import { useCallback, useMemo } from "react";
import type { GameAction } from "@/core/types/actions.types";
import { InfrastructureManager } from "../domain/infrastructure-manager";
import { IndustrialLevelManager } from "../domain/industrial-level-manager";
import type { Nation } from "@/core/types/nation.types";

export function useEconomy(
  nation: Nation | undefined,
  dispatch: (action: GameAction) => void,
) {
  const infraManager = useMemo(() => new InfrastructureManager(), []);
  const industrialManager = useMemo(() => new IndustrialLevelManager(), []);

  const canUpgradeInfrastructure = useCallback((): boolean => {
    if (!nation) {
      return false;
    }
    return infraManager.evaluateUpgrade(nation).canAfford;
  }, [nation, infraManager]);

  const getInfrastructureUpgradeCost = useCallback((): number => {
    if (!nation) {
      return 0;
    }
    return infraManager.getUpgradeCost(nation.geography.infrastructureLevel);
  }, [nation, infraManager]);

  const upgradeInfrastructure = useCallback(() => {
    if (!nation) {
      return;
    }
    dispatch({
      id: `upgrade-infra-${Date.now()}`,
      nationId: nation.id,
      type: "INVEST_INFRASTRUCTURE",
    });
  }, [nation, dispatch]);

  const canUpgradeIndustry = useCallback((): boolean => {
    if (!nation) {
      return false;
    }
    return industrialManager.evaluateUpgrade(nation).canAfford;
  }, [nation, industrialManager]);

  const getIndustryUpgradeCost = useCallback((): number => {
    if (!nation) {
      return 0;
    }
    return industrialManager.getUpgradeCost(nation.industrialLevel);
  }, [nation, industrialManager]);

  const upgradeIndustry = useCallback(() => {
    if (!nation) {
      return;
    }
    dispatch({
      id: `upgrade-industry-${Date.now()}`,
      nationId: nation.id,
      type: "UPGRADE_INDUSTRIAL_LEVEL",
    });
  }, [nation, dispatch]);

  const changeTaxRate = useCallback(
    (newRate: number) => {
      if (!nation) {
        return;
      }
      dispatch({
        id: `set-tax-${Date.now()}`,
        nationId: nation.id,
        type: "SET_TAX_RATE",
        newRate,
      });
    },
    [nation, dispatch],
  );

  return {
    canUpgradeInfrastructure,
    getInfrastructureUpgradeCost,
    upgradeInfrastructure,
    canUpgradeIndustry,
    getIndustryUpgradeCost,
    upgradeIndustry,
    changeTaxRate,
  };
}
