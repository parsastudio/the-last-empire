import { useMemo } from "react";
import type { GameState } from "@/core/types/game-state.types";
import type { Nation } from "@/core/types/nation.types";
import { NationManager } from "../domain/nation-manager";

export function useNation(state: GameState | null, nationId: string) {
  const manager = useMemo(() => new NationManager(), []);

  const nation = useMemo((): Nation | undefined => {
    if (!state) {
      return undefined;
    }
    return state.nations[nationId];
  }, [state, nationId]);

  const isHealthy = useMemo((): boolean => {
    if (!nation) {
      return false;
    }
    return manager.isHealthy(nation);
  }, [nation, manager]);

  const totalArmyCount = useMemo((): number => {
    if (!nation) {
      return 0;
    }
    return manager.getTotalArmyCount(nation);
  }, [nation, manager]);

  const flagUrl = useMemo((): string => {
    if (!nation) {
      return "";
    }
    return manager.getFlagUrl(nation);
  }, [nation, manager]);

  return {
    nation,
    isHealthy,
    totalArmyCount,
    flagUrl,
  };
}
